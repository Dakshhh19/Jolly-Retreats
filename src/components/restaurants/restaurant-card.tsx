import { Link } from "react-router-dom"
import { Star, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Restaurant } from "@/lib/mock-data"

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="group block overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm text-xs">
            {restaurant.cuisine}
          </Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-card-foreground leading-snug">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-card-foreground">{restaurant.rating}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {restaurant.location}
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {restaurant.openHours}
          </div>
          <Badge variant="secondary" className="text-xs">
            {restaurant.priceRange}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="text-sm font-semibold text-foreground">
            {restaurant.cuisine}
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  )
}
