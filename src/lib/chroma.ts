import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";
import { GoogleGenAI } from "@google/genai";
// @ts-expect-error - accessing internal chromadb registry to fix HMR re-registration
import { CloudClient, Collection, knownEmbeddingFunctions } from "chromadb";

// --- Type-safe global cache ---
const g = globalThis as unknown as {
  _geminiEmbedder?: GoogleGeminiEmbeddingFunction;
  _genAI?: GoogleGenAI;
  _chromaClient?: CloudClient;
  _myCollection?: Collection;
  _collectionPromise?: Promise<Collection> | null;
};

// --- Lazy Singleton Getters ---

function getEmbedder(): GoogleGeminiEmbeddingFunction {
  if (g._geminiEmbedder) return g._geminiEmbedder;

  // Clear stale registration from HMR reloads
  if (knownEmbeddingFunctions && knownEmbeddingFunctions.has("google-generative-ai")) {
    knownEmbeddingFunctions.delete("google-generative-ai");
  }

  g._geminiEmbedder = new GoogleGeminiEmbeddingFunction({
    apiKey: process.env.GEMINI_API_KEY!,
    modelName: "gemini-embedding-001",
  });
  return g._geminiEmbedder;
}

function getGenAI(): GoogleGenAI {
  if (!g._genAI) {
    g._genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }
  return g._genAI;
}

function getChromaClient(): CloudClient {
  if (!g._chromaClient) {
    g._chromaClient = new CloudClient({
      apiKey: process.env.CHROMA_API_KEY!,
      tenant: process.env.CHROMA_TENANT!,
      database: process.env.CHROMA_DATABASE!,
    });
  }
  return g._chromaClient;
}

// --- Public exports ---
export const genAI = getGenAI();

export async function getMyCollection(): Promise<Collection> {
  if (g._myCollection) {
    return g._myCollection;
  }

  if (!g._collectionPromise) {
    g._collectionPromise = (async () => {
      try {
        const collection = await getChromaClient().getOrCreateCollection({
          name: "notes",
          embeddingFunction: getEmbedder(),
        });
        g._myCollection = collection;
        return collection;
      } catch (error) {
        g._collectionPromise = null;
        throw error;
      }
    })();
  }

  return g._collectionPromise;
}
