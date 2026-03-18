import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from '@/pages/main/layout'
import AdminLayout from '@/pages/admin/layout'

// Main pages
import HomePage from '@/pages/main/home'
import BlogPage from '@/pages/main/blog/blog'
import BlogDetailPage from '@/pages/main/blog/blog-detail'
import CarsPage from '@/pages/main/cars'
import CheckoutPage from '@/pages/main/checkout'
import DashboardPage from '@/pages/main/dashboard'
import PropertiesPage from '@/pages/main/properties'
import PropertiesDetailPage from '@/pages/main/properties/properties-detail'
import RestaurantsPage from '@/pages/main/restaurants'
import ToursPage from '@/pages/main/tours'
import TreksPage from '@/pages/main/treks'
import SearchPage from '@/pages/main/search'
import InfoDetailPage from '@/pages/main/info-detail'
import TourDetailPage from '@/pages/main/tours/tour-detail'
import TrekDetailPage from '@/pages/main/treks/trek-detail'
import RestaurantDetailPage from '@/pages/main/restaurants/restaurant-detail'
import CarDetailPage from '@/pages/main/cars/car-detail'

// Auth pages
import LoginPage from '@/pages/auth/login'
import SignupPage from '@/pages/auth/signup'

// Dashboards
import UserDashboard from '@/dashboards/user-dashboard'
import AdminDashboard from '@/dashboards/admin-dashboard'

// Protected Route
import { ProtectedRoute } from '@/auth/ProtectedRoute'

// Admin pages
import AdminPage from '@/pages/admin/admin'
import AdminBlogPage from '@/pages/admin/blog'
import AdminCarsPage from '@/pages/admin/cars'
import AdminOrdersPage from '@/pages/admin/orders'
import AdminPropertiesPage from '@/pages/admin/properties'
import AdminRestaurantsPage from '@/pages/admin/restaurants'
import AdminSettingsPage from '@/pages/admin/settings'
import AdminToursPage from '@/pages/admin/tours'
import AdminTreksPage from '@/pages/admin/treks'
import AdminUsersPage from '@/pages/admin/users'

// 404 Component
import NotFound from '@/components/common/NotFound'

/**
 * Centralized route configuration for the entire application
 * Separates route definitions from the main App component
 */
export const AppRoutes = () => (
  <Routes>
    {/* Public auth routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    {/* Protected dashboards */}
    <Route
      path="/user-dashboard"
      element={
        <ProtectedRoute requiredRole="user">
          <UserDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin-dashboard"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Main routes with shared layout */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:id" element={<BlogDetailPage />} />
      <Route path="/cars" element={<CarsPage />} />
      <Route path="/car-rentals" element={<CarsPage />} />
      <Route path="/cars/:id" element={<CarDetailPage />} />
      <Route path="/car-rentals/:id" element={<CarDetailPage />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute requiredRole="user">
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/properties/:id" element={<PropertiesDetailPage />} />
      <Route path="/restaurants" element={<RestaurantsPage />} />
      <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/tours/:id" element={<TourDetailPage />} />
      <Route path="/treks" element={<TreksPage />} />
      <Route path="/treks/:id" element={<TrekDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/info/:slug" element={<InfoDetailPage />} />
    </Route>

    {/* Admin routes with admin layout */}
    <Route
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/blog" element={<AdminBlogPage />} />
      <Route path="/admin/cars" element={<AdminCarsPage />} />
      <Route path="/admin/orders" element={<AdminOrdersPage />} />
      <Route path="/admin/properties" element={<AdminPropertiesPage />} />
      <Route path="/admin/restaurants" element={<AdminRestaurantsPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/admin/tours" element={<AdminToursPage />} />
      <Route path="/admin/treks" element={<AdminTreksPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
    </Route>

    {/* 404 Page */}
    <Route path="/404" element={<NotFound />} />
    
    {/* Catch-all fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default AppRoutes
