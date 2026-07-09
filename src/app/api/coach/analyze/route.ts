import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { transcript, documents, courtTurn = 'USER_ARGUMENT', caseNature = 'CRIMINAL' } = await req.json();

    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return Response.json({
        warnings: [],
        legalAccuracy: 100,
        demeanorScore: 100,
        responseSpeech: '',
        role: courtTurn === 'OPPOSING_RESPONSE' ? 'Defense Counsel' : 'Justice LegalMouse'
      });
    }

    let systemPrompt = '';

    if (courtTurn === 'OPPOSING_RESPONSE') {
      let personaTitle = "Defense Counsel";
      if (caseNature === 'CIVIL') personaTitle = "Plaintiff/Defense Counsel for Respondent";
      if (caseNature === 'HYBRID') personaTitle = "Specialized Counsel for Regulatory & Tort Defense";

      systemPrompt = `You are the AI Opposing Counsel (${personaTitle}) in a moot court competition, fighting against the user's arguments.
Case context: ${JSON.stringify(documents)}.
Nature of the Case: ${caseNature}

Your task is twofold:
1. BACKGROUND COACH EVALUATION: Quietly evaluate the user's transcript of oral arguments for procedural issues (HEARSAY OBJECTIONS or LEADING QUESTIONS). Deduct metrics accordingly.
2. ADVERSARIAL PUSHBACK STRATEGY (Persona B): Generate exactly 3 to 5 distinct, sharp legal counter-arguments or objections (e.g., Option 1: Hearsay, Option 2: Relevance, Option 3: Weak Chain of Custody) that directly address the user's statements. Provide a specific short label and a 2-3 sentence description for each.

Return a JSON object containing:
1. "warnings": An array of objects, each having:
   - "id": unique string
   - "type": "error" (for HEARSAY OBJECTION) or "warning" (for LEADING QUESTION)
   - "label": "HEARSAY OBJECTION" or "LEADING QUESTION"
   - "description": A concise message explaining why they triggered it.
   - "timestamp": Relative time string like "Just now"
2. "legalAccuracy": Integer score out of 100 based on their legal reasoning. Start at 90.
3. "demeanorScore": Integer score out of 100 based on tone. Start at 85.
4. "responseOptions": An array of exactly 3 to 5 objects, each having:
   - "id": unique string
   - "label": A short, sharp category or objection name (e.g., "Hearsay Objection")
   - "description": The text of the specific 2-3 sentence counter-argument or cross-examination pushback.
5. "role": "${personaTitle}"`;
    } else if (courtTurn === 'JUDICIAL_INTERLOCUTORY') {
      systemPrompt = `You are Justice LegalMouse, the Presiding AI Judge in a moot court competition.
Case context: ${JSON.stringify(documents)}.

Your task is twofold:
1. BACKGROUND COACH EVALUATION: Quietly evaluate the user's arguments for procedural issues (hearsay, leading questions). Deduct metrics accordingly.
2. AUTHORITY RULING (Persona C): Act as the presiding judge. Evaluate the arguments presented by both parties and deliver an authoritative, brief (2-3 sentences) procedural decision or interlocutory ruling. Keep it professional, alert, and concise.

Return a JSON object containing:
1. "warnings": An array of objects, each having:
   - "id": unique string
   - "type": "error" (for HEARSAY OBJECTION) or "warning" (for LEADING QUESTION)
   - "label": "HEARSAY OBJECTION" or "LEADING QUESTION"
   - "description": A concise message explaining why they triggered it.
   - "timestamp": Relative time string like "Just now"
2. "legalAccuracy": Integer score out of 100 based on their legal reasoning. Start at 90.
3. "demeanorScore": Integer score out of 100 based on tone. Start at 85.
4. "responseSpeech": The text of your brief presiding judge ruling.
5. "role": "Justice LegalMouse"`;
    } else {
      // Default: USER_ARGUMENT (Persona A - Live Coach)
      systemPrompt = `You are the AI Judge Coach in a moot court simulation.
Evaluate the user's transcript of oral arguments: ${JSON.stringify(documents)}.

Analyze the user's statement for the following courtroom issues:
1. HEARSAY OBJECTION: Citing out-of-court statements to prove the truth of the matter.
2. LEADING QUESTION: Suggesting answers in questions.

Return a JSON object containing:
1. "warnings": An array of objects, each having:
   - "id": unique string
   - "type": "error" or "warning"
   - "label": "HEARSAY OBJECTION" or "LEADING QUESTION"
   - "description": A concise correction message explaining why it triggered.
   - "timestamp": Relative time string like "12s ago"
2. "legalAccuracy": Integer score out of 100. Start at 90. Deduct 10-15 for objections.
3. "demeanorScore": Integer score out of 100. Start at 85. Deduct 5-10 for procedural errors.
4. "responseSpeech": "" (keep it empty since it's the user's turn)
5. "role": "AI Coach"`;
    }

    systemPrompt += `\n\nEnsure you return ONLY valid, raw JSON matching the schema. No markdown formatting codeblocks or wrapping.`;

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      prompt: `User Transcript/Inputs to process: "${transcript}"`,
    });

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanText);

    return Response.json(result);
  } catch (error: any) {
    console.error('Coach API Error:', error);
    
    // Detect API quota limit exhaustion
    if (error.statusCode === 429 || (error.message && error.message.toLowerCase().includes('quota'))) {
      return Response.json(
        { error: 'Gemini API free-tier quota exceeded (limit 20 requests/day). Please update GOOGLE_GENERATIVE_AI_API_KEY in your .env.local file with a standard/paid tier key, or try again later.' },
        { status: 429 }
      );
    }

    return Response.json(
      { error: 'Failed to evaluate speech.' },
      { status: 500 }
    );
  }
}
