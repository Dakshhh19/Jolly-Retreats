import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanedEmail = email.trim()
    if (!cleanedEmail) return
    navigate(`/signup?email=${encodeURIComponent(cleanedEmail)}`)
  }

  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl text-balance">
          Stay Inspired
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80 leading-relaxed">
          Subscribe to receive exclusive travel insights, early access to new properties, and personalized retreat recommendations.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 flex max-w-md gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
          />
          <Button
            type="submit"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shrink-0"
          >
            <Send className="mr-2 h-4 w-4" />
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  )
}
