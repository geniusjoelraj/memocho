'use client'
import { Masonry } from '@mui/lab';
import { useEffect, useState } from 'react';
import { Note } from '@/generated/prisma/browser';
import { toast } from "sonner";
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserButton, useUser } from '@clerk/nextjs';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(1);
  const [selected, setSelected] = useState(0);
  const [generatingIds, setGeneratingIds] = useState<Set<number>>(new Set());
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch("/api/notes/?userId=" + user.id)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNotes(data);
          // Trigger generation for notes without tags
          data.forEach((note: Note) => {
            if (!note.tags || note.tags.length === 0) {
              edit_tags(note);
            }
          });
        } else {
          setNotes([]);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, [reload, user]);

  async function create_note(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const userId = user?.id
    const res = await fetch(`/api/notes`, {
      method: "POST",
      body: JSON.stringify({ title, content, userId }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
      toast.success("Note created successfully");
      const data = await res.json();
      setNotes(prev => [data.note, ...prev]);
      edit_tags(data.note);
    }
    form.reset();
  }

  async function delete_note(note: Note) {
    // Optimistically remove from UI
    setNotes(prev => prev.filter(n => n.id !== note.id));
    
    // Delete immediately from DB
    await fetch(`/api/notes?id=${note.id}`, { method: "DELETE" });

    // Show toast with Undo
    toast("Note deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          const res = await fetch(`/api/notes`, {
            method: "POST",
            body: JSON.stringify({
              id: note.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              userId: note.user_id
            }),
            headers: { "Content-Type": "application/json" }
          });
          if (res.ok) {
            const data = await res.json();
            setNotes(prev => [data.note, ...prev]);
          }
          toast.success("Note restored");
        }
      },
      duration: 4000 // auto dismiss after 4s
    });
  }

  async function edit_note(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;
    const res = await fetch(`/api/notes?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: title, content: content }),
      headers: { "Content-Type": "application/json" }
    })
    
    if (res.ok) {
      const updatedNote = await res.json();
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
    }
    
    document.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')?.click();
    toast.success("Note edited successfully");
  }

  async function edit_tags(note: Note) {
    if (generatingIds.has(note.id)) return;
    setGeneratingIds(prev => new Set(prev).add(note.id));
    try {
      const res = await fetch("/api/notes", {
        method: "PATCH",
        body: JSON.stringify(note),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const updatedNote = await res.json();
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      }
      await fetch("/api/add", {
        method: "POST",
        body: JSON.stringify(note),
        headers: { "Content-Type": "application/json" }
      })
      toast.success("tags generated");
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(note.id);
        return next;
      });
    }
  }
  return (
    <>
      <h1 className='text-2xl mb-10'>Hi {user?.username}
      </h1>
      <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
        <Card
          onClick={() => setSelected(0)}
          className='p-4'
        >
          <form onSubmit={create_note} className="flex flex-col gap-3">
            <textarea
              name="title"
              placeholder="New note"
              className="text-2xl font-bold placeholder:text-gray-300 outline-0 w-full bg-transparent resize-none [field-sizing:content]"
              required
              rows={1}
            />
            <textarea
              className='placeholder:text-gray-400 outline-0 w-full bg-transparent resize-none [field-sizing:content]'
              name="content"
              placeholder="Create a new note..."
              rows={3}
            />
            <Button
              variant="default"
              type="submit"
            >
              New
            </Button>
          </form>
        </Card>
        {
          loading ?
            <>
              <Skeleton className='h-[300px] w-full' />
              <Skeleton className='h-[200px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[250px] w-full' />
            </>
          : (notes.length != 0) ?
            [...notes]
              .sort((a, b) => b.id - a.id)
              .map((note) => (
                <Card key={note.id} className='p-4 flex flex-col gap-4' onClick={() => setSelected(note.id)}>
                  <p className='text-2xl font-bold break-words'>{note.title}</p>
                  <p className='w-full break-words whitespace-pre-wrap text-muted-foreground'>{note.content}</p>
                  <div className='flex gap-1 flex-wrap'>
                    {selected == note.id ?
                      <Badge variant='outline' className='cursor-pointer'
                        onClick={async () => {
                          edit_tags(note);
                          setReload(prev => prev + 1);
                        }}
                      >new +</Badge>
                      : <></>
                    }
                    {(generatingIds.has(note.id)) ?
                      <>
                        <Skeleton className='w-15 h-5 rounded-2xl'></Skeleton>
                        <Skeleton className='w-12 h-5 rounded-2xl'></Skeleton>
                        <Skeleton className='w-13 h-5 rounded-2xl'></Skeleton>
                      </>
                      :
                      <></>}
                    {(!generatingIds.has(note.id)) ? note.tags.map(tag => {
                      return (<Badge key={tag} variant='secondary' className=''>
                        {tag}
                      </Badge>)
                    }) : <></>
                    }
                  </div>

                  {selected == note.id ?
                    <ButtonGroup>
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
                                Make changes to your note here. Click save when you&apos;re done.
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
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>
                              <div onClick={() => delete_note(note)} className='w-full'>
                                Continue
                              </div>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/**/}
                      {/* <Button */}
                      {/*   variant='destructive' */}
                      {/*   onClick={() => delete_note(note)} */}
                      {/* > */}
                      {/*   Delete */}
                      {/* </Button> */}
                    </ButtonGroup>
                    : <></>}
                </Card>
              )) :
            <p className='text-muted-foreground p-4'>No notes yet. Create one above!</p>
        }
      </Masonry>
    </>
  );
}

