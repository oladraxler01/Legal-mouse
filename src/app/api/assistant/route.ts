import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return Response.json(
        { error: 'No transcript provided.' },
        { status: 400 }
      );
    }

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `You are LegalMouse, an authentic, supportive, and clever legal study companion. Speak in a casual, clear, and friendly tone—like a helpful peer chatting at a coffee shop, not a rigid academic textbook. Validate the user dynamically, keep your responses concise (under 3 sentences so it is easy to listen to), and use natural conversational transitions. If a user asks a complex question, break it down using simple analogies instead of heavy legalese. Never use markdown formatting, bullet points, numbered lists, asterisks, or hashtags—your responses will be read aloud via text-to-speech and must sound completely natural when spoken. When explaining cases, weave the facts, issue, and outcome into a flowing narrative sentence rather than listing them.`,
      prompt: transcript,
    });

    return Response.json({ reply: text });
  } catch (error) {
    console.error('Assistant API Error:', error);
    return Response.json(
      { error: 'Failed to generate a response.' },
      { status: 500 }
    );
  }
}
