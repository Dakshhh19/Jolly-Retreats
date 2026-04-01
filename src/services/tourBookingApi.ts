import { tours as mockTours } from '@/lib/mock-data'
import { getApiBaseUrl } from '@/lib/api-base'
import { defaultTourSeeds } from '../../server/data/tourSeeds.js'

const API_BASE = getApiBaseUrl('/api')

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type TourRow = {
  id: number
  title: string
  description: string | null
  location: string
  price: number
  duration: string
  image_url: string | null
  max_capacity: number
  current_bookings: number
  available_slots: number
  status: 'available' | 'limited' | 'full' | 'closed'
  is_enabled: boolean | number
  occupancy_rate: number
  min_start_date?: string | null
  max_end_date?: string | null
  minStartDate?: string | null
  maxEndDate?: string | null
}

type TravelerRow = {
  traveler_id: number
  booking_id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  contact_number: string
}

type TourBookingRow = {
  booking_id: string
  user_id: number
  tour_id: number
  start_date: string
  end_date: string
  total_people: number
  price_per_person: number
  tax_amount: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  primary_contact_person: string
  primary_contact_phone: string
  tour_title: string
  tour_description: string
  customer_name: string
  customer_email: string
  user_contact_number: string
  created_at: string
  updated_at?: string
  travelers: TravelerRow[]
}

export type PublicTour = {
  id: string
  name: string
  category: 'hiking' | 'sightseeing'
  location: string
  duration: string
  difficulty: 'easy' | 'moderate'
  price: number
  rating: number
  image: string
  description: string
  maxGroup: number
  availability: {
    minStartDate: string
    maxEndDate: string
    availableSlots: number
    serviceStatus: 'available' | 'limited' | 'full' | 'closed'
  }
}

export type TravelerInput = {
  name: string
  age: string
  gender: 'Male' | 'Female' | 'Other' | ''
  contactNumber: string
}

export type TourBooking = {
  bookingId: string
  tourId: number
  tourTitle: string
  tourDescription: string
  startDate: string
  endDate: string
  totalPeople: number
  pricePerPerson: number
  taxAmount: number
  totalAmount: number
  bookingStatus: 'pending' | 'confirmed' | 'cancelled'
  primaryContactPerson: string
  primaryContactPhone: string
  customerName: string
  customerEmail: string
  createdAt: string
  travelers: Array<{
    travelerId: number
    name: string
    age: number
    gender: 'Male' | 'Female' | 'Other'
    contactNumber: string
  }>
}

const fallbackRatings: Record<string, number> = {
  'Tuscany Wine Trail': 4.8,
  'Machu Picchu Explorer': 4.95,
  'Patagonia Glacier Hike': 4.85,
  'Kyoto Temple Circuit': 4.7,
}

const fallbackDifficulty: Record<string, 'easy' | 'moderate'> = {
  'Tuscany Wine Trail': 'easy',
  'Machu Picchu Explorer': 'moderate',
  'Patagonia Glacier Hike': 'moderate',
  'Kyoto Temple Circuit': 'easy',
}

const fallbackCategory: Record<string, 'hiking' | 'sightseeing'> = {
  'Tuscany Wine Trail': 'hiking',
  'Machu Picchu Explorer': 'sightseeing',
  'Patagonia Glacier Hike': 'hiking',
  'Kyoto Temple Circuit': 'sightseeing',
}

const fallbackAvailability = Object.fromEntries(
  defaultTourSeeds.map((tour) => [
    tour.title,
    {
      minStartDate: tour.min_start_date,
      maxEndDate: tour.max_end_date
    }
  ])
)

const isIsoDate = (value?: string | null): value is string =>
  Boolean(value) && /^\d{4}-\d{2}-\d{2}$/.test(String(value))

const normalizeAvailabilityDate = (value?: string | null) => {
  if (isIsoDate(value)) return value
  return ''
}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || 'Request failed')
  }
  return payload.data
}

const mapTour = (row: TourRow): PublicTour => {
  const minStartDate =
    normalizeAvailabilityDate(row.min_start_date || row.minStartDate) ||
    fallbackAvailability[row.title]?.minStartDate ||
    ''
  const maxEndDate =
    normalizeAvailabilityDate(row.max_end_date || row.maxEndDate) ||
    fallbackAvailability[row.title]?.maxEndDate ||
    ''

  return {
  id: String(row.id),
  name: row.title,
  category: fallbackCategory[row.title] || 'sightseeing',
  location: row.location,
  duration: row.duration,
  difficulty: fallbackDifficulty[row.title] || 'easy',
  price: Number(row.price),
  rating: fallbackRatings[row.title] || 4.8,
  image: row.image_url || '',
  description: row.description || '',
  maxGroup: Number(row.max_capacity || 0),
  availability: {
    minStartDate,
    maxEndDate,
    availableSlots: Number(row.available_slots || 0),
    serviceStatus: row.status
  }
  }
}

const mapBooking = (row: TourBookingRow): TourBooking => ({
  bookingId: row.booking_id,
  tourId: Number(row.tour_id),
  tourTitle: row.tour_title,
  tourDescription: row.tour_description,
  startDate: row.start_date,
  endDate: row.end_date,
  totalPeople: Number(row.total_people),
  pricePerPerson: Number(row.price_per_person),
  taxAmount: Number(row.tax_amount),
  totalAmount: Number(row.total_amount),
  bookingStatus: row.booking_status,
  primaryContactPerson: row.primary_contact_person,
  primaryContactPhone: row.primary_contact_phone,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  createdAt: row.created_at,
  travelers: row.travelers.map((traveler) => ({
    travelerId: Number(traveler.traveler_id),
    name: traveler.name,
    age: Number(traveler.age),
    gender: traveler.gender,
    contactNumber: traveler.contact_number
  }))
})

export const tourBookingApi = {
  listTours: async () => {
    const data = await fetchJson<TourRow[]>(`${API_BASE}/tours`)
    return data.map(mapTour)
  },
  getTour: async (id: string) => {
    if (/^\d+$/.test(id)) {
      return mapTour(await fetchJson<TourRow>(`${API_BASE}/tours/${id}`))
    }

    const tours = await tourBookingApi.listTours()
    const targetName = mockTours.find((tour) => tour.id === id)?.name?.toLowerCase()
    const target = id.replace(/-/g, ' ').toLowerCase()
    const match = tours.find((tour) => tour.name.toLowerCase() === targetName || tour.name.toLowerCase() === target)
    if (!match) {
      throw new Error('Tour not found')
    }
    return match
  },
  createBooking: async (token: string, payload: {
    tourId: number
    startDate: string
    endDate: string
    totalPeople: number
    travelers: TravelerInput[]
  }) => mapBooking(await fetchJson<TourBookingRow>(`${API_BASE}/tour-bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      tourId: payload.tourId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      totalPeople: payload.totalPeople,
      travelers: payload.travelers.map((traveler) => ({
        name: traveler.name,
        age: Number(traveler.age),
        gender: traveler.gender,
        contactNumber: traveler.contactNumber
      }))
    })
  })),
  listAdminBookings: async (token: string, filters?: {
    tourId?: number
    status?: string
    startDate?: string
    endDate?: string
    search?: string
  }) => {
    const params = new URLSearchParams()
    if (filters?.tourId) params.set('tourId', String(filters.tourId))
    if (filters?.status) params.set('status', filters.status)
    if (filters?.startDate) params.set('startDate', filters.startDate)
    if (filters?.endDate) params.set('endDate', filters.endDate)
    if (filters?.search) params.set('search', filters.search)
    const suffix = params.toString() ? `?${params.toString()}` : ''
    const data = await fetchJson<TourBookingRow[]>(`${API_BASE}/tour-bookings${suffix}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data.map(mapBooking)
  },
  updateBookingStatus: async (token: string, bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') =>
    mapBooking(await fetchJson<TourBookingRow>(`${API_BASE}/tour-bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    })),
  downloadInvoice: async (token: string, bookingId: string) => {
    const response = await fetch(`${API_BASE}/tour-bookings/${bookingId}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as ApiResponse<unknown> | null
      throw new Error(payload?.message || 'Unable to download invoice')
    }
    return response.blob()
  }
}
