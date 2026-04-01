import { Link } from "react-router-dom"
import { Users, Gauge, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Car } from "@/lib/mock-data"
import { ROUTES } from "@/config"

export function CarRentalCard({ car }: { car: Car }) {
  const typeLabels = {
    sedan: "Sedan",
    suv: "SUV",
    luxury: "Luxury",
    convertible: "Convertible",
  }

  return (
    <Link to={ROUTES.CARS + `/${car.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm text-xs">
            {typeLabels[car.type]}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-card-foreground leading-snug">
          {car.name}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {car.type === "luxury"
            ? "A premium drive for polished arrivals, long-distance comfort, and memorable road trips."
            : car.type === "suv"
              ? "A spacious choice for family getaways, scenic routes, and extra luggage."
              : car.type === "convertible"
                ? "An open-air experience built for coastal drives and special occasions."
                : "A smooth everyday ride that balances comfort, efficiency, and city-friendly handling."}
        </p>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {car.seats} seats
          </div>
          <div className="flex items-center gap-1">
            <Gauge className="h-3.5 w-3.5" />
            {typeLabels[car.type]}
          </div>
          <Badge variant="secondary" className="text-xs">
            {car.transmission === "automatic" ? "Automatic" : "Manual"}
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {car.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {car.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                {car.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-serif text-xl font-bold text-foreground">${car.price}</span>
            <span className="text-sm text-muted-foreground"> / day</span>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            Rent Now
          </Button>
        </div>
      </div>
    </Link>
  )
}
