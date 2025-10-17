import { FacebookPost } from '@/types/facebook';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

/**
 * Generate a content hash for duplicate detection
 * Combines key information to identify similar posts
 */
export function generateContentHash(post: FacebookPost): string {
  // Normalize text: remove extra spaces, lowercase, remove special chars
  const normalizedText = post.text
    ?.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9\s]/gi, '')
    .trim() || '';

  // Extract first image URL for comparison
  const firstImage = post.attachments
    ?.find(att => att?.image?.uri)
    ?.image?.uri || '';

  // Create hash from text + user + group (to identify truly identical posts)
  const userId = post.user?.id || 'unknown';
  const groupId = post.facebookId || 'unknown';
  const content = `${normalizedText}|${userId}|${groupId}|${firstImage}`;

  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

/**
 * Generate a similarity hash for finding similar hostels
 * (different posts but same hostel/room)
 */
export function generateSimilarityHash(post: FacebookPost): string {
  const text = post.text?.toLowerCase() || '';

  // Extract phone number
  const phoneMatch = text.match(/\d{10,11}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract address (simple heuristic)
  const addressParts = text.match(/\d+\s+[^\n,]+/);
  const address = addressParts ? addressParts[0] : '';

  // Create similarity hash from key identifying features
  const groupId = post.facebookId || 'unknown';
  const content = `${phone}|${address}|${groupId}`;

  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateType: 'exact' | 'similar' | 'none';
  existingId?: string;
  reason?: string;
}

/**
 * Check if a Facebook post is a duplicate
 */
export async function checkDuplicate(post: FacebookPost): Promise<DuplicateCheckResult> {
  // Validate required field
  if (!post.legacyId) {
    return {
      isDuplicate: false,
      duplicateType: 'none',
      reason: 'Missing legacyId',
    };
  }

  // Check 1: Exact Facebook post ID
  const existingById = await prisma.hostel.findUnique({
    where: { id: post.legacyId },
    select: { id: true, title: true },
  });

  if (existingById) {
    return {
      isDuplicate: true,
      duplicateType: 'exact',
      existingId: existingById.id,
      reason: `Post already exists with ID ${post.legacyId}`,
    };
  }

  // Check 2: Content hash (exact duplicate content)
  const contentHash = generateContentHash(post);
  const existingByContent = await prisma.hostel.findFirst({
    where: {
      rawFbData: {
        path: ['contentHash'],
        equals: contentHash,
      },
    },
    select: { id: true, title: true },
  });

  if (existingByContent) {
    return {
      isDuplicate: true,
      duplicateType: 'exact',
      existingId: existingByContent.id,
      reason: `Duplicate content detected (same text + user + group)`,
    };
  }

  // Check 3: Similarity hash (similar hostel, different post)
  // This is more lenient - same phone/address but different post
  const similarityHash = generateSimilarityHash(post);
  if (post.contactPhone || similarityHash !== crypto.createHash('md5').update('||').digest('hex')) {
    const existingBySimilarity = await prisma.hostel.findFirst({
      where: {
        rawFbData: {
          path: ['similarityHash'],
          equals: similarityHash,
        },
        // Only check recent posts (last 30 days)
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { id: true, title: true, fbLink: true },
    });

    if (existingBySimilarity) {
      return {
        isDuplicate: true,
        duplicateType: 'similar',
        existingId: existingBySimilarity.id,
        reason: `Similar hostel found (same phone/address) - ${existingBySimilarity.title}`,
      };
    }
  }

  return {
    isDuplicate: false,
    duplicateType: 'none',
  };
}

/**
 * Batch check for duplicates
 * Returns array of posts that are NOT duplicates
 */
export async function filterDuplicates(
  posts: FacebookPost[],
  options: {
    skipExact?: boolean; // Skip exact duplicates
    skipSimilar?: boolean; // Skip similar posts
  } = { skipExact: true, skipSimilar: false }
): Promise<{
  uniquePosts: FacebookPost[];
  duplicates: Array<{ post: FacebookPost; result: DuplicateCheckResult }>;
}> {
  const results = await Promise.all(
    posts.map(async (post) => ({
      post,
      duplicateCheck: await checkDuplicate(post),
    }))
  );

  const uniquePosts: FacebookPost[] = [];
  const duplicates: Array<{ post: FacebookPost; result: DuplicateCheckResult }> = [];

  results.forEach(({ post, duplicateCheck }) => {
    const shouldSkip =
      (options.skipExact && duplicateCheck.duplicateType === 'exact') ||
      (options.skipSimilar && duplicateCheck.duplicateType === 'similar');

    if (shouldSkip && duplicateCheck.isDuplicate) {
      duplicates.push({ post, result: duplicateCheck });
    } else {
      uniquePosts.push(post);
    }
  });

  return { uniquePosts, duplicates };
}

/**
 * Add hashes to hostel raw data for future duplicate detection
 */
export function enrichRawDataWithHashes(post: FacebookPost): any {
  return {
    ...post,
    contentHash: generateContentHash(post),
    similarityHash: generateSimilarityHash(post),
  };
}

