'use server'
import { Note } from "@prisma/client";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function get_tags(note: Note, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: `title: ${note.title}\ncontent: ${note.content}`,
        config: {
          systemInstruction: "Generate 3 to 4 tags for this note. Each tag should be 1-2 words max.",
          responseMimeType: 'application/json',
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          }
        },
      });
      if (!response.text) {
        return;
      }

      return JSON.parse(response.text);
    } catch (error: unknown) {
      // Check for 503 Service Unavailable or other transient errors if needed
      const err = error as { status?: number };
      if (err.status === 503 && i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}

