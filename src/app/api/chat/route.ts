import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const coreMessages = messages.map((m: any) => {
    let content = '';
    if (Array.isArray(m.parts)) {
      content = m.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join('\n');
    } else if (typeof m.content === 'string') {
      content = m.content;
    }
    return {
      role: m.role,
      content,
    };
  });

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: coreMessages,
    system: `You are the Legal Mouse AI Assistant. 
    You help law students understand complex legal concepts. 
    Always use clear, structured language. 
    When explaining cases, break them down into Facts, Issues, and Decisions. 
    Use a professional yet accessible tone.`,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error('Chat API Error:', error);
    }
  });
}
