"use client";

import { useEffect, useState, use } from "react";
import type { Note } from "@/generated/prisma/client";
import { toast } from "sonner"

export default function Page({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const [note, setNote] = useState<Note | null>(null);
  const [editable, setEditable] = useState<boolean>(false);

  async function delete_note() {
    const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" })
    if (res.ok) window.location.href = "/";
  }

  async function edit_note() {
    const res = await fetch(`/api/notes?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: note?.title, content: note?.content }),
      headers: { "Content-Type": "application/json" }
    })
    if (res.ok) setEditable(false);
    toast.success("Note edited successfully");
  }

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/notes?id=${id}`);
        if (!res.ok) throw new Error("Failed to fetch note");
        const data: Note = await res.json();
        setNote(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNote();
  }, [id]);

  if (!note) return <div>Loading...</div>;

  return (
    <div>


      {editable ?
        <>
          <input
            value={note.title}
            name="title"
            className="text-3xl outline-0"
            onChange={(e) => setNote({ ...note, title: e.target.value })}
          />
          <br />
          <textarea
            value={note.content}
            name="content"
            className="outline-0"
            onChange={(e) => setNote({ ...note, content: e.target.value })}
          />
          <br />
          <button className="px-2 py-1 bg-blue-900 cursor-pointer mt-2 inline-block" onClick={edit_note}>save</button>
        </>
        :
        <>
          <h1 className="text-3xl mb-3">{note.title}</h1>
          <p>{note.content}</p>
          <button className="px-2 bg-red-900 cursor-pointer mt-2 inline-block mr-3 h-8" onClick={delete_note}>delete</button>
          <button className="px-2 bg-blue-900 cursor-pointer mt-2 inline-block h-8" onClick={() => setEditable(true)}>edit</button>
        </>
      }

    </div>
  );
}

