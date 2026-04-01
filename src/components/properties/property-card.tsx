import { Link } from "react-router-dom"
import { Star, MapPin, Users, Bed } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/mock-data"
import { ROUTES } from "@/config"

export function PropertyCard({ property }: { property: Property }) {
  const cardContent = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className={`h-full w-full object-cover transition-transform duration-500 ${property.available ? "group-hover:scale-105" : "grayscale-[0.15]"}`}
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-card/90 text-card-foreground backdrop-blur-sm text-xs">
            {property.type === "villa" ? "Villa" : "Cottage"}
          </Badge>
        </div>
        {!property.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
            <Badge variant="destructive" className="text-sm">Unavailable</Badge>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-card-foreground leading-snug">
            {property.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-gold text-gold" />
            <span className="text-sm font-medium text-card-foreground">{property.rating}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {property.location}
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5" />
            {property.bedrooms} beds
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Up to {property.capacity}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{property.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {property.amenities.slice(0, 2).map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenity}
            </Badge>
          ))}
          <Badge variant="secondary" className="text-xs">
            {property.reviews} reviews
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="font-serif text-xl font-bold text-foreground">${property.price}</span>
            <span className="text-sm text-muted-foreground"> / night</span>
          </div>
          {property.available ? (
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              View Details
            </Button>
          ) : (
            <span className="inline-flex items-center rounded-md bg-muted px-3 py-2 text-sm font-medium text-muted-foreground">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </>
  )

  return (
    <Link
      to={ROUTES.PROPERTIES + `/${property.id}`}
      className={`group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ${property.available ? "hover:shadow-lg hover:border-primary/20" : "opacity-95"}`}
    >
      {cardContent}
    </Link>
  )
}
