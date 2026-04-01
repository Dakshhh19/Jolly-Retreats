import { Link } from "react-router-dom"
import { Star, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Tour as MockTour } from "@/lib/mock-data"
import type { PublicTour } from "@/services/tourBookingApi"

type TourCardModel = MockTour | PublicTour

export function TourCard({ tour }: { tour: TourCardModel }) {
  const difficultyColors = {
    easy: "bg-emerald-100 text-emerald-900",
    moderate: "bg-amber-100 text-amber-900",
    hard: "bg-rose-100 text-rose-900",
  }

  return (
    <Link to={`/tours/${tour.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm text-xs">
            {tour.category === "trek" ? "Trek" : tour.category === "hiking" ? "Hiking" : "Sightseeing"}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-card-foreground leading-snug">
            {tour.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-card-foreground">{tour.rating}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {tour.location}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {tour.duration}
          </div>
          <Badge className={`text-xs ${difficultyColors[tour.difficulty]}`}>
            {tour.difficulty.charAt(0).toUpperCase() + tour.difficulty.slice(1)}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-serif text-xl font-bold text-foreground">${tour.price}</span>
            <span className="text-sm text-muted-foreground"> / person</span>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  )
}
