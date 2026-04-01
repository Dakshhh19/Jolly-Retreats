import { useEffect, useState, type FormEvent } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { Menu, User, Search, LogOut, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import AuthService from "@/services/authService"
import { MAIN_NAV_LINKS, ROUTES } from "@/config"
import { getDashboardRoute } from "@/auth/privileges"

const navLinks = MAIN_NAV_LINKS

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  
  const isAuthenticated = AuthService.isAuthenticated()
  const userRole = AuthService.getUserRole()
  const user = AuthService.getCurrentUser()
  const dashboardRoute = getDashboardRoute(userRole === 'admin' ? 'admin' : userRole === 'user' ? 'user' : null)

  useEffect(() => {
    if (location.pathname !== ROUTES.SEARCH) return
    const params = new URLSearchParams(location.search)
    setSearchQuery(params.get('q') || '')
  }, [location.pathname, location.search])

  const handleLogout = async () => {
    const result = await AuthService.logout()
    setIsOpen(false)
    toast.success(result.message)
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    executeSearch()
  }

  const executeSearch = () => {
    const query = searchQuery.trim()
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`)
    setSearchOpen(false)
    setIsOpen(false)
  }

  const clearSearch = () => {
    setSearchOpen(false)
    setSearchQuery('')
    if (location.pathname === ROUTES.SEARCH) {
      navigate(ROUTES.SEARCH)
    }
  }

  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-2 py-1 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-foreground'
    }`

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-lg font-medium transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-foreground hover:text-primary'
    }`

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
          </div>
          <span className="font-serif text-xl font-bold text-foreground tracking-tight">
            Jolly Retreats
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={desktopNavClass}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Search Bar */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <Input
                type="text"
                placeholder="Search properties, tours, treks, restaurants, cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-10"
                autoFocus
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="ml-2"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
          
          {!isAuthenticated ? (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to={dashboardRoute}>
                <Button variant="ghost" size="icon" aria-label="User account">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Logout"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          
        </div>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-background">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                  <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
                </div>
                <span className="font-serif text-xl font-bold text-foreground">Jolly Retreats</span>
              </Link>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search everything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    className={mobileNavClass}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                {!isAuthenticated ? (
                  <>
                    <Link to={ROUTES.LOGIN} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to={ROUTES.SIGNUP} onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 rounded border border-border">
                      <p className="text-xs text-muted-foreground">Logged in as</p>
                      <p className="text-sm font-semibold text-foreground">{user?.fullName}</p>
                    </div>
                    <Link to={dashboardRoute} onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        {userRole === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
