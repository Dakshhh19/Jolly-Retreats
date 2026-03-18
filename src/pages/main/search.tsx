import { useSearchParams, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TourCard } from '@/components/tours/tour-card'
import { TrekCard } from '@/components/tours/trek-card'
import { RestaurantCard } from '@/components/restaurants/restaurant-card'
import { CarRentalCard } from '@/components/cars/car-rental-card'
import { PropertyCard } from '@/components/properties/property-card'
import { tours } from '@/lib/mock-data'
import { restaurants } from '@/lib/mock-data'
import { cars } from '@/lib/mock-data'
import { properties } from '@/lib/mock-data'

interface SearchResult {
  type: 'property' | 'tour' | 'trek' | 'restaurant' | 'car'
  item: any
}

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''

  // Filter tours (split into tours and treks)
  const toursResults = tours
    .filter(tour => tour.category !== 'trek')
    .filter(tour =>
      tour.name.toLowerCase().includes(query.toLowerCase()) ||
      tour.location.toLowerCase().includes(query.toLowerCase()) ||
      tour.description?.toLowerCase().includes(query.toLowerCase())
    )
    .map(tour => ({ type: 'tour' as const, item: tour }))

  const treksResults = tours
    .filter(tour => tour.category === 'trek')
    .filter(tour =>
      tour.name.toLowerCase().includes(query.toLowerCase()) ||
      tour.location.toLowerCase().includes(query.toLowerCase()) ||
      tour.description?.toLowerCase().includes(query.toLowerCase())
    )
    .map(tour => ({ type: 'trek' as const, item: tour }))

  // Filter restaurants
  const restaurantsResults = restaurants
    .filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
    )
    .map(restaurant => ({ type: 'restaurant' as const, item: restaurant }))

  // Filter cars
  const carsResults = cars
    .filter(car =>
      car.name.toLowerCase().includes(query.toLowerCase()) ||
      car.type.toLowerCase().includes(query.toLowerCase())
    )
    .map(car => ({ type: 'car' as const, item: car }))

  // Filter properties
  const propertiesResults = properties
    .filter(property =>
      property.name.toLowerCase().includes(query.toLowerCase()) ||
      property.location.toLowerCase().includes(query.toLowerCase()) ||
      property.description.toLowerCase().includes(query.toLowerCase()) ||
      property.amenities.some(amenity => amenity.toLowerCase().includes(query.toLowerCase()))
    )
    .map(property => ({ type: 'property' as const, item: property }))

  // Combine all results
  const allResults: SearchResult[] = [
    ...propertiesResults,
    ...toursResults,
    ...treksResults,
    ...restaurantsResults,
    ...carsResults
  ]

  return (
    <div className="min-h-screen bg-background pt-32 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Search Results
          </h1>
          {query && (
            <p className="mt-2 text-lg text-muted-foreground">
              Found {allResults.length} result{allResults.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
        </div>

        {/* No Results */}
        {allResults.length === 0 && (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No results found
            </h2>
            <p className="text-muted-foreground mb-6">
              {query
                ? `We couldn't find any matches for "${query}". Try different keywords.`
                : 'Enter a search query to find properties, tours, treks, restaurants, and car rentals.'}
            </p>
            <Button
              onClick={() => navigate('/')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Back to Home
            </Button>
          </Card>
        )}

        {/* Results by Category */}
        {allResults.length > 0 && (
          <div className="space-y-12">
            {/* Properties */}
            {propertiesResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propertiesResults.map(result => (
                    <PropertyCard key={result.item.id} property={result.item} />
                  ))}
                </div>
              </div>
            )}

            {/* Tours */}
            {toursResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Tours</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {toursResults.map(result => (
                    <TourCard key={result.item.id} tour={result.item} />
                  ))}
                </div>
              </div>
            )}

            {/* Treks */}
            {treksResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Treks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {treksResults.map(result => (
                    <TrekCard key={result.item.id} trek={result.item} />
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants */}
            {restaurantsResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Restaurants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {restaurantsResults.map(result => (
                    <RestaurantCard key={result.item.id} restaurant={result.item} />
                  ))}
                </div>
              </div>
            )}

            {/* Car Rentals */}
            {carsResults.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Car Rentals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {carsResults.map(result => (
                    <CarRentalCard key={result.item.id} car={result.item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
