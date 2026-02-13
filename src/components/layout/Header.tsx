import Image from "next/image"
import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full py-4 px-6 bg-yellow-400">
      <div className="container mx-auto flex justify-center">
        <Link href="/" className="inline-block">
          
        </Link>
      </div>
    </header>
  )
}
