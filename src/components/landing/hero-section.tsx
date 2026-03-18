import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import AuthService from "@/services/authService"

export function HeroSection() {
  const isAuthenticated = AuthService.isAuthenticated()
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const heroSlides = [
    { src: "https://picsum.photos/id/1018/1920/1080", position: "center 55%" },
    { src: "https://picsum.photos/id/1036/1920/1080", position: "center center" },
    { src: "https://picsum.photos/id/1043/1920/1080", position: "center 45%" },
    { src: "https://picsum.photos/id/1050/1920/1080", position: "center center" },
    { src: "https://picsum.photos/id/1067/1920/1080", position: "center 40%" }
  ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % heroSlides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [heroSlides.length])

  return (
    <section className="relative flex min-h-[90vh] items-center overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <img
            key={slide.src}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === activeImageIndex ? "opacity-100" : "opacity-0"
            }`}
            src={slide.src}
            alt="Luxury retreat destination"
            style={{ objectPosition: slide.position }}
            loading={index === 0 ? "eager" : "lazy"}
            onError={(event) => {
              const target = event.currentTarget
              target.onerror = null
              target.src = "/placeholder.jpg"
              target.style.objectPosition = "center center"
            }}
          />
        ))}
        <div className="absolute inset-0 bg-charcoal/50" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="max-w-2xl">
          <p className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-beige/80">
            Luxury Hospitality & Travel
          </p>
          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-beige md:text-6xl lg:text-7xl text-balance">
            Where Every Retreat Becomes a Story
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-beige/80 max-w-lg">
            Discover handpicked villas, curated tours, and bespoke travel experiences crafted for those who seek the extraordinary.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to={isAuthenticated ? "/properties" : "/signup"}>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base"
              >
                Plan Your Stay
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-beige/30 bg-transparent text-beige hover:bg-beige/10 px-8 py-6 text-base"
                >
                  Login
                </Button>
              </Link>
            )}
            <Link to="/tours">
              <Button
                size="lg"
                variant="outline"
                className="border-beige/30 bg-transparent text-beige hover:bg-beige/10 px-8 py-6 text-base"
              >
                Explore Tours
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex gap-12">
            {[
              { value: "200+", label: "Luxury Properties" },
              { value: "50+", label: "Destinations" },
              { value: "15K+", label: "Happy Guests" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl font-bold text-beige">{stat.value}</p>
                <p className="mt-1 text-sm text-beige/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
