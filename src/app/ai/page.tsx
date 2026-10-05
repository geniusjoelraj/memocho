'use client'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton";
import { ChangeEvent, useState } from 'react'

import { toast } from "sonner";


export default function AI() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generating, setGenerating] = useState(false);


  async function get_answer(query: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok) {
        let msg = "Something went wrong.";
        try {
          const parsed = JSON.parse(data.error);
          msg = parsed?.error?.message || data.error;
        } catch {
          msg = data.error || msg;
        }
        toast.error(msg);
        setGenerating(false);
        return;
      }

      setAnswer(data.answer);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setQuestion(e.target.value);
  }


  return (
    <>
      <Card className="p-5">
        <input
          type="text"
          placeholder="Ask me anything about notes..."
          value={question}
          onChange={handleChange}
          className="border-0 outline-0 bg-transparent"
        />
        {generating ?
          <div className="flex gap-3 flex-wrap">
            <Skeleton className="w-1/4 h-7" />
            <Skeleton className="w-1/5 h-7" />
            <Skeleton className="w-1/6 h-7" />
            <Skeleton className="w-1/4 h-7" />
            <Skeleton className="w-1/3 h-7" />
          </div>
          :
          <p className="block text-xl">{answer}</p>
        }
        <Button
          type="submit"
          variant="outline"
          onClick={() => get_answer(question)}
        >
          Ask
        </Button>
      </Card>
    </>
  )
}
