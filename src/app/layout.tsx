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
  metadataBase: new URL("https://ai.jonabad.es"),
  title: {
    default: "Jon Abad – Portfolio Inteligente",
    template: "%s | Jon Abad – AI",
  },
  description:
    "Portfolio inteligente de Jon Ander Abad: IA aplicada a producto y contenidos. RAG, asistentes y demos.",
  keywords: [
    "Jon Abad",
    "IA",
    "AI",
    "Portfolio",
    "RAG",
    "Next.js",
    "Prompt Engineering",
  ],
  authors: [{ name: "Jon Ander Abad" }],
  alternates: { canonical: "https://ai.jonabad.es/" },
  openGraph: {
    type: "website",
    url: "https://ai.jonabad.es/",
    title: "Jon Abad – Portfolio Inteligente",
    description: "IA aplicada a producto y contenidos. RAG, asistentes y demos.",
    siteName: "Jon Abad AI",
    locale: "es_ES",
    images: [{ url: "/og", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jon Abad – Portfolio Inteligente",
    description: "IA aplicada a producto y contenidos. RAG, asistentes y demos.",
    images: ["/og"],
  },
  icons: { icon: "/favicon.ico" },
};

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
