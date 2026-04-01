import { Link } from "react-router-dom"
import { MapPin, Phone, Mail } from "lucide-react"

const footerSections = [
  {
    title: "Explore",
    links: [
      { label: "Villas & Cottages", href: "/properties" },
      { label: "Car Rentals", href: "/cars" },
      { label: "Tours & Treks", href: "/tours" },
      { label: "Restaurants", href: "/restaurants" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/info/about-us" },
      { label: "Careers", href: "/info/careers" },
      { label: "Press", href: "/info/press" },
      { label: "Partners", href: "/info/partners" },
      { label: "Contact", href: "/info/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/info/help-center" },
      { label: "Cancellation Policy", href: "/info/cancellation-policy" },
      { label: "Safety", href: "/info/safety" },
      { label: "Accessibility", href: "/info/accessibility" },
      { label: "Terms of Service", href: "/info/terms-of-service" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="font-serif text-sm font-bold text-primary-foreground">JR</span>
              </div>
              <span className="font-serif text-xl font-bold text-background">
                Jolly Retreats
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-background/70">
              Curating unforgettable luxury travel experiences worldwide. From stunning villas to guided adventures, we bring your dream retreat to life.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>123 Luxury Lane, Geneva, Switzerland</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+41 22 123 4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="h-4 w-4 shrink-0" />
                <span>concierge@jollyretreats.com</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-background/50">
                {section.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
          <p className="text-sm text-background/50">
            2026 Jolly Retreats. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/info/privacy-policy" className="text-sm text-background/50 transition-colors hover:text-background">Privacy Policy</Link>
            <Link to="/info/terms-of-service" className="text-sm text-background/50 transition-colors hover:text-background">Terms</Link>
            <Link to="/info/cookies" className="text-sm text-background/50 transition-colors hover:text-background">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
