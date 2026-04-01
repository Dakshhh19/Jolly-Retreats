import { getApiBaseUrl } from '@/lib/api-base'

const API_BASE = getApiBaseUrl('/api')

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

type UserRow = {
  id: number
  full_name: string
  email: string
  contact_number: string
  role: 'user' | 'admin'
  is_blocked: boolean
  created_at: string
}

type TourRow = {
  id: number
  title: string
  description: string | null
  location: string
  price: number
  duration: string
  image_url: string | null
  created_at?: string
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
  min_start_date?: string
  max_end_date?: string
  minStartDate?: string
  maxEndDate?: string
}

type TrekRow = {
  id: number
  title: string
  difficulty_level: 'easy' | 'moderate' | 'hard' | 'extreme'
  location: string
  duration: string
  price: number
  description: string | null
  image_url: string | null
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
}

type RestaurantRow = {
  id: number
  name: string
  cuisine_type: string
  location: string
  price_range: string
  rating: number | null
  description: string | null
  image_url: string | null
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
}

type CarRow = {
  id: number
  car_name: string
  company: string
  price_per_day: number
  location: string
  seats: number
  fuel_type: string
  image_url: string | null
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
}

type PropertyRow = {
  id: number
  name: string
  location: string
  price_per_night: number
  capacity: number
  bedrooms: number
  bathrooms: number
  image_url: string | null
  description: string | null
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
}

type ServiceCapacityRow = {
  id: number
  service_type: string
  service_name: string
  description: string | null
  location: string | null
  price: number | null
  max_capacity: number
  current_bookings: number
  available_slots: number
  status: 'available' | 'limited' | 'full' | 'closed'
  is_enabled: boolean | number
  occupancy_rate: number
  created_at: string
  updated_at: string
}

type OrderItemRow = {
  id: number
  order_id: number
  service_type: string
  service_id: number
  service_name: string
  unit_price: number
  quantity: number
  line_total: number
  schedule_date: string | null
  metadata_json: unknown
  created_at: string
}

type OrderRow = {
  id: number
  user_id: number
  order_number: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_amount: number
  tax_amount: number
  grand_total: number
  currency: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string | null
  booking_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItemRow[]
}

type InvoiceRow = {
  id: number
  order_id: number
  invoice_number: string
  invoice_html?: string
  order_number?: string
  customer_name?: string
  customer_email?: string
  grand_total?: number
  status?: string
  order_status?: string
  emailed_to: string | null
  email_status: 'pending' | 'sent' | 'failed'
  created_at: string
  updated_at: string
}

export type AdminUser = {
  id: number
  fullName: string
  email: string
  contactNumber: string
  role: 'user' | 'admin'
  isBlocked: boolean
  createdAt: string
}

export type AdminTour = {
  id: number
  title: string
  description: string
  location: string
  price: number
  duration: string
  imageUrl: string
  createdAt?: string
  maxCapacity?: number
  currentBookings?: number
  availableSlots?: number
  serviceStatus?: 'available' | 'limited' | 'full' | 'closed'
  isEnabled?: boolean
  occupancyRate?: number
  minStartDate?: string
  maxEndDate?: string
}

export type AdminTrek = {
  id: number
  title: string
  difficultyLevel: 'easy' | 'moderate' | 'hard' | 'extreme'
  location: string
  duration: string
  price: number
  description: string
  imageUrl: string
  maxCapacity?: number
  currentBookings?: number
  availableSlots?: number
  serviceStatus?: 'available' | 'limited' | 'full' | 'closed'
  isEnabled?: boolean
  occupancyRate?: number
}

export type AdminRestaurant = {
  id: number
  name: string
  cuisineType: string
  location: string
  priceRange: string
  rating: number | ''
  description: string
  imageUrl: string
  maxCapacity?: number
  currentBookings?: number
  availableSlots?: number
  serviceStatus?: 'available' | 'limited' | 'full' | 'closed'
  isEnabled?: boolean
  occupancyRate?: number
}

export type AdminCar = {
  id: number
  carName: string
  company: string
  pricePerDay: number
  location: string
  seats: number
  fuelType: string
  imageUrl: string
  maxCapacity?: number
  currentBookings?: number
  availableSlots?: number
  serviceStatus?: 'available' | 'limited' | 'full' | 'closed'
  isEnabled?: boolean
  occupancyRate?: number
}

export type AdminProperty = {
  id: number
  name: string
  location: string
  pricePerNight: number
  capacity: number
  bedrooms: number
  bathrooms: number
  imageUrl: string
  description: string
  maxCapacity?: number
  currentBookings?: number
  availableSlots?: number
  serviceStatus?: 'available' | 'limited' | 'full' | 'closed'
  isEnabled?: boolean
  occupancyRate?: number
}

type BookingRow = {
  id: number
  user_id: number
  service_type: 'tour' | 'trek' | 'restaurant' | 'car' | 'property' | 'stay' | 'experience'
  service_id: number
  booking_count: number
  booking_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export type AdminBooking = {
  id: number
  userId: number
  serviceType: 'tour' | 'trek' | 'restaurant' | 'car' | 'property' | 'stay' | 'experience'
  serviceId: number
  bookingCount: number
  bookingDate: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

type TourBookingTravelerRow = {
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
  tour_title: string
  tour_description: string
  start_date: string
  end_date: string
  total_people: number
  price_per_person: number
  tax_amount: number
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  primary_contact_person: string
  primary_contact_phone: string
  customer_name: string
  customer_email: string
  created_at: string
  travelers: TourBookingTravelerRow[]
}

export type AdminTourBooking = {
  bookingId: string
  userId: number
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

export type AdminServiceCapacity = {
  id: number
  serviceType: string
  serviceName: string
  description: string
  location: string
  price: number
  maxCapacity: number
  currentBookings: number
  availableSlots: number
  status: 'available' | 'limited' | 'full' | 'closed'
  isEnabled: boolean
  occupancyRate: number
  createdAt: string
  updatedAt: string
}

export type AdminOrderItem = {
  id: number
  orderId: number
  serviceType: string
  serviceId: number
  serviceName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  scheduleDate: string
  createdAt: string
}

export type AdminOrder = {
  id: number
  userId: number
  orderNumber: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number
  taxAmount: number
  grandTotal: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerAddress: string
  bookingDate: string
  notes: string
  createdAt: string
  updatedAt: string
  items: AdminOrderItem[]
}

export type AdminInvoice = {
  id: number
  orderId: number
  invoiceNumber: string
  orderNumber: string
  customerName: string
  customerEmail: string
  grandTotal: number
  orderStatus: string
  emailedTo: string
  emailStatus: 'pending' | 'sent' | 'failed'
  createdAt: string
  updatedAt: string
}

type AdminAnalyticsResponse = {
  summary: {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    totalServices: number
    fullyBookedServices?: number
    averageOccupancy?: number
  }
  charts: {
    salesOverTime: Array<{ day: string; revenue: number }>
    ordersPerDay: Array<{ day: string; orders: number }>
    userGrowth: Array<{ day: string; users: number }>
  }
  topServices: Array<{
    serviceType: string
    serviceId: number
    serviceName: string
    orderCount: number
    revenue: number
  }>
}

const token = () => localStorage.getItem('token')
const mapCapacityMeta = (row: {
  max_capacity?: number
  current_bookings?: number
  available_slots?: number
  status?: 'available' | 'limited' | 'full' | 'closed'
  is_enabled?: boolean | number
  occupancy_rate?: number
}) => ({
  maxCapacity: Number(row.max_capacity ?? 50),
  currentBookings: Number(row.current_bookings ?? 0),
  availableSlots: Number(row.available_slots ?? Math.max(Number(row.max_capacity ?? 50) - Number(row.current_bookings ?? 0), 0)),
  serviceStatus: (row.status || 'available'),
  isEnabled: Boolean(row.is_enabled ?? true),
  occupancyRate: Number(row.occupancy_rate ?? 0)
})

const mapUser = (row: UserRow): AdminUser => ({
  id: row.id,
  fullName: row.full_name,
  email: row.email,
  contactNumber: row.contact_number,
  role: row.role,
  isBlocked: Boolean(row.is_blocked),
  createdAt: row.created_at
})

const mapTour = (row: TourRow): AdminTour => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  location: row.location,
  price: row.price,
  duration: row.duration,
  imageUrl: row.image_url || '',
  createdAt: row.created_at,
  ...mapCapacityMeta(row),
  minStartDate: row.min_start_date || row.minStartDate || '',
  maxEndDate: row.max_end_date || row.maxEndDate || ''
})

const mapTrek = (row: TrekRow): AdminTrek => ({
  id: row.id,
  title: row.title,
  difficultyLevel: row.difficulty_level,
  location: row.location,
  duration: row.duration,
  price: row.price,
  description: row.description || '',
  imageUrl: row.image_url || '',
  ...mapCapacityMeta(row)
})

const mapRestaurant = (row: RestaurantRow): AdminRestaurant => ({
  id: row.id,
  name: row.name,
  cuisineType: row.cuisine_type,
  location: row.location,
  priceRange: row.price_range,
  rating: row.rating ?? '',
  description: row.description || '',
  imageUrl: row.image_url || '',
  ...mapCapacityMeta(row)
})

const mapCar = (row: CarRow): AdminCar => ({
  id: row.id,
  carName: row.car_name,
  company: row.company,
  pricePerDay: row.price_per_day,
  location: row.location,
  seats: row.seats,
  fuelType: row.fuel_type,
  imageUrl: row.image_url || '',
  ...mapCapacityMeta(row)
})

const mapProperty = (row: PropertyRow): AdminProperty => ({
  id: row.id,
  name: row.name,
  location: row.location,
  pricePerNight: row.price_per_night,
  capacity: row.capacity,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  imageUrl: row.image_url || '',
  description: row.description || '',
  ...mapCapacityMeta(row)
})

const mapBooking = (row: BookingRow): AdminBooking => ({
  id: row.id,
  userId: row.user_id,
  serviceType: row.service_type,
  serviceId: row.service_id,
  bookingCount: Number(row.booking_count || 1),
  bookingDate: row.booking_date,
  status: row.status,
  createdAt: row.created_at
})

const mapTourBooking = (row: TourBookingRow): AdminTourBooking => ({
  bookingId: row.booking_id,
  userId: Number(row.user_id),
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

const mapServiceCapacity = (row: ServiceCapacityRow): AdminServiceCapacity => ({
  id: row.id,
  serviceType: row.service_type,
  serviceName: row.service_name,
  description: row.description || '',
  location: row.location || '',
  price: Number(row.price || 0),
  maxCapacity: Number(row.max_capacity),
  currentBookings: Number(row.current_bookings),
  availableSlots: Number(row.available_slots),
  status: row.status,
  isEnabled: Boolean(row.is_enabled),
  occupancyRate: Number(row.occupancy_rate || 0),
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const mapOrderItem = (row: OrderItemRow): AdminOrderItem => ({
  id: Number(row.id),
  orderId: Number(row.order_id),
  serviceType: row.service_type,
  serviceId: Number(row.service_id),
  serviceName: row.service_name,
  unitPrice: Number(row.unit_price),
  quantity: Number(row.quantity),
  lineTotal: Number(row.line_total),
  scheduleDate: row.schedule_date || '',
  createdAt: row.created_at
})

const mapOrder = (row: OrderRow): AdminOrder => ({
  id: Number(row.id),
  userId: Number(row.user_id),
  orderNumber: row.order_number,
  status: row.status,
  totalAmount: Number(row.total_amount),
  taxAmount: Number(row.tax_amount),
  grandTotal: Number(row.grand_total),
  currency: row.currency,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address || '',
  bookingDate: row.booking_date || '',
  notes: row.notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  items: Array.isArray(row.items) ? row.items.map(mapOrderItem) : []
})

const mapInvoice = (row: InvoiceRow): AdminInvoice => ({
  id: Number(row.id),
  orderId: Number(row.order_id),
  invoiceNumber: row.invoice_number,
  orderNumber: row.order_number || '',
  customerName: row.customer_name || '',
  customerEmail: row.customer_email || '',
  grandTotal: Number(row.grand_total || 0),
  orderStatus: row.order_status || row.status || '',
  emailedTo: row.emailed_to || '',
  emailStatus: row.email_status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token() ? `Bearer ${token()}` : '',
      ...(options.headers || {})
    }
  })

  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Request failed')
  }
  return payload.data as T
}

export const adminApi = {
  users: {
    list: async () => (await request<UserRow[]>('/users')).map(mapUser),
    create: async (data: Omit<AdminUser, 'id' | 'createdAt'> & { password: string }) =>
      mapUser(await request<UserRow>('/users', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminUser, 'id' | 'createdAt'>> & { password?: string }) =>
      mapUser(await request<UserRow>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/users/${id}`, { method: 'DELETE' })
  },
  tours: {
    list: async () => (await request<TourRow[]>('/tours')).map(mapTour),
    create: async (data: Omit<AdminTour, 'id' | 'createdAt'>) =>
      mapTour(await request<TourRow>('/tours', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminTour, 'id' | 'createdAt'>>) =>
      mapTour(await request<TourRow>(`/tours/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/tours/${id}`, { method: 'DELETE' })
  },
  tourBookings: {
    list: async (filters?: { tourId?: number; status?: string; startDate?: string; endDate?: string; search?: string }) => {
      const params = new URLSearchParams()
      if (filters?.tourId) params.set('tourId', String(filters.tourId))
      if (filters?.status) params.set('status', filters.status)
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)
      if (filters?.search) params.set('search', filters.search)
      const suffix = params.toString() ? `?${params.toString()}` : ''
      return (await request<TourBookingRow[]>(`/tour-bookings${suffix}`)).map(mapTourBooking)
    },
    updateStatus: async (bookingId: string, status: 'confirmed' | 'cancelled') =>
      mapTourBooking(await request<TourBookingRow>(`/tour-bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })),
    downloadInvoice: async (bookingId: string) => {
      const response = await fetch(`${API_BASE}/tour-bookings/${bookingId}/invoice`, {
        headers: {
          Authorization: token() ? `Bearer ${token()}` : ''
        }
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as ApiResponse<unknown> | null
        throw new Error(payload?.message || 'Unable to download invoice')
      }

      return response.blob()
    }
  },
  treks: {
    list: async () => (await request<TrekRow[]>('/treks')).map(mapTrek),
    create: async (data: Omit<AdminTrek, 'id'>) =>
      mapTrek(await request<TrekRow>('/treks', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminTrek, 'id'>>) =>
      mapTrek(await request<TrekRow>(`/treks/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/treks/${id}`, { method: 'DELETE' })
  },
  restaurants: {
    list: async () => (await request<RestaurantRow[]>('/restaurants')).map(mapRestaurant),
    create: async (data: Omit<AdminRestaurant, 'id'>) =>
      mapRestaurant(await request<RestaurantRow>('/restaurants', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminRestaurant, 'id'>>) =>
      mapRestaurant(await request<RestaurantRow>(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/restaurants/${id}`, { method: 'DELETE' })
  },
  cars: {
    list: async () => (await request<CarRow[]>('/car-rentals')).map(mapCar),
    create: async (data: Omit<AdminCar, 'id'>) =>
      mapCar(await request<CarRow>('/car-rentals', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminCar, 'id'>>) =>
      mapCar(await request<CarRow>(`/car-rentals/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/car-rentals/${id}`, { method: 'DELETE' })
  },
  properties: {
    list: async () => (await request<PropertyRow[]>('/properties')).map(mapProperty),
    create: async (data: Omit<AdminProperty, 'id'>) =>
      mapProperty(await request<PropertyRow>('/properties', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<Omit<AdminProperty, 'id'>>) =>
      mapProperty(await request<PropertyRow>(`/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/properties/${id}`, { method: 'DELETE' })
  },
  bookings: {
    list: async () => (await request<BookingRow[]>('/bookings')).map(mapBooking),
    update: async (id: number, data: Partial<Pick<AdminBooking, 'bookingDate' | 'status' | 'bookingCount'>>) =>
      mapBooking(await request<BookingRow>(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/bookings/${id}`, { method: 'DELETE' })
  },
  services: {
    list: async (filters?: { serviceType?: string; status?: string; includeClosed?: boolean }) => {
      const params = new URLSearchParams()
      if (filters?.serviceType) params.set('serviceType', filters.serviceType)
      if (filters?.status) params.set('status', filters.status)
      if (filters?.includeClosed) params.set('includeClosed', 'true')
      const suffix = params.toString() ? `?${params.toString()}` : ''
      return (await request<ServiceCapacityRow[]>(`/services${suffix}`)).map(mapServiceCapacity)
    },
    getById: async (id: number, serviceType?: string) => {
      const suffix = serviceType ? `?serviceType=${encodeURIComponent(serviceType)}` : ''
      return mapServiceCapacity(await request<ServiceCapacityRow>(`/services/${id}${suffix}`))
    },
    create: async (data: {
      serviceType: string
      serviceName: string
      description?: string
      location?: string
      price?: number
      maxCapacity?: number
      status?: 'available' | 'limited' | 'full' | 'closed'
      isEnabled?: boolean
    }) => mapServiceCapacity(await request<ServiceCapacityRow>('/services', { method: 'POST', body: JSON.stringify(data) })),
    update: async (id: number, data: Partial<{
      serviceType: string
      serviceName: string
      description: string
      location: string
      price: number
      maxCapacity: number
      currentBookings: number
      status: 'available' | 'limited' | 'full' | 'closed'
      isEnabled: boolean
    }>) => mapServiceCapacity(await request<ServiceCapacityRow>(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) })),
    delete: async (id: number) => request<void>(`/services/${id}`, { method: 'DELETE' })
  },
  analytics: {
    overview: async () => request<AdminAnalyticsResponse>('/analytics/admin')
  },
  orders: {
    list: async () => (await request<OrderRow[]>('/orders/admin')).map(mapOrder),
    getById: async (id: number) => mapOrder(await request<OrderRow>(`/orders/${id}`))
  },
  invoices: {
    list: async () => (await request<InvoiceRow[]>('/orders/invoices')).map(mapInvoice),
    getByOrderId: async (orderId: number) => mapInvoice(await request<InvoiceRow>(`/orders/${orderId}/invoice`)),
    email: async (orderId: number, email: string) =>
      mapInvoice(await request<InvoiceRow>(`/orders/${orderId}/invoice/email`, { method: 'POST', body: JSON.stringify({ email }) }))
  }
}
