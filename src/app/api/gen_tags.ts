'use server'
import { Note } from "@/generated/prisma/client";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function get_tags(note: Note, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `title: ${note.title}\ncontent: ${note.content}`,
        config: {
          systemInstruction: "You are to generate tags for the note you get. the tags must contain only or two words, try to keep it a word. There should be 3-4 tags generated. give tags as an array",
          responseMimeType: 'application/json',
        },
      });
      if (!response.text) {
        return;
      }

      return JSON.parse(response.text);
    } catch (error: any) {
      // Check for 503 Service Unavailable or other transient errors if needed
      if (error.status === 503 && i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
}

