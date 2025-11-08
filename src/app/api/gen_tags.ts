'use server'
import { Note } from "@/generated/prisma/client";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function get_tags(note: Note) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `title: ${note.title}\ncontent: ${note.content}`,
    config: {
      systemInstruction: "You are to generate tags for the note you get. the tags must contain only or two words, try to keep it a word. There should be 3-4 tags generated. give tags as an array",
      responseMimeType: 'application/json',
    },
  });
  if (!response.text) {
    return
  }

  return JSON.parse(response.text);
  // return response
}

