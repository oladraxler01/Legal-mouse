import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('models/gemini-1.5-flash'),
    messages,
    system: `You are the Legal Mouse AI Assistant. 
    You help law students understand complex legal concepts. 
    Always use clear, structured language. 
    When explaining cases, break them down into Facts, Issues, and Decisions. 
    Use a professional yet accessible tone.`,
  });

  return result.toUIMessageStreamResponse();
}
