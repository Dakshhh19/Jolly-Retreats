import { cars } from "@/lib/mock-data"
import { CarRentalCard } from "@/components/cars/car-rental-card"

export default function CarsPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground">Premium Car Rentals</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Explore the world in style with our curated selection of luxury and practical vehicles. From sleek sedans to spacious SUVs, we have the perfect car for every journey.
          </p>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map(car => (
            <CarRentalCard key={car.id} car={car} />
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cars available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
