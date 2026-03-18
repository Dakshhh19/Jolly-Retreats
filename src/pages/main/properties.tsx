import { useState, useMemo } from "react"
import { PropertyCard } from "@/components/properties/property-card"
import { PropertyFilters } from "@/components/properties/property-filters"
import { properties } from "@/lib/mock-data"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal } from "lucide-react"

export default function PropertiesPage() {
  const [priceRange, setPriceRange] = useState([100, 1000])
  const [selectedType, setSelectedType] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedCapacity, setSelectedCapacity] = useState("any")
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("recommended")

  const resetFilters = () => {
    setPriceRange([100, 1000])
    setSelectedType("all")
    setSelectedLocation("All Locations")
    setSelectedCapacity("any")
    setSelectedAmenities([])
    setSortBy("recommended")
  }

  const filtered = useMemo(() => {
    let result = properties.filter((p) => {
      if (selectedType !== "all" && p.type !== selectedType) return false
      if (selectedLocation !== "All Locations" && p.location !== selectedLocation) return false
      if (selectedCapacity !== "any" && p.capacity < parseInt(selectedCapacity)) return false
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false
      if (selectedAmenities.length > 0 && !selectedAmenities.every((a) => p.amenities.includes(a))) return false
      return true
    })

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
    }
    return result
  }, [priceRange, selectedType, selectedLocation, selectedCapacity, selectedAmenities, sortBy])

  const filterProps = {
    priceRange, setPriceRange,
    selectedType, setSelectedType,
    selectedLocation, setSelectedLocation,
    selectedCapacity, setSelectedCapacity,
    selectedAmenities, setSelectedAmenities,
    sortBy, setSortBy,
    onReset: resetFilters,
  }

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-secondary py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Accommodations</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Villas & Cottages
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
            Browse our curated collection of luxury properties in the world&apos;s most beautiful destinations.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Mobile filter toggle */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <p className="text-sm text-muted-foreground">{filtered.length} properties found</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto bg-background">
              <SheetTitle className="sr-only">Filters</SheetTitle>
              <div className="pt-6">
                <PropertyFilters {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <PropertyFilters {...filterProps} />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="mb-6 hidden items-center justify-between lg:flex">
              <p className="text-sm text-muted-foreground">{filtered.length} properties found</p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20">
                <p className="font-serif text-xl text-foreground">No properties found</p>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>Reset Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
