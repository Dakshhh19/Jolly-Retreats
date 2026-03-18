import { Link } from "react-router-dom"
import { Users, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Car } from "@/lib/mock-data"

export function CarRentalCard({ car }: { car: Car }) {
  const typeLabels = {
    sedan: "Sedan",
    suv: "SUV",
    luxury: "Luxury",
    convertible: "Convertible",
  }

  return (
    <Link to={`/car-rentals/${car.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20">
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
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {car.seats} seats
          </div>
          <Badge variant="secondary" className="text-xs">
            {car.transmission === "automatic" ? "Automatic" : "Manual"}
          </Badge>
        </div>
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            {car.features.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
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
