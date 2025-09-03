'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 140, damping: 16 },
  },
}

export default function Hero() {
  const title = 'Portfolio Inteligente'
  const subtitle = 'Jon Ander Abad – IA aplicada a producto y contenidos'

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-hero opacity-70" />
        <div className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-5xl px-4">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          En producción — Stack: Next.js · TS · Tailwind · shadcn/ui · OpenAI
        </motion.div>

        {/* Título y subtítulo */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-120px' }}
          className="mb-6"
        >
          <motion.h1
            variants={item}
            className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl"
          >
            {title}
          </motion.h1>

        <motion.p
            variants={item}
            className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          {/* CTA 1 — un solo hijo en Button: el Link; el trail va DENTRO del Link */}
          <Button asChild size="lg" className="group relative overflow-hidden">
            <Link href="/projects" className="relative inline-flex items-center gap-2">
              Ver proyectos
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
          </Button>

          {/* CTA 2 — ya estaba correcto */}
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/assistant" className="inline-flex items-center gap-2">
              Habla con mi asistente
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  )
}
