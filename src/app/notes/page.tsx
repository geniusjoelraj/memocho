'use client'
import { Masonry } from '@mui/lab';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Note } from '@/generated/prisma/browser';
import { toast } from "sonner"



export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [reload, setReload] = useState(1);
  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then(setNotes);
  }, [reload]);
  async function create_note(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const res = await fetch(`/api/notes`, {
      method: "POST",
      body: JSON.stringify({ title: title, content: content }),
      headers: { "Content-Type": "application/json" }
    })
    toast.success("Note created successfully");
    form.reset();
    setReload(reload + 1);
    console.log(res);
  }
  return (
    <>
      <h1 className='text-4xl mb-10'>Notes</h1>
      <Masonry columns={4} spacing={3}>
        <form
          onSubmit={(e) => {
            create_note(e);

          }}
          className="bg-gray-900 p-3 rounded-2xl"
        >
          <input
            type="text"
            name="title"
            placeholder="New note"
            className="text-2xl font-bold text-gray-300 outline-0 w-full bg-transparent"
            required
          />

          <textarea
            className='text-gray-400 outline-0 h-20 w-full'
            name="content"
            placeholder="Create a new note..." />

          <button
            type="submit"
            className="px-3 py-1 bg-blue-900 cursor-pointer mt-3 rounded-md text-gray-100 hover:bg-blue-800 transition-colors"
          >
            New
          </button>
        </form>

        {notes.map((note, index) => (
          <div
            key={index}
            className='bg-gray-900 p-3 rounded-2xl'
          >
            <h1 className='text-2xl font-bold'>
              {note.title}
            </h1>
            <p className='w-full'>{note.content}</p>
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="px-3 py-1 bg-blue-900 cursor-pointer mt-3 rounded-md text-gray-100 hover:bg-blue-800 transition-colors inline-block"
            >Edit</Link>
            <button
              onClick={async () => { await fetch(`/api/notes?id=${note.id}`, { method: "DELETE" }); toast.success("Note deleted successfully"); setReload(reload + 1); }}
              className="px-2 bg-red-900 cursor-pointer mt-2 inline-block mr-3 h-8 rounded-md ml-3"
            >Delete</button>
          </div>
        ))}

      </Masonry>
    </>
  );
}

