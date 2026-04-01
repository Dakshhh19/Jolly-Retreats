import { bookings as seedBookings, type Booking } from '@/lib/mock-data'

const BOOKING_STORAGE_KEY = 'jr_bookings'
const BOOKING_UPDATED_EVENT = 'jr_bookings_updated'

export interface CreateBookingInput {
  type: Booking['type']
  itemName: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  status?: Booking['status']
}

class BookingService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  private static writeBookings(data: Booking[]): void {
    if (!this.isBrowser()) return
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT))
  }

  private static readBookings(): Booking[] {
    if (!this.isBrowser()) return [...seedBookings]

    const raw = localStorage.getItem(BOOKING_STORAGE_KEY)
    if (!raw) {
      this.writeBookings(seedBookings)
      return [...seedBookings]
    }

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed as Booking[]
      }
    } catch {
      // fallback to seed bookings if storage is malformed
    }

    this.writeBookings(seedBookings)
    return [...seedBookings]
  }

  static getBookings(): Booking[] {
    return this.readBookings()
  }

  static addBooking(input: CreateBookingInput): Booking {
    const newBooking: Booking = {
      id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: input.type,
      itemName: input.itemName,
      location: input.location,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      total: input.total,
      status: input.status ?? 'confirmed',
    }

    const current = this.readBookings()
    this.writeBookings([newBooking, ...current])
    return newBooking
  }

  static subscribe(callback: () => void): () => void {
    if (!this.isBrowser()) return () => {}

    const handleStorage = (event: StorageEvent) => {
      if (event.key === BOOKING_STORAGE_KEY) {
        callback()
      }
    }
    const handleCustom = () => callback()

    window.addEventListener('storage', handleStorage)
    window.addEventListener(BOOKING_UPDATED_EVENT, handleCustom as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(BOOKING_UPDATED_EVENT, handleCustom as EventListener)
    }
  }
}

export default BookingService
