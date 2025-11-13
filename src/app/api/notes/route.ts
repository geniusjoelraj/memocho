import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma.ts";
import { get_tags } from "../gen_tags.ts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  let idParams = searchParams.get("id") || "";
  const id = Number(idParams)

  console.log(searchParams);

  if (id) {
    const note = await prisma.note.findUnique({ where: { id } })
    return NextResponse.json(note);
  }

  const notes = await prisma.note.findMany();
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.title) {
    return NextResponse.json({ error: "Title is required", status: 400 })
  }

  const note = await prisma.note.create({
    data: {
      id: body.id,
      title: body.title,
      content: body.content || ""
    }
  })
  return NextResponse.json({ note }, { status: 201 })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  let idParams = searchParams.get("id") || "";
  const id = Number(idParams)
  try {
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url)
  let idParams = searchParams.get("id") || "";
  const id = Number(idParams)

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
  }

  const body = await req.json();

  if (!body.title && !body.content) {
    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.note.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.content && { content: body.content }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const id = Number(body.id);
  const gen_tags = await get_tags(body)
  const updated = await prisma.note.update({
    where: { id },
    data: {
      ...(gen_tags && { tags: gen_tags }),
    }
  })
  return NextResponse.json(updated);
}
