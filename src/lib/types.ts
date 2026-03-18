/**
 * Shared type definitions across the application
 * Centralized types to avoid duplication
 * 
 * Note: Most entity types (BlogPost, Car, Property, Tour, Restaurant, Testimonial)
 * are defined in mock-data.ts with their data arrays. They are re-exported from lib/index.ts
 */

/**
 * Navigation link type
 */
export interface NavLink {
  label: string
  href: string
}
