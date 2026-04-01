/**
 * Route configuration and constants
 * Centralized definitions for all application routes
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  USER_DASHBOARD: '/user-dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard',
  
  // Blog routes
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:id',
  
  // Properties routes
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: '/properties/:id',
  
  // Marketplace routes
  CARS: '/cars',
  CAR_RENTALS: '/car-rentals',
  CAR_DETAIL: '/cars/:id',
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurants/:id',
  TOURS: '/tours',
  TOUR_DETAIL: '/tours/:id',
  TREKS: '/treks',
  TREK_DETAIL: '/treks/:id',
  
  // User routes
  DASHBOARD: '/dashboard',
  CHECKOUT: '/checkout',
  SEARCH: '/search',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_CARS: '/admin/cars',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PROPERTIES: '/admin/properties',
  ADMIN_RESTAURANTS: '/admin/restaurants',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
} as const

export const ROUTE_GROUPS = {
  PUBLIC: [
    ROUTES.HOME,
    ROUTES.BLOG,
    ROUTES.BLOG_DETAIL,
    ROUTES.PROPERTIES,
    ROUTES.PROPERTY_DETAIL,
    ROUTES.CARS,
    ROUTES.CAR_RENTALS,
    ROUTES.CAR_DETAIL,
    ROUTES.RESTAURANTS,
    ROUTES.RESTAURANT_DETAIL,
    ROUTES.TOURS,
    ROUTES.TOUR_DETAIL,
    ROUTES.TREKS,
    ROUTES.TREK_DETAIL,
    ROUTES.DASHBOARD,
    ROUTES.CHECKOUT,
    ROUTES.SEARCH,
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.USER_DASHBOARD,
    ROUTES.ADMIN_DASHBOARD,
  ],
  ADMIN: [
    ROUTES.ADMIN,
    ROUTES.ADMIN_BLOG,
    ROUTES.ADMIN_CARS,
    ROUTES.ADMIN_ORDERS,
    ROUTES.ADMIN_PROPERTIES,
    ROUTES.ADMIN_RESTAURANTS,
    ROUTES.ADMIN_TOURS,
    ROUTES.ADMIN_USERS,
    ROUTES.ADMIN_SETTINGS,
  ],
} as const

/**
 * Navigation links for main navbar
 */
export const MAIN_NAV_LINKS = [
  { label: 'Properties', href: ROUTES.PROPERTIES },
  { label: 'Tours', href: ROUTES.TOURS },
  { label: 'Treks', href: ROUTES.TREKS },
  { label: 'Restaurants', href: ROUTES.RESTAURANTS },
  { label: 'Car Rentals', href: ROUTES.CARS },
  { label: 'Blog', href: ROUTES.BLOG },
] as const

/**
 * Navigation links for admin sidebar
 */
export const ADMIN_NAV_LINKS = [
  { label: 'Dashboard', href: ROUTES.ADMIN },
  { label: 'Blog', href: ROUTES.ADMIN_BLOG },
  { label: 'Properties', href: ROUTES.ADMIN_PROPERTIES },
  { label: 'Cars', href: ROUTES.ADMIN_CARS },
  { label: 'Orders', href: ROUTES.ADMIN_ORDERS },
  { label: 'Tours', href: ROUTES.ADMIN_TOURS },
  { label: 'Restaurants', href: ROUTES.ADMIN_RESTAURANTS },
  { label: 'Users', href: ROUTES.ADMIN_USERS },
  { label: 'Settings', href: ROUTES.ADMIN_SETTINGS },
] as const
