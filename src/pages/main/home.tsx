import { HeroSection } from "@/components/landing/hero-section"
import { ServicesSection } from "@/components/landing/services-section"
import { DestinationsSection } from "@/components/landing/destinations-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { NewsletterSection } from "@/components/landing/newsletter-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <DestinationsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  )
}
