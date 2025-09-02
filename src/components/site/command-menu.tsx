"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"

export default function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey))) { e.preventDefault(); setOpen(o => !o) }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar o ejecutar…" />
      <CommandList>
        <CommandEmpty>Sin resultados.</CommandEmpty>
        <CommandGroup heading="Ir a">
          <CommandItem onSelect={() => router.push("/assistant")}>Abrir asistente</CommandItem>
          <CommandItem onSelect={() => router.push("/projects")}>Ver proyectos</CommandItem>
          <CommandItem onSelect={() => router.push("/about")}>Sobre mí</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
