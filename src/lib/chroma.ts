import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";
import { GoogleGenAI } from "@google/genai";
import { CloudClient, Collection } from "chromadb";

// --- Type-safe global cache ---
const globalForChroma = globalThis as unknown as {
  _geminiEmbedder?: GoogleGeminiEmbeddingFunction;
  _genAI?: GoogleGenAI;
  _chromaClient?: CloudClient;
  _myCollection?: Collection;
};

// --- Singleton: Embedding Function ---
if (!globalForChroma._geminiEmbedder) {
  globalForChroma._geminiEmbedder = new GoogleGeminiEmbeddingFunction({
    apiKey: process.env.GEMINI_API_KEY!,
    modelName: "gemini-embedding-001",
  });
}
export const embedder = globalForChroma._geminiEmbedder;

// --- Singleton: GenAI Client ---
if (!globalForChroma._genAI) {
  globalForChroma._genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
}
export const genAI = globalForChroma._genAI;

// --- Singleton: Chroma Cloud Client ---
if (!globalForChroma._chromaClient) {
  globalForChroma._chromaClient = new CloudClient();
}
export const chromaClient = globalForChroma._chromaClient;

// --- Lazy Singleton: Collection ---
export async function getMyCollection() {
  if (!globalForChroma._myCollection) {
    globalForChroma._myCollection = await chromaClient.getOrCreateCollection({
      name: "notes",
      embeddingFunction: embedder,
    });
  }
  return globalForChroma._myCollection;
}

