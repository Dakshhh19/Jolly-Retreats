import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, X } from "lucide-react"

interface PropertyFiltersProps {
  priceRange: number[]
  setPriceRange: (value: number[]) => void
  selectedType: string
  setSelectedType: (value: string) => void
  selectedLocation: string
  setSelectedLocation: (value: string) => void
  selectedCapacity: string
  setSelectedCapacity: (value: string) => void
  selectedAmenities: string[]
  setSelectedAmenities: (value: string[]) => void
  sortBy: string
  setSortBy: (value: string) => void
  onReset: () => void
}

const amenitiesList = ["Pool", "Wi-Fi", "Kitchen", "Parking", "Garden", "Ocean View", "Fireplace", "Air Conditioning"]
const locations = ["All Locations", "Bali, Indonesia", "Swiss Alps, Switzerland", "Amalfi Coast, Italy", "Cotswolds, England", "Santorini, Greece", "Lake Como, Italy"]

export function PropertyFilters({
  priceRange,
  setPriceRange,
  selectedType,
  setSelectedType,
  selectedLocation,
  setSelectedLocation,
  selectedCapacity,
  setSelectedCapacity,
  selectedAmenities,
  setSelectedAmenities,
  sortBy,
  setSortBy,
  onReset,
}: PropertyFiltersProps) {
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(
      selectedAmenities.includes(amenity)
        ? selectedAmenities.filter((a) => a !== amenity)
        : [...selectedAmenities, amenity]
    )
  }

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
          <X className="mr-1 h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Sort */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Sort By</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Property Type</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="villa">Villas</SelectItem>
            <SelectItem value="cottage">Cottages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Location</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Capacity */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Capacity</Label>
        <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
          <SelectTrigger className="bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="2">2+ guests</SelectItem>
            <SelectItem value="4">4+ guests</SelectItem>
            <SelectItem value="6">6+ guests</SelectItem>
            <SelectItem value="8">8+ guests</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          min={100}
          max={1000}
          step={10}
          className="py-2"
        />
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Amenities</Label>
        <div className="space-y-2">
          {amenitiesList.map((amenity) => (
            <div key={amenity} className="flex items-center gap-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label htmlFor={amenity} className="text-sm text-muted-foreground cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
