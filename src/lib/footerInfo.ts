export type FooterInfo = {
  slug: string
  title: string
  section: 'Company' | 'Support' | 'Legal'
  summary: string
  highlights: string[]
}

export const footerInfoItems: FooterInfo[] = [
  {
    slug: 'about-us',
    title: 'About Us',
    section: 'Company',
    summary: 'Jolly Retreats designs premium stays and curated experiences with a focus on comfort, safety, and local authenticity.',
    highlights: [
      'Global stays and experiences across properties, tours, treks, restaurants, and rentals.',
      'Verified partners and quality standards for every listed service.',
      'Dedicated support from planning to post-trip assistance.'
    ]
  },
  {
    slug: 'careers',
    title: 'Careers',
    section: 'Company',
    summary: 'We are building a travel platform team across product, engineering, operations, and customer experience.',
    highlights: [
      'Remote-friendly collaboration with global teams.',
      'Roles in frontend, backend, analytics, and travel operations.',
      'Growth-focused culture with ownership and impact.'
    ]
  },
  {
    slug: 'press',
    title: 'Press',
    section: 'Company',
    summary: 'Media resources, brand assets, and company updates for journalists and publishers.',
    highlights: [
      'Official announcements and product launches.',
      'Brand usage and press contact coordination.',
      'Background information for interviews and features.'
    ]
  },
  {
    slug: 'partners',
    title: 'Partners',
    section: 'Company',
    summary: 'Partnership programs for hotels, hosts, guides, restaurants, and mobility providers.',
    highlights: [
      'List and manage services in one admin workflow.',
      'Performance visibility via analytics and order trends.',
      'Reliable payout and operational support channels.'
    ]
  },
  {
    slug: 'contact',
    title: 'Contact',
    section: 'Company',
    summary: 'Reach our team for account help, partnership queries, or trip-related assistance.',
    highlights: [
      'Email: concierge@jollyretreats.com',
      'Phone: +41 22 123 4567',
      'Address: 123 Luxury Lane, Geneva, Switzerland'
    ]
  },
  {
    slug: 'help-center',
    title: 'Help Center',
    section: 'Support',
    summary: 'Support resources for bookings, account access, payments, and service availability.',
    highlights: [
      'How to create, confirm, or cancel reservations.',
      'Guides for user and admin dashboards.',
      'Troubleshooting for login and account issues.'
    ]
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation Policy',
    section: 'Support',
    summary: 'Cancellation terms vary by service and provider. Always review conditions before confirming.',
    highlights: [
      'Some services allow free cancellation within a limited window.',
      'Late cancellations may include partial or full charges.',
      'Provider-specific terms are shown during checkout.'
    ]
  },
  {
    slug: 'safety',
    title: 'Safety',
    section: 'Support',
    summary: 'Safety standards are applied across listings, with additional checks for high-activity experiences.',
    highlights: [
      'Verified listing information and partner identity checks.',
      'Emergency contact support for active bookings.',
      'Clear safety instructions for treks, tours, and transport.'
    ]
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    section: 'Support',
    summary: 'We continue improving platform accessibility across content, navigation, and interactions.',
    highlights: [
      'Keyboard-friendly navigation and focus visibility.',
      'Readable contrast and scalable text on major screens.',
      'Ongoing fixes for compatibility and usability gaps.'
    ]
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    section: 'Support',
    summary: 'Terms define account responsibilities, booking behavior, payment handling, and platform usage limits.',
    highlights: [
      'Users must provide accurate signup and booking information.',
      'Admins and partners must manage listings responsibly.',
      'Violations may lead to account restriction or termination.'
    ]
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    section: 'Legal',
    summary: 'We collect essential account and booking data to operate services securely and reliably.',
    highlights: [
      'Data is used for authentication, bookings, and support operations.',
      'Sensitive fields such as passwords are stored securely.',
      'Users can request account-related help through support channels.'
    ]
  },
  {
    slug: 'cookies',
    title: 'Cookies',
    section: 'Legal',
    summary: 'Cookies help maintain session state, performance, and essential product behavior.',
    highlights: [
      'Authentication state persists using secure browser storage.',
      'Usage data supports product quality and diagnostics.',
      'Disabling cookies may affect login and reservation flows.'
    ]
  }
]

export const footerInfoBySlug = (slug: string) =>
  footerInfoItems.find((item) => item.slug === slug) || null
