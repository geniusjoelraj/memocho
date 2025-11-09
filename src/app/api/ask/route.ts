import { genAI, getMyCollection } from "@/lib/chroma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query: string };
    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const collection = await getMyCollection();

    // 1) Similarity search over your notes
    const search = await collection.query({
      queryTexts: [query],               // <-- use the user's query
      nResults: 5,
      include: ["documents", "metadatas", "distances"],
    });

    // Chroma returns arrays per query; we sent 1 query, so use index 0
    const docs = (search.documents?.[0] ?? []) as string[];
    const metas = (search.metadatas?.[0] ?? []) as Record<string, any>[];
    const distances = (search.distances?.[0] ?? []) as number[];

    const context = docs.map((d, i) => `[#${i + 1}] ${d}`).join("\n\n");

    // 2) Build a grounded prompt
    const prompt = [
      "You are answering strictly from the provided notes.",
      "If the notes don't contain the answer, say you don't know.",
      "Keep the answers when possible",
      "don't just put the notes as the answer frame the sentence on your own using the notes",
      "",
      "Notes:",
      context || "(no matching notes found)",
      "",
      `User question: ${query}`,
      "Answer:"
    ].join("\n");

    // 3) Call Gemini properly and serialize only the text
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    const answer = result.text;

    // Optional: return top sources
    const sources = docs.map((d, i) => ({
      note: i + 1,
      distance: distances?.[i],
      metadata: metas?.[i] ?? null,
      preview: d.slice(0, 200),
    }));

    return NextResponse.json({ answer, sources });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

