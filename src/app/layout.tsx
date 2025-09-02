import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatWidget from "../../components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Dominio canónico del sitio
  metadataBase: new URL("https://ai.jonabad.es"),

  // SEO básico
  title: {
    default: "AI · Jon Abad",
    template: "%s — AI · Jon Abad",
  },
  description: "Demos y proyectos de IA de Jon Abad en ai.jonabad.es.",

  // Etiqueta <link rel="canonical"> para la home
  alternates: {
    canonical: "/",
  },

  // Open Graph para compartir
  openGraph: {
    title: "AI · Jon Abad",
    description: "Demos y proyectos de IA de Jon Abad en ai.jonabad.es.",
    url: "https://ai.jonabad.es",
    siteName: "AI · Jon Abad",
    locale: "es_ES",
    type: "website",
  },

  // Metadatos para Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "AI · Jon Abad",
    description: "Demos y proyectos de IA de Jon Abad en ai.jonabad.es.",
  },

  // Indización
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
