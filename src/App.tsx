import { BrowserRouter as Router, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import ScrollToTop from '@/components/common/ScrollToTop'
import AppRoutes from '@/routes/AppRoutes'

function AnimatedRouteContainer() {
  const location = useLocation()

  return (
    <div
      key={`${location.pathname}${location.search}${location.hash}`}
      className="route-enter-animation"
    >
      <AppRoutes />
    </div>
  )
}

/**
 * Root application component
 * Provides theme context and routing configuration
 */
function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <AnimatedRouteContainer />
      </Router>
    </ThemeProvider>
  )
}

export default App
