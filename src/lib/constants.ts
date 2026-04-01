/**
 * Application constants
 * Centralized configuration values used throughout the app
 */

/**
 * App metadata
 */
export const APP_NAME = 'Jolly Retreats'
export const APP_DESCRIPTION = 'Discover extraordinary travel experiences'
export const APP_VERSION = '1.0.0'

/**
 * Sorting options for listings
 */
export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
] as const

/**
 * Property type filters
 */
export const PROPERTY_TYPES = [
  'Villa',
  'Cottage',
  'Cabin',
  'Bungalow',
  'Houseboat',
] as const

/**
 * Amenities for properties
 */
export const AMENITIES = [
  'WiFi',
  'Pool',
  'Kitchen',
  'BBQ',
  'AC',
  'TV',
  'Parking',
  'Garden',
] as const

/**
 * Price range limits
 */
export const PRICE_RANGE = {
  MIN: 0,
  MAX: 10000,
  STEP: 100,
} as const

/**
 * Pagination
 */
export const PAGINATION = {
  ITEMS_PER_PAGE: 12,
  MAX_PAGES: 10,
} as const

/**
 * Blog categories
 */
export const BLOG_CATEGORIES = [
  'Travel',
  'Food',
  'Lifestyle',
  'Adventure',
  'Reviews',
] as const

/**
 * Tour difficulty levels
 */
export const TOUR_DIFFICULTY = [
  'Easy',
  'Moderate',
  'Hard',
  'Expert',
] as const

/**
 * Cuisine types
 */
export const CUISINE_TYPES = [
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Continental',
  'Fusion',
] as const

/**
 * Toast duration in milliseconds
 */
export const TOAST_DURATION = 3000

/**
 * Debounce delay for search in milliseconds
 */
export const SEARCH_DEBOUNCE_MS = 300

/**
 * Animation durations in milliseconds
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const
