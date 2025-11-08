import { NextResponse } from "next/server";
import { ChromaClient } from "chromadb";
import { GoogleGeminiEmbeddingFunction } from "@chroma-core/google-gemini";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let collection: any = null;

async function getCollection() {
  if (!collection) {
    const client = new ChromaClient({ port: 8123 });
    const embedder = new GoogleGeminiEmbeddingFunction({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    collection = await client.getOrCreateCollection({
      name: "ainotes",
      embeddingFunction: embedder,
    });
  }
  return collection;
}

// POST request handler
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const collection = await getCollection();

    if (data.action === "add") {
      const { ids, documents, metadatas } = data;

      if (!ids || !documents) {
        return NextResponse.json(
          { error: "Missing ids or documents field" },
          { status: 400 }
        );
      }

      await collection.add({ ids, documents, metadatas });

      return NextResponse.json({ message: "Notes added successfully" });
    }

    if (data.action === "query") {
      const { queryTexts, nResults = 3 } = data;

      if (!queryTexts) {
        return NextResponse.json(
          { error: "Missing queryTexts field" },
          { status: 400 }
        );
      }

      const results = await collection.query({
        queryTexts,
        nResults,
      });

      return NextResponse.json(results);
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'add' or 'query'." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Chroma API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

