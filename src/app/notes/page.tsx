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

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [reload, setReload] = useState(1);
  const [selected, setSelected] = useState(0);
  const [generating, setGenerating] = useState(false);

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
      body: JSON.stringify({ title, content }),
      headers: { "Content-Type": "application/json" }
    });

    if (res.ok) toast.success("Note created successfully");
    form.reset();
    setReload(prev => prev + 1);
  }

  async function delete_note(note: Note) {
    // Delete immediately from DB
    await fetch(`/api/notes?id=${note.id}`, { method: "DELETE" });

    // Show toast with Undo
    toast("Note deleted", {
      action: {
        label: "Undo",
        onClick: async () => {
          await fetch(`/api/notes`, {
            method: "POST",
            body: JSON.stringify({
              id: note.id,
              title: note.title,
              content: note.content,
              tags: note.tags
            }),
            headers: { "Content-Type": "application/json" }
          });
          setReload(prev => prev + 1);
          toast.success("Note restored");
        }
      },
      duration: 4000 // auto dismiss after 4s
    });

    // Optionally delay reload slightly so deletion feels smoother
    await new Promise(resolve => setTimeout(resolve, 400));
    setReload(prev => prev + 1);
  }

  async function edit_note(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get("title") as string;
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;
    await fetch(`/api/notes?id=${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: title, content: content }),
      headers: { "Content-Type": "application/json" }
    })
    setReload(prev => prev + 1);
    document.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')?.click();
    toast.success("Note edited successfully");
  }

  async function edit_tags(note: Note) {
    setGenerating(true);
    await fetch("/api/notes", {
      method: "PATCH",
      body: JSON.stringify(note),
      headers: { "Content-Type": "application/json" }
    })
    await fetch("/api/add", {
      method: "POST",
      body: JSON.stringify(note),
      headers: { "Content-Type": "application/json" }
    })
    setGenerating(false);
    setReload(prev => prev + 1);
    toast.success("tags generated");
  }
  return (
    <>
      <h1 className='text-3xl mb-10'>My Notes</h1>
      <Masonry columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} spacing={2}>
        <Card
          onClick={() => setSelected(0)}
          className='p-3'
        >
          <form onSubmit={create_note} >
            <input
              type="text"
              name="title"
              placeholder="New note"
              className="text-2xl font-bold placeholder:text-gray-300 outline-0 w-full bg-transparent"
              required
            />
            <textarea
              className='placeholder:text-gray-400 outline-0 h-20 w-full'
              name="content"
              placeholder="Create a new note..."
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
          (notes.length != 0) ?
            [...notes]
              .sort((a, b) => b.id - a.id)
              .map((note) => (
                <Card key={note.id} className='p-3' onClick={() => setSelected(note.id)}>
                  <p className='text-2xl font-bold -mb-4'>{note.title}</p>
                  <p className='w-full -mb-4'>{note.content}</p>
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
                    {(generating && selected == note.id) ?
                      <>
                        <Skeleton className='w-15 h-5 rounded-2xl'></Skeleton>
                        <Skeleton className='w-12 h-5 rounded-2xl'></Skeleton>
                        <Skeleton className='w-13 h-5 rounded-2xl'></Skeleton>
                      </>
                      :
                      <></>}
                    {(!generating) ? note.tags.map(tag => {
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
            <>
              <Skeleton className='h-[300px] w-full' />
              <Skeleton className='h-[200px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[350px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[250px] w-full' />
              <Skeleton className='h-[250px] w-full' />
            </>
        }
      </Masonry>
    </>
  );
}

