import { extractHostelDataBatch } from '@/lib/ai/dataExtractor';
import { FacebookPost } from '@/types/facebook';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { filterDuplicates, enrichRawDataWithHashes } from '@/lib/utils/duplicateDetection';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // Get dataset URL from Apify webhook
    const body = await request.json();
    const { resource: { defaultDatasetId } } = body;

    if (!defaultDatasetId) {
      return NextResponse.json(
        { error: 'Missing datasetUrl in request body' },
        { status: 400 }
      );
    }

    // Options for duplicate handling (can be passed in webhook body)
    const skipExactDuplicates = body.skipExactDuplicates ?? true;
    const skipSimilarDuplicates = body.skipSimilarDuplicates ?? false;

    // Fetch Facebook posts from dataset
    const res = await fetch(`https://api.apify.com/v2/datasets/${defaultDatasetId}/items?clean=true&format=json`);
    if (!res.ok) {
      throw new Error(`Failed to fetch dataset: ${res.statusText}`);
    }

    const fbPosts: FacebookPost[] = await res.json();

    // Validate posts array
    if (!Array.isArray(fbPosts)) {
      throw new Error('Invalid dataset format: expected array of posts');
    }

    console.log(`[Webhook] Received ${fbPosts.length} posts`);

    if (fbPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No posts to process',
        totalPosts: 0,
        duplicates: 0,
        processed: 0,
        saved: 0,
        failed: 0,
      });
    }

    // Step 1: Filter out invalid posts and duplicates
    const validPosts = fbPosts.filter(post => {
      // Must have legacyId and text
      if (!post?.legacyId || !post?.text) {
        console.log(`[Webhook] Skipping invalid post: ${post?.legacyId || 'unknown'}`);
        return false;
      }
      return true;
    });

    console.log(`[Webhook] Valid posts: ${validPosts.length}/${fbPosts.length}`);

    if (validPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No valid posts to process',
        totalPosts: fbPosts.length,
        validPosts: 0,
        duplicates: 0,
        processed: 0,
        saved: 0,
        failed: 0,
      });
    }

    // Filter duplicates BEFORE AI processing (save costs!)
    const { uniquePosts, duplicates } = await filterDuplicates(validPosts, {
      skipExact: skipExactDuplicates,
      skipSimilar: skipSimilarDuplicates,
    });

    // If all posts are duplicates, return early
    if (uniquePosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All posts are duplicates, nothing to process',
        totalPosts: fbPosts.length,
        duplicates: duplicates.length,
        processed: 0,
        saved: 0,
        failed: 0,
        duplicateDetails: duplicates.map(d => ({
          fbPostId: d.post.legacyId,
          type: d.result.duplicateType,
          reason: d.result.reason,
          existingId: d.result.existingId,
        })),
      });
    }

    // Step 2: Extract structured data using AI (batch processing)
    // Only process unique posts to save AI costs
    const extractionResults = await extractHostelDataBatch(uniquePosts);

    // Step 3: Process successful extractions and save to database
    const saveResults = await Promise.allSettled(
      extractionResults
        .filter((result) => result.success && result.data)
        .map(async (result) => {
          try {
            const hostelData = result.data!;

            // Validate critical fields before saving
            if (!hostelData.title || !hostelData.price || !result.fbPostId) {
              throw new Error('Missing required fields for database save');
            }

            // Optional: Get coordinates (can be skipped for performance)
            // if (hostelData.address) {
            //   hostelData.coordinates = await getCoordinates(hostelData.address);
            // }

            // Find original Facebook post for raw data
            const originalPost = uniquePosts.find(post => post.legacyId === result.fbPostId);

            // Enrich raw data with hashes for future duplicate detection
            const enrichedRawData = originalPost
              ? enrichRawDataWithHashes(originalPost)
              : {};

            // Prepare safe data for database
            const safePostedBy = hostelData.postedBy || { name: 'Anonymous', fbId: 'unknown' };
            const safePostedAt = hostelData.postedAt || new Date();
            const safeFbLink = hostelData.fbLink || '';
            const safeFbGroupName = hostelData.fbGroupName || 'Unknown Group';

            // Save to database (upsert to handle duplicates)
            const hostel = await prisma.hostel.upsert({
              where: { id: result.fbPostId },
              create: {
                id: result.fbPostId,
                title: hostelData.title,
                description: hostelData.description || '',
                thumbnail: hostelData.thumbnail || '',
                address: hostelData.address || '',
                district: hostelData.district || '',
                ward: hostelData.ward || null,
                price: hostelData.price,
                area: hostelData.area || 0,
                postedBy: safePostedBy,
                postedAt: safePostedAt,
                fbLink: safeFbLink,
                fbGroupName: safeFbGroupName,
                coordinates: hostelData.coordinates ?? Prisma.DbNull,
                amenities: hostelData.amenities || [],
                rules: hostelData.rules || [],
                images: hostelData.images || [],
                contactPhone: hostelData.contactPhone || null,
                depositRequired: hostelData.depositRequired || null,
                utilities: hostelData.utilities || {},
                roomType: hostelData.roomType || null,
                available: true,
                // Store enriched raw data with hashes for duplicate detection
                rawFbData: enrichedRawData,
              },
              update: {
                // Update fields that might change
                title: hostelData.title,
                description: hostelData.description || '',
                price: hostelData.price,
                available: true,
                images: hostelData.images || [],
                // Update raw data with latest version
                rawFbData: enrichedRawData,
              },
            });

            return { success: true, hostelId: hostel.id };
          } catch (error) {
            console.error(`Error saving hostel ${result.fbPostId}:`, error);
            return {
              success: false,
              hostelId: result.fbPostId,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
    );

    // Calculate statistics
    const successfulExtractions = extractionResults.filter((r) => r.success).length;
    const failedExtractions = extractionResults.filter((r) => !r.success).length;
    const successfulSaves = saveResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failedSaves = saveResults.filter(
      (r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    const exactDuplicates = duplicates.filter(d => d.result.duplicateType === 'exact').length;
    const similarDuplicates = duplicates.filter(d => d.result.duplicateType === 'similar').length;

    console.log(`[Webhook] Complete: ${successfulSaves}/${fbPosts.length} saved, ${duplicates.length} duplicates, ${failedExtractions + failedSaves} errors`);

    return NextResponse.json({
      success: true,
      message: 'Batch processing complete',
      stats: {
        totalPosts: fbPosts.length,
        duplicates: {
          total: duplicates.length,
          exact: exactDuplicates,
          similar: similarDuplicates,
        },
        uniquePosts: uniquePosts.length,
        aiExtraction: {
          successful: successfulExtractions,
          failed: failedExtractions,
        },
        databaseSave: {
          successful: successfulSaves,
          failed: failedSaves,
        },
      },
      duplicateDetails: duplicates.map(d => ({
        fbPostId: d.post.legacyId,
        type: d.result.duplicateType,
        reason: d.result.reason,
        existingId: d.result.existingId,
      })),
      errors: extractionResults
        .filter((r) => !r.success)
        .map((r) => ({ fbPostId: r.fbPostId, error: r.error })),
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}