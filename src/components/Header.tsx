import Link from "next/link"

export default function Header() {
  return (
    <Link href="/notes">
      <h1 className="text-4xl block accent-background p-3 mb-5">Memocho</h1>
    </Link>
  )
}
