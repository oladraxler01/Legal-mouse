import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { transcript, documents } = await req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return Response.json({
        warnings: [],
        legalAccuracy: 100,
        demeanorScore: 100,
      });
    }

    const systemPrompt = `You are the AI Judge Coach in a moot court simulation.
Evaluate the user's transcript of oral arguments and any uploaded document titles: ${JSON.stringify(documents)}.

Analyze the user's statement for the following courtroom issues:
1. HEARSAY OBJECTION: If the user cites unverified out-of-court statements/testimonies to prove the truth of the matter asserted rather than direct evidence.
2. LEADING QUESTION: If the user frames a leading question during a direct examination phase (e.g. suggesting the answer in the question).

Return a JSON object containing:
1. "warnings": An array of objects, each having:
   - "id": unique string
   - "type": either "error" (for HEARSAY OBJECTION) or "warning" (for LEADING QUESTION)
   - "label": "HEARSAY OBJECTION" or "LEADING QUESTION"
   - "description": A concise correction message explaining why it triggered and how to correct it.
   - "timestamp": Current relative time string like "Just now" or "Recently"
2. "legalAccuracy": An integer score out of 100 based on their arguments. Start at 90. Deduct 10-15 points for objections found.
3. "demeanorScore": An integer score out of 100 based on tone/formality. Start at 85. Deduct 5-10 points for procedural mistakes.

Ensure you return ONLY valid, raw JSON matches the schema. No markdown formatting codeblocks.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `User Transcript to analyze: "${transcript}"`,
    });

    // Remove code block markers if returned
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    return Response.json(result);
  } catch (error) {
    console.error('Coach API Error:', error);
    return Response.json(
      { error: 'Failed to evaluate speech.' },
      { status: 500 }
    );
  }
}
