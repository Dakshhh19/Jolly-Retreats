import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { destinations } from "@/lib/mock-data"

export function DestinationsSection() {
  return (
    <section className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Featured Destinations
            </p>
            <h2 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
              Explore the World's Finest
            </h2>
          </div>
          <Link
            to="/properties"
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All Destinations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {destinations.map((dest, i) => (
            <Link
              key={dest.id}
              to="/properties"
              className={`group relative overflow-hidden rounded-xl ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`relative ${i === 0 ? "aspect-square" : "aspect-[4/3]"} w-full`}>
                <img
                  src={dest.image}
                  alt={`${dest.name}, ${dest.country}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-2xl font-bold text-beige">
                    {dest.name}
                  </h3>
                  <p className="mt-1 text-sm text-beige/70">{dest.country}</p>
                  <p className="mt-2 text-xs font-medium text-beige/60">
                    {dest.propertyCount} properties
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
