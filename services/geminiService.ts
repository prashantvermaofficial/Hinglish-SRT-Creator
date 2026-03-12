
import { GoogleGenAI } from "@google/genai";

export const generateHinglishSrt = async (audioBase64: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are an expert transcriber and translator. 
    Your task is to take an audio file and generate a high-quality SubRip Subtitle (SRT) file.
    The content of the subtitles MUST be in "Hinglish" - a natural mix of Hindi and English as commonly spoken in urban India and on social media.
    
    Guidelines:
    1. Use Devanagari script for Hindi words if appropriate, or use Romanized Hindi (Transliterated) if it feels more natural for web subtitles. For this request, use Romanized Hindi (Hinglish).
    2. Maintain accurate timestamps in SRT format (00:00:00,000 --> 00:00:00,000).
    3. Ensure the flow is natural. Use English for technical or modern terms (e.g., "laptop", "subscribe", "download", "meeting") and Hindi for verbs and connectors.
    4. Provide ONLY the raw SRT content in your response. No preamble, no explanation.
  `;

  const prompt = "Transcribe this audio and convert it into a Romanized Hinglish SRT file with accurate timestamps.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          { text: prompt }
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more consistent formatting
      },
    });

    const result = response.text;
    if (!result) {
      throw new Error("No response generated from the model.");
    }
    
    return result.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate SRT.");
  }
};
