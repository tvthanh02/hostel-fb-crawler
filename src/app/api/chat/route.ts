import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();

    type ChatMessage = {
      role: 'system' | 'user' | 'assistant';
      content: string;
    };

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

    const history: ChatMessage[] = Array.isArray(conversationHistory)
      ? (conversationHistory as ChatMessage[])
      : [];

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: String(message ?? '') },
    ];

    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o-mini',
    //   messages,
    //   temperature: 0.7,
    //   max_tokens: 500,
    // });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_CHAT_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 500
        }),
      });


      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();

      const reply = responseData.choices[0].message.content || '';

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
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}