import { tours } from "@/lib/mock-data"
import { TourCard } from "@/components/tours/tour-card"

export default function ToursPage() {
  const sightseeingTours = tours.filter(tour => tour.category === "sightseeing" || tour.category === "hiking")

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground">Explore Our Tours</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Discover unforgettable sightseeing adventures across the world's most beautiful destinations. From cultural tours to scenic hikes, we have something for every traveler.
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sightseeingTours.map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {sightseeingTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tours available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
