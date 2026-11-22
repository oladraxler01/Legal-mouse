import { GoogleGenAI } from "@google/genai";
import { getSessionUser, unauthorizedResponse } from "@/lib/supabaseServer";

export const maxDuration = 30;

/* Natural speech with Gemini text-to-speech.
 * Each speaker in the app gets its own prebuilt Gemini voice. */
const VOICES = {
  mouse: { voice: "Puck", style: "Say this warmly and conversationally, like a friendly study buddy" },
  judge: { voice: "Charon", style: "Say this as a calm, authoritative Nigerian High Court judge, measured and clear" },
  arbitrator: { voice: "Charon", style: "Say this as a calm, courteous arbitrator, measured and clear" },
  counsel: { voice: "Orus", style: "Say this as confident opposing counsel in a courtroom, firm but respectful" },
  narrator: { voice: "Aoede", style: "Say this as a clear, encouraging guide explaining court procedure" },
} as const;

type VoiceRole = keyof typeof VOICES;

const MAX_CHARS = 1200;
const SAMPLE_RATE = 24000; // Gemini TTS returns 16-bit mono PCM at 24 kHz

/** Wraps raw 16-bit PCM in a WAV header so browsers can play it. */
function pcmToWav(pcm: Buffer): Buffer {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export async function POST(req: Request) {
  if (!(await getSessionUser())) return unauthorizedResponse();

  const { text, role = "mouse" } = await req.json().catch(() => ({}));
  if (!text || typeof text !== "string" || !text.trim()) {
    return Response.json({ error: "No text provided." }, { status: 400 });
  }
  const preset = VOICES[(role as VoiceRole) in VOICES ? (role as VoiceRole) : "mouse"];

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY_BACKUP;
  if (!apiKey) return Response.json({ error: "Voice is not configured." }, { status: 503 });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
      contents: [{ role: "user", parts: [{ text: `${preset.style}: ${text.trim().slice(0, MAX_CHARS)}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: preset.voice } } },
      },
    });

    const data = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (!data) return Response.json({ error: "No audio returned." }, { status: 502 });

    const wav = pcmToWav(Buffer.from(data, "base64"));
    return new Response(new Uint8Array(wav), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("TTS error:", message);
    const quota = message.includes("429") || message.toLowerCase().includes("quota");
    return Response.json({ error: quota ? "Voice quota reached." : "Voice generation failed." }, { status: quota ? 429 : 500 });
  }
}
