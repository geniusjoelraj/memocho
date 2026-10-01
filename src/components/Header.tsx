import Link from "next/link"
import { ModeToggle } from "./ui/mode-toggle"
import { UserButton } from "@clerk/nextjs"

export default function Header() {
  return (
    <div className="flex items-center justify-between lg:pr-5">
      <Link href="/notes">
        <h1 className="text-4xl block accent-background p-3 pl-0 font-logo">Memocho</h1>
      </Link>
      <div className="flex justify-between gap-4">
        <UserButton />
        <ModeToggle />
      </div>
    </div>
  )
}
