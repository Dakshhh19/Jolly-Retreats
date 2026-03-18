import { Link } from "react-router-dom"
import { Home, Car, UtensilsCrossed, Mountain, ArrowUpRight } from "lucide-react"

const services = [
  {
    icon: Home,
    title: "Villas & Cottages",
    description: "Handpicked luxury properties in the world's most coveted destinations, from beachfront villas to mountain retreats.",
    href: "/properties",
    count: "200+ properties",
  },
  {
    icon: Car,
    title: "Car Rentals",
    description: "Premium vehicles for exploring at your own pace. From elegant sedans to sporty convertibles, drive in style.",
    href: "/cars",
    count: "50+ vehicles",
  },
  {
    icon: UtensilsCrossed,
    title: "Fine Dining",
    description: "Reserve tables at award-winning restaurants. From Michelin-starred kitchens to hidden local gems.",
    href: "/restaurants",
    count: "30+ restaurants",
  },
  {
    icon: Mountain,
    title: "Tours & Treks",
    description: "Expert-guided adventures across the globe. Trekking, hiking, sightseeing, and cultural immersion experiences.",
    href: "/tours",
    count: "80+ experiences",
  },
]

export function ServicesSection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Our Services
          </p>
          <h2 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            Everything for Your Perfect Retreat
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            A complete luxury travel ecosystem bringing together accommodations, transportation, dining, and adventure under one seamless experience.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.title}
              to={service.href}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-card-foreground">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-medium text-primary">{service.count}</span>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
