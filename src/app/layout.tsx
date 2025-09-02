import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/site/header"
import CommandMenu from "@/components/site/command-menu"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jon Abad – AI Portfolio",
  description: "Asistente inteligente, proyectos y portfolio de Jon Ander Abad.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-brand="basque-oxide" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <Header />
          <main className="container py-8">{children}</main>
          <CommandMenu />
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
