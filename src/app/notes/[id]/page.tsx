"use client";

import { useEffect, useState, use } from "react";
import type { Note } from "@/generated/prisma/client";
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from '@/components/ui/card';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from "@/components/ui/badge"

export default function Page({ params }: { params: Promise<{ id: string }> }) {
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
      <Card key={note.id} className='w-svw fixed p-5 top-0 left-0 h-svh'>
        <p className='text-2xl font-bold -mb-4'>{note.title}</p>
        <p className='w-full -mb-4'>{note.content}</p>
        <div className='flex gap-1 flex-wrap'>
          <Badge variant='outline' className='cursor-pointer'>new +</Badge>
          {note.tags.map(tag => {
            return (<Badge key={tag} variant='secondary' className=''>
              {tag}
            </Badge>)
          })}
        </div>
        <ButtonGroup className="fixed bottom-10 right-7">
          {/* <Button */}
          {/*   className='mr-3' */}
          {/* > */}
          {/*   <Link */}
          {/*     href={`/notes/${note.id}`} */}
          {/*   // className="px-3 py-1 bg-blue-900 cursor-pointer mt-3 rounded-md text-gray-100 hover:bg-blue-800 transition-colors inline-block" */}
          {/*   > */}
          {/*     Edit */}
          {/*   </Link> */}
          {/* </Button> */}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" className='mr-2'>Edit</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={edit_note}>
                <DialogHeader>
                  <DialogTitle>Edit Note</DialogTitle>
                  <DialogDescription>
                    Make changes to your note here. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <input type="hidden" value={note.id} name="id" />
                  <div className="grid gap-3">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={note.title} />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      className="h-20"
                      id="content"
                      name="content"
                      defaultValue={note.content}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Button
            variant='destructive'
            onClick={() => delete_note()}
          >
            Delete
          </Button>
        </ButtonGroup>
      </Card>
    </div>
  );
}

