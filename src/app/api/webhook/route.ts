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
    // Use sequential processing to avoid race conditions with upsert
    const saveResults = [];
    const skippedResults = [];

    for (const result of extractionResults) {
      try {
        // Skip failed extractions
        if (!result.success || !result.data) {
          skippedResults.push({
            fbPostId: result.fbPostId,
            reason: result.error || 'Extraction failed',
          });
          continue;
        }

        const hostelData = result.data;

        // Flexible validation - only require fbPostId and at least title OR price
        if (!result.fbPostId) {
          skippedResults.push({
            fbPostId: 'unknown',
            reason: 'Missing fbPostId',
          });
          continue;
        }

        // Skip if both title and price are missing (not a valid hostel post)
        if (!hostelData.title && !hostelData.price) {
          skippedResults.push({
            fbPostId: result.fbPostId,
            reason: 'Missing both title and price - likely not a hostel post',
          });
          continue;
        }

        // Check if already exists in DB (prevent duplicates from same batch)
        const existing = await prisma.hostel.findUnique({
          where: { id: result.fbPostId },
          select: { id: true, title: true },
        });

        if (existing) {
          console.log(`[Webhook] Skipping duplicate in batch: ${result.fbPostId}`);
          skippedResults.push({
            fbPostId: result.fbPostId,
            reason: 'Already exists in database',
          });
          continue;
        }

        // Find original Facebook post for raw data
        const originalPost = uniquePosts.find(post => post.legacyId === result.fbPostId);

        // Enrich raw data with hashes for future duplicate detection
        const enrichedRawData = originalPost
          ? enrichRawDataWithHashes(originalPost)
          : {};

        // Prepare safe data for database with better defaults
        const safeTitle = hostelData.title || `Phòng trọ ${hostelData.district || 'Hà Nội'}`;
        const safePrice = hostelData.price || 0;
        const safePostedBy = hostelData.postedBy || { name: 'Anonymous', fbId: 'unknown' };
        const safePostedAt = hostelData.postedAt || new Date();
        const safeFbLink = hostelData.fbLink || '';
        const safeFbGroupName = hostelData.fbGroupName || 'Unknown Group';

        // Save to database (create only - we already checked for existence)
        const hostel = await prisma.hostel.create({
          data: {
            id: result.fbPostId,
            title: safeTitle,
            description: hostelData.description || '',
            thumbnail: hostelData.thumbnail || '',
            address: hostelData.address || '',
            district: hostelData.district || '',
            ward: hostelData.ward || null,
            price: safePrice,
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
        });

        saveResults.push({
          status: 'fulfilled' as const,
          value: { success: true, hostelId: hostel.id }
        });
      } catch (error) {
        console.error(`Error saving hostel ${result.fbPostId}:`, error);
        saveResults.push({
          status: 'fulfilled' as const,
          value: {
            success: false,
            hostelId: result.fbPostId,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    }

    // Calculate statistics
    const successfulExtractions = extractionResults.filter((r) => r.success).length;
    const failedExtractions = extractionResults.filter((r) => !r.success).length;
    const successfulSaves = saveResults.filter(
      (r) => r.status === 'fulfilled' && r.value.success
    ).length;
    const failedSaves = saveResults.filter(
      (r) => r.status === 'fulfilled' && !r.value.success
    ).length;

    const exactDuplicates = duplicates.filter(d => d.result.duplicateType === 'exact').length;
    const similarDuplicates = duplicates.filter(d => d.result.duplicateType === 'similar').length;

    console.log(`[Webhook] Complete: ${successfulSaves}/${fbPosts.length} saved, ${duplicates.length} duplicates, ${skippedResults.length} skipped, ${failedExtractions + failedSaves} errors`);

    return NextResponse.json({
      success: true,
      message: 'Batch processing complete',
      stats: {
        totalPosts: fbPosts.length,
        validPosts: validPosts.length,
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
          skipped: skippedResults.length,
        },
      },
      duplicateDetails: duplicates.map(d => ({
        fbPostId: d.post.legacyId,
        type: d.result.duplicateType,
        reason: d.result.reason,
        existingId: d.result.existingId,
      })),
      skippedDetails: skippedResults,
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