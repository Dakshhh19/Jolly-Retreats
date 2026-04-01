import { getApiBaseUrl } from '@/lib/api-base'

const API_BASE = getApiBaseUrl('/api')

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export type ServiceCapacity = {
  id: number
  serviceType: string
  serviceName: string
  location: string
  price: number
  maxCapacity: number
  currentBookings: number
  availableSlots: number
  status: 'available' | 'limited' | 'full' | 'closed'
  isEnabled: boolean
  occupancyRate: number
}

type ServiceCapacityRow = {
  id: number
  service_type: string
  service_name: string
  location: string | null
  price: number | null
  max_capacity: number
  current_bookings: number
  available_slots: number
  status: 'available' | 'limited' | 'full' | 'closed'
  is_enabled: boolean | number
  occupancy_rate: number
}

const mapServiceCapacity = (row: ServiceCapacityRow): ServiceCapacity => ({
  id: row.id,
  serviceType: row.service_type,
  serviceName: row.service_name,
  location: row.location || '',
  price: Number(row.price || 0),
  maxCapacity: Number(row.max_capacity),
  currentBookings: Number(row.current_bookings),
  availableSlots: Number(row.available_slots),
  status: row.status,
  isEnabled: Boolean(row.is_enabled),
  occupancyRate: Number(row.occupancy_rate || 0)
})

export const serviceCapacityApi = {
  getById: async (id: number, serviceType?: string): Promise<ServiceCapacity> => {
    const suffix = serviceType ? `?serviceType=${encodeURIComponent(serviceType)}` : ''
    const response = await fetch(`${API_BASE}/services/${id}${suffix}`)
    const payload = (await response.json()) as ApiResponse<ServiceCapacityRow>
    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.message || 'Failed to load service capacity')
    }
    return mapServiceCapacity(payload.data)
  }
}
