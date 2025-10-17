import { Hostel } from '@/types/hostel';
import { FacebookPost } from '@/types/facebook';


// Batch size for parallel processing (configurable via env)
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '3', 10);
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10);
const BASE_DELAY = parseInt(process.env.RETRY_BASE_DELAY || '2000', 10);
const BATCH_DELAY = parseInt(process.env.BATCH_DELAY || '2000', 10);

interface ExtractionResult {
  success: boolean;
  data?: Partial<Hostel> & { fbPostId: string };
  error?: string;
  fbPostId: string;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract hostel data from a single Facebook post with retry logic
 */
export async function extractSingleHostelData(
  fbPost: FacebookPost,
  retryCount = 0
): Promise<Partial<Hostel>> {
  // Validate required fields
  if (!fbPost.text || fbPost.text.trim() === '') {
    throw new Error('Post text is empty or missing');
  }

  // Safe access to fields with fallbacks
  const text = fbPost.text || '';
  const groupTitle = fbPost.groupTitle || 'Unknown Group';
  const userName = fbPost.user?.name || 'Anonymous';
  const postUrl = fbPost.url || '';

  const prompt = `
Bạn là một AI chuyên trích xuất thông tin từ bài đăng phòng trọ trên Facebook.

Dữ liệu đầu vào:
- Nội dung: ${text}
- Tên nhóm: ${groupTitle}
- Người đăng: ${userName}
- Link: ${postUrl}

Hãy trích xuất thông tin sau và trả về JSON:
{
  "title": "Tiêu đề ngắn gọn của phòng trọ",
  "description": "Mô tả chi tiết",
  "address": "Địa chỉ cụ thể",
  "district": "Quận/Huyện",
  "ward": "Phường/Xã (nếu có)",
  "price": số tiền (VNĐ),
  "area": diện tích (m²) hoặc 0 nếu không có,
  "amenities": ["tiện nghi 1", "tiện nghi 2"],
  "rules": ["quy định 1", "quy định 2"],
  "contactPhone": "số điện thoại",
  "depositRequired": số tiền đặt cọc (VNĐ) hoặc null,
  "utilities": {
    "electricity": "giá điện hoặc null",
    "water": "giá nước hoặc null",
    "internet": true/false,
    "parking": true/false
  },
  "roomType": "single" | "shared" | "apartment" | "studio" | null
}

Lưu ý:
- Nếu không tìm thấy thông tin, để null hoặc []
- Price luôn phải là số (VNĐ), nếu viết 3tr thì là 3000000, 2tr5 là 2500000
- Area là diện tích m²
- RoomType: single (phòng đơn), shared (phòng chung), apartment (căn hộ), studio
`;


  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts structured data from Vietnamese hostel posts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    // Handle rate limiting with retry
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        const retryDelay = BASE_DELAY * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limited. Retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(retryDelay);
        return extractSingleHostelData(fbPost, retryCount + 1);
      }
      throw new Error('Rate limit exceeded after maximum retries');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseData = await response.json();

    // Validate response structure
    if (!responseData?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenRouter API');
    }

    return parseHostelData(fbPost, responseData);
  } catch (error) {
    // If it's a rate limit error and we have retries left, throw to retry
    if (error instanceof Error && error.message.includes('Rate limit') && retryCount < MAX_RETRIES) {
      const retryDelay = BASE_DELAY * Math.pow(2, retryCount);
      await sleep(retryDelay);
      return extractSingleHostelData(fbPost, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Parse hostel data from API response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseHostelData(fbPost: FacebookPost, responseData: any): Partial<Hostel> {

  const extractedData = JSON.parse(responseData.choices[0].message.content || '{}');

  // Extract images from attachments with safe access
  const images = fbPost.attachments?.filter((att) => att?.image?.uri)?.map((att) => att.image!.uri) || [];

  // Combine AI-extracted data with Facebook metadata
  const hostelData: Partial<Hostel> = {
    ...extractedData,
    thumbnail: images[0] || '',
    images: images,
    postedBy: {
      name: fbPost.user?.name || 'Anonymous',
      fbId: fbPost.user?.id || 'unknown',
    },
    postedAt: fbPost.time ? new Date(fbPost.time) : new Date(),
    fbLink: fbPost.url || '',
    fbGroupName: fbPost.groupTitle || 'Unknown Group',
    available: true,
  };

  return hostelData;
}


/**
 * Batch process multiple Facebook posts with parallel execution
 * Processes in chunks to avoid rate limits and memory issues
 */
export async function extractHostelDataBatch(fbPosts: FacebookPost[]): Promise<ExtractionResult[]> {
  const results: ExtractionResult[] = [];

  // Process in batches
  for (let i = 0; i < fbPosts.length; i += BATCH_SIZE) {
    const batch = fbPosts.slice(i, i + BATCH_SIZE);

    // Process batch in parallel with error handling for each post
    const batchPromises = batch.map(async (fbPost): Promise<ExtractionResult> => {
      try {
        // Skip posts without legacyId
        if (!fbPost?.legacyId) {
          return {
            success: false,
            fbPostId: 'unknown',
            error: 'Missing legacyId',
          };
        }

        // Skip posts without text content
        if (!fbPost.text || fbPost.text.trim() === '') {
          return {
            success: false,
            fbPostId: fbPost.legacyId,
            error: 'Post text is empty',
          };
        }

        const data = await extractSingleHostelData(fbPost);

        // Validate required fields
        if (!data.title || !data.price) {
          return {
            success: false,
            fbPostId: fbPost.legacyId,
            error: 'Missing required fields: title or price',
          };
        }

        return {
          success: true,
          data: {
            ...data,
            fbPostId: fbPost.legacyId,
          },
          fbPostId: fbPost.legacyId,
        };
      } catch (error) {
        const postId = fbPost?.legacyId || 'unknown';
        console.error(`Error processing post ${postId}:`, error);
        return {
          success: false,
          fbPostId: postId,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);

    // Process results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Batch processing error:', result.reason);
        results.push({
          success: false,
          fbPostId: 'unknown',
          error: 'Processing failed',
        });
      }
    });

    // Add delay between batches to respect rate limits
    if (i + BATCH_SIZE < fbPosts.length) {
      await sleep(BATCH_DELAY);
    }
  }

  return results;
}

// Optional: Add geocoding for coordinates
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCoordinates(_address: string): Promise<{ lat: number; lng: number } | null> {
  // You can use Google Geocoding API or similar
  // For now, return null
  return null;
}