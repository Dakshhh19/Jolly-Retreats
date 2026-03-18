import { useEffect, useState } from "react"
import { Star, Quote } from "lucide-react"
import { testimonials } from "@/lib/mock-data"

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5500)

    return () => window.clearInterval(timer)
  }, [])

  const t = testimonials[current]

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Testimonials
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            What Our Guests Say
          </h2>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative rounded-2xl bg-card border border-border p-10 md:p-14">
            <Quote className="absolute top-6 left-6 h-10 w-10 text-primary/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="mt-6 font-serif text-xl leading-relaxed text-foreground md:text-2xl">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <div className="mt-8 flex flex-col items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                  <p className="mt-1 text-xs text-primary">{t.property}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-8 bg-primary" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
