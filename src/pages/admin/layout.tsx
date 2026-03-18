import { Outlet } from "react-router-dom"
import { Link, NavLink } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function AdminLayout() {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-secondary'
    }`

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-card p-6">
          <Link to="/" className="font-serif text-xl font-bold text-foreground mb-8 block">
            Jolly Retreats
          </Link>
          <nav className="space-y-2">
            <NavLink to="/admin" end className={navItemClass}>Dashboard</NavLink>
            <NavLink to="/admin/blog" className={navItemClass}>Blog</NavLink>
            <NavLink to="/admin/properties" className={navItemClass}>Properties</NavLink>
            <NavLink to="/admin/cars" className={navItemClass}>Cars</NavLink>
            <NavLink to="/admin/orders" className={navItemClass}>Orders</NavLink>
            <NavLink to="/admin/tours" className={navItemClass}>Tours</NavLink>
            <NavLink to="/admin/treks" className={navItemClass}>Treks</NavLink>
            <NavLink to="/admin/restaurants" className={navItemClass}>Restaurants</NavLink>
            <NavLink to="/admin/users" className={navItemClass}>Users</NavLink>
            <NavLink to="/admin/settings" className={navItemClass}>Settings</NavLink>
          </nav>
          <div className="mt-8 pt-8 border-t border-border">
            <Link to="/">
              <Button variant="outline" className="w-full">Back to Site</Button>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
