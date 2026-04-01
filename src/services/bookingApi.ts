import { getApiBaseUrl } from "@/lib/api-base"

const API_BASE = getApiBaseUrl("/api")

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

export type SupportedServiceType = "tour" | "trek" | "restaurant" | "car" | "property"

type ServiceRow = {
  id: number
  service_type: string
  service_name: string
}

type TourRow = { id: number; title: string }
type TrekRow = { id: number; title: string }
type RestaurantRow = { id: number; name: string }
type CarRow = { id: number; car_name: string }

type BookingRow = {
  id: number
  user_id?: number
  service_id: number
  service_type: string
  service_name?: string
  booking_date: string
  booking_count: number
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
}

export type ServiceBooking = {
  bookingId: number
  userId: number | null
  serviceId: number
  serviceType: SupportedServiceType
  serviceName: string
  bookingDate: string
  bookingCount: number
  status: "pending" | "confirmed" | "cancelled"
  createdAt: string
}

export type CreateServiceBookingInput = {
  token: string
  serviceType: SupportedServiceType
  serviceName: string
  serviceIdHint: number
  bookingDate: string
  bookingCount?: number
  status?: "pending" | "confirmed" | "cancelled"
  serviceDescription?: string
  serviceLocation?: string
  servicePrice?: number
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> => {
  const response = await fetch(url, init)
  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Request failed")
  }
  return payload
}

const mapBooking = (row: BookingRow, fallbackServiceName: string): ServiceBooking => ({
  bookingId: Number(row.id),
  userId: row.user_id !== undefined ? Number(row.user_id) : null,
  serviceId: Number(row.service_id),
  serviceType: row.service_type as SupportedServiceType,
  serviceName: row.service_name || fallbackServiceName,
  bookingDate: row.booking_date,
  bookingCount: Number(row.booking_count || 1),
  status: row.status,
  createdAt: row.created_at
})

const getServiceIdByName = async (serviceType: SupportedServiceType, serviceName: string): Promise<number | null> => {
  const target = normalize(serviceName)

  try {
    const byTypeEndpoint: Record<SupportedServiceType, string> = {
      tour: "/tours",
      trek: "/treks",
      restaurant: "/restaurants",
      car: "/car-rentals",
      property: "/properties",
    }
    const endpoint = `${API_BASE}${byTypeEndpoint[serviceType]}`
    if (serviceType === "tour") {
      const payload = await fetchJson<TourRow[]>(endpoint)
      const hit = payload.data?.find((item) => normalize(item.title) === target)
      if (hit) return Number(hit.id)
      const first = payload.data?.[0]
      if (first) return Number(first.id)
    } else if (serviceType === "trek") {
      const payload = await fetchJson<TrekRow[]>(endpoint)
      const hit = payload.data?.find((item) => normalize(item.title) === target)
      if (hit) return Number(hit.id)
      const first = payload.data?.[0]
      if (first) return Number(first.id)
    } else if (serviceType === "restaurant") {
      const payload = await fetchJson<RestaurantRow[]>(endpoint)
      const hit = payload.data?.find((item) => normalize(item.name) === target)
      if (hit) return Number(hit.id)
      const first = payload.data?.[0]
      if (first) return Number(first.id)
    } else if (serviceType === "car") {
      const payload = await fetchJson<CarRow[]>(endpoint)
      const hit = payload.data?.find((item) => normalize(item.car_name) === target)
      if (hit) return Number(hit.id)
      const first = payload.data?.[0]
      if (first) return Number(first.id)
    }
  } catch {
    // Keep fallback resolution paths below.
  }

  try {
    const payload = await fetchJson<ServiceRow[]>(
      `${API_BASE}/services?serviceType=${encodeURIComponent(serviceType)}`
    )
    const exact = payload.data?.find((item) => normalize(item.service_name || "") === target)
    if (exact) return Number(exact.id)
    const first = payload.data?.[0]
    return first ? Number(first.id) : null
  } catch {
    return null
  }
}

export const resolveServiceId = async (
  serviceType: SupportedServiceType,
  serviceName: string,
  serviceIdHint?: number
): Promise<number | null> => {
  const resolved = await getServiceIdByName(serviceType, serviceName)
  if (resolved) return resolved
  if (serviceIdHint && Number.isInteger(serviceIdHint) && serviceIdHint > 0) return serviceIdHint
  return null
}

const postBooking = async (
  token: string,
  serviceType: SupportedServiceType,
  serviceId: number,
  bookingDate: string,
  bookingCount: number,
  status: "pending" | "confirmed" | "cancelled",
  metadata?: {
    serviceName?: string
    serviceDescription?: string
    serviceLocation?: string
    servicePrice?: number
  }
): Promise<BookingRow> => {
  const payload = await fetchJson<BookingRow>(`${API_BASE}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      serviceType,
      serviceId,
      bookingCount,
      bookingDate,
      status,
      serviceName: metadata?.serviceName,
      serviceDescription: metadata?.serviceDescription,
      serviceLocation: metadata?.serviceLocation,
      servicePrice: metadata?.servicePrice,
    }),
  })
  if (!payload.data) {
    throw new Error("Unable to create booking")
  }
  return payload.data
}

const shouldRetryWithAnotherId = (errorMessage: string) => {
  const msg = errorMessage.toLowerCase()
  return msg.includes("service not found")
}

export const createServiceBooking = async (input: CreateServiceBookingInput): Promise<BookingRow> => {
  const bookingCount = input.bookingCount ?? 1
  const status = input.status ?? "pending"

  const candidateIds: number[] = []
  const resolvedByName = await getServiceIdByName(input.serviceType, input.serviceName)
  if (resolvedByName) {
    candidateIds.push(resolvedByName)
  }
  if (Number.isInteger(input.serviceIdHint) && input.serviceIdHint > 0 && !candidateIds.includes(input.serviceIdHint)) {
    candidateIds.push(input.serviceIdHint)
  }

  if (!candidateIds.length) {
    throw new Error("No valid service ID found for booking")
  }

  let lastError: Error | null = null
  for (const candidateId of candidateIds) {
    try {
      return await postBooking(
        input.token,
        input.serviceType,
        candidateId,
        input.bookingDate,
        bookingCount,
        status,
        {
          serviceName: input.serviceName,
          serviceDescription: input.serviceDescription,
          serviceLocation: input.serviceLocation,
          servicePrice: input.servicePrice
        }
      )
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Booking failed")
      if (!shouldRetryWithAnotherId(lastError.message)) {
        throw lastError
      }
    }
  }

  throw lastError || new Error("Booking failed")
}

export const createMappedServiceBooking = async (input: CreateServiceBookingInput): Promise<ServiceBooking> => {
  const booking = await createServiceBooking(input)
  return mapBooking(booking, input.serviceName)
}
