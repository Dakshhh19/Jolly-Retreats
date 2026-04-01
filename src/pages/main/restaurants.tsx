import { restaurants } from "@/lib/mock-data"
import { RestaurantCard } from "@/components/restaurants/restaurant-card"
import { Badge } from "@/components/ui/badge"

export default function RestaurantsPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="outline" className="mb-4">Dining Collection</Badge>
          <h1 className="font-serif text-4xl font-bold text-foreground">Culinary Experiences</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Discover extraordinary dining destinations hand-picked for their exceptional cuisine, atmosphere, and hospitality. From Michelin-starred fine dining to authentic local flavors.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">{restaurants.length} restaurants available to explore</p>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No restaurants available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
