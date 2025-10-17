import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    // Get some recent hostels for context
    const recentHostels = await prisma.hostel.findMany({
      take: 10,
      orderBy: { postedAt: 'desc' },
      select: {
        id: true,
        title: true,
        price: true,
        district: true,
        address: true,
        area: true,
        amenities: true,
      },
    });

    const systemPrompt = `
Bạn là một trợ lý AI chuyên tư vấn về phòng trọ tại Hà Nội. 
Bạn có thể:
- Tư vấn về giá, địa điểm, diện tích phòng
- Giải đáp thắc mắc về tiện nghi, quy định
- Giúp tìm phòng phù hợp với nhu cầu
- Giải thích về các quận, phường ở Hà Nội

Danh sách một số phòng trọ hiện có:
${JSON.stringify(recentHostels, null, 2)}

Hãy trả lời một cách thân thiện, hữu ích và chuyên nghiệp.
`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content;

    return NextResponse.json({
      message: reply,
      conversationHistory: [...messages, { role: 'assistant', content: reply }],
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}