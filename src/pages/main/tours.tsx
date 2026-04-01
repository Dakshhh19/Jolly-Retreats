import { useEffect, useState } from "react"
import { TourCard } from "@/components/tours/tour-card"
import { tourBookingApi, type PublicTour } from "@/services/tourBookingApi"

export default function ToursPage() {
  const [sightseeingTours, setSightseeingTours] = useState<PublicTour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await tourBookingApi.listTours()
        if (!mounted) return
        setSightseeingTours(data.filter((tour) => tour.category === "sightseeing" || tour.category === "hiking"))
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : "Unable to load tours")
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold text-foreground">Explore Our Tours</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Discover unforgettable sightseeing adventures across the world's most beautiful destinations. From cultural tours to scenic hikes, we have something for every traveler.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sightseeingTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {!loading && sightseeingTours.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No tours available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}
