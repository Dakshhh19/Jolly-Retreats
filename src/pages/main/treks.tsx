import { tours } from "@/lib/mock-data"
import { TrekCard } from "@/components/tours/trek-card"

export default function TreksPage() {
  const trekkingTours = tours.filter(tour => tour.category === "trek")

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground">Epic Trek Adventures</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Challenge yourself with our most exciting trekking expeditions. These multi-day adventures take you through remote landscapes and unforgettable wilderness experiences.
          </p>
        </div>

        {/* Treks Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trekkingTours.map(trek => (
            <TrekCard key={trek.id} trek={trek} />
          ))}
        </div>

        {trekkingTours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No treks available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
