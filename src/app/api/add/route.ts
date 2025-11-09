import { NextRequest, NextResponse } from "next/server";
import { Metadata } from "chromadb";
import { Note } from "@/generated/prisma/client";
import { getMyCollection } from "@/lib/chroma";

interface AddDataRequest {
  ids: string[];
  documents: string[];
  metadatas: Metadata[];
}

// For bulk uploading notes //
// function formatNotes(notes: Array<Note>) {
//   return {
//     ids: notes.map(note => note.id.toString()),
//     documents: notes.map(note => `${note.title}\n${note.content}`),
//     metadatas: notes.map(note => ({
//       tags: note.tags.join(', '),
//       createdAt: note.createdAt.toString()
//     }))
//   }
// }

function formatNote(note: Note) {
  return {
    ids: [note.id.toString()],
    documents: [`${note.title}\n${note.content}`],
    metadatas: [{
      tags: note.tags.join(', '),
      createdAt: note.createdAt.toString()
    }]
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Note = await request.json();
    const note: AddDataRequest = formatNote(data);
    const collection = await getMyCollection();

    await collection.add({
      ids: note.ids,
      documents: note.documents,
      metadatas: note.metadatas,
    });

    return NextResponse.json({
      success: true,
      message: "Data added successfully",
      data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to add data" },
      { status: 500 },
    );
  }
}


