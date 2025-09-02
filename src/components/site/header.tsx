"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ThemeToggle from "./theme-toggle"

const links = [
  { href: "/", label: "Inicio" },
  { href: "/projects", label: "Proyectos" },
  { href: "/assistant", label: "Asistente" },
  { href: "/about", label: "Sobre mí" },
]

export default function Header() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b border-border/50 bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          <span>Jon Abad</span> <span className="text-primary">/ AI</span>
        </Link>
        <nav className="flex items-center gap-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${pathname === l.href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
