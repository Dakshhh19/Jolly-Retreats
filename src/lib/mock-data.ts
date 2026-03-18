// ─── Properties ───────────────────────────────────────
export interface Property {
  id: string
  name: string
  type: 'villa' | 'cottage'
  location: string
  price: number
  rating: number
  reviews: number
  capacity: number
  bedrooms: number
  bathrooms: number
  image: string
  images: string[]
  amenities: string[]
  description: string
  available: boolean
}

export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Emerald Cliff Villa',
    type: 'villa',
    location: 'Bali, Indonesia',
    price: 450,
    rating: 4.9,
    reviews: 128,
    capacity: 8,
    bedrooms: 4,
    bathrooms: 3,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    ],
    amenities: ['Pool', 'Ocean View', 'Wi-Fi', 'Kitchen', 'Air Conditioning', 'Parking', 'Garden', 'BBQ'],
    description: 'Perched on the edge of a stunning cliff, this luxurious villa offers panoramic ocean views, a private infinity pool, and world-class amenities for an unforgettable tropical retreat.',
    available: true,
  },
  {
    id: 'prop-2',
    name: 'Serene Mountain Cottage',
    type: 'cottage',
    location: 'Swiss Alps, Switzerland',
    price: 320,
    rating: 4.8,
    reviews: 96,
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    ],
    amenities: ['Fireplace', 'Mountain View', 'Wi-Fi', 'Kitchen', 'Heating', 'Parking'],
    description: 'Nestled among snow-capped peaks, this charming cottage blends rustic Alpine charm with modern comfort. Wake up to breathtaking mountain panoramas every morning.',
    available: true,
  },
  {
    id: 'prop-3',
    name: 'Coastal Haven Villa',
    type: 'villa',
    location: 'Amalfi Coast, Italy',
    price: 680,
    rating: 4.95,
    reviews: 203,
    capacity: 10,
    bedrooms: 5,
    bathrooms: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    ],
    amenities: ['Pool', 'Sea View', 'Wi-Fi', 'Kitchen', 'Air Conditioning', 'Wine Cellar', 'Terrace', 'Concierge'],
    description: 'A magnificent Mediterranean villa on the Amalfi Coast with terraced gardens, a stunning infinity pool, and direct access to the azure sea below.',
    available: true,
  },
  {
    id: 'prop-4',
    name: 'Forest Hideaway Cottage',
    type: 'cottage',
    location: 'Cotswolds, England',
    price: 195,
    rating: 4.7,
    reviews: 74,
    capacity: 3,
    bedrooms: 1,
    bathrooms: 1,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    ],
    amenities: ['Fireplace', 'Garden', 'Wi-Fi', 'Kitchen', 'Parking', 'Pet Friendly'],
    description: 'A quintessentially English cottage surrounded by wildflower meadows and ancient woodlands. The perfect escape for those seeking peace and natural beauty.',
    available: true,
  },
  {
    id: 'prop-5',
    name: 'Sunset Bay Villa',
    type: 'villa',
    location: 'Santorini, Greece',
    price: 520,
    rating: 4.85,
    reviews: 156,
    capacity: 6,
    bedrooms: 3,
    bathrooms: 3,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    ],
    amenities: ['Pool', 'Sunset View', 'Wi-Fi', 'Kitchen', 'Air Conditioning', 'Hot Tub', 'Terrace'],
    description: 'Watch the world-famous Santorini sunset from your private terrace. This whitewashed villa offers the ultimate Greek island experience with modern luxury.',
    available: false,
  },
  {
    id: 'prop-6',
    name: 'Lakeside Timber Lodge',
    type: 'cottage',
    location: 'Lake Como, Italy',
    price: 380,
    rating: 4.88,
    reviews: 112,
    capacity: 5,
    bedrooms: 2,
    bathrooms: 2,
    image: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    ],
    amenities: ['Lake View', 'Boat Dock', 'Wi-Fi', 'Kitchen', 'Fireplace', 'Garden', 'Parking'],
    description: 'A stunning lakeside retreat on the shores of Lake Como. Enjoy morning coffee on the dock, afternoon swims, and evenings by the fireplace.',
    available: true,
  },
]

// ─── Cars ─────────────────────────────────────────────
export interface Car {
  id: string
  name: string
  type: 'sedan' | 'suv' | 'luxury' | 'convertible'
  price: number
  seats: number
  transmission: 'automatic' | 'manual'
  image: string
  features: string[]
}

export const cars: Car[] = [
  {
    id: 'car-1',
    name: 'Mercedes-Benz S-Class',
    type: 'luxury',
    price: 180,
    seats: 5,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
    features: ['GPS', 'Leather Seats', 'Bluetooth', 'Climate Control'],
  },
  {
    id: 'car-2',
    name: 'BMW X5',
    type: 'suv',
    price: 140,
    seats: 7,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    features: ['GPS', 'All-Wheel Drive', 'Bluetooth', 'Panoramic Roof'],
  },
  {
    id: 'car-3',
    name: 'Porsche 911 Convertible',
    type: 'convertible',
    price: 320,
    seats: 2,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    features: ['GPS', 'Sport Mode', 'Leather Interior', 'Premium Sound'],
  },
  {
    id: 'car-4',
    name: 'Audi A6',
    type: 'sedan',
    price: 110,
    seats: 5,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    features: ['GPS', 'Heated Seats', 'Bluetooth', 'Parking Assist'],
  },
  {
    id: 'car-5',
    name: 'Range Rover Sport',
    type: 'suv',
    price: 200,
    seats: 5,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop',
    features: ['GPS', 'Off-Road Capable', 'Premium Audio', 'Adaptive Cruise'],
  },
  {
    id: 'car-6',
    name: 'Tesla Model S',
    type: 'sedan',
    price: 160,
    seats: 5,
    transmission: 'automatic',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
    features: ['Autopilot', 'Electric', 'Touchscreen', 'Premium Sound'],
  },
]

// ─── Tours ────────────────────────────────────────────
export interface Tour {
  id: string
  name: string
  category: 'trek' | 'hiking' | 'sightseeing'
  location: string
  duration: string
  difficulty: 'easy' | 'moderate' | 'hard'
  price: number
  rating: number
  image: string
  description: string
  maxGroup: number
}

export const tours: Tour[] = [
  {
    id: 'tour-1',
    name: 'Himalayan Base Camp Trek',
    category: 'trek',
    location: 'Nepal',
    duration: '12 days',
    difficulty: 'hard',
    price: 1200,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
    description: 'An epic journey through the Himalayas to the base camp of the world\'s highest peaks. Experience breathtaking scenery and ancient Sherpa culture.',
    maxGroup: 12,
  },
  {
    id: 'tour-2',
    name: 'Tuscany Wine Trail',
    category: 'hiking',
    location: 'Italy',
    duration: '4 days',
    difficulty: 'easy',
    price: 450,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop',
    description: 'Wander through rolling Tuscan hills, sampling world-class wines and savoring authentic Italian cuisine along the way.',
    maxGroup: 15,
  },
  {
    id: 'tour-3',
    name: 'Machu Picchu Explorer',
    category: 'sightseeing',
    location: 'Peru',
    duration: '3 days',
    difficulty: 'moderate',
    price: 680,
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop',
    description: 'Discover the ancient Incan citadel of Machu Picchu with expert guides. Explore hidden temples and learn about one of the world\'s greatest civilizations.',
    maxGroup: 20,
  },
  {
    id: 'tour-4',
    name: 'Patagonia Glacier Hike',
    category: 'hiking',
    location: 'Argentina',
    duration: '6 days',
    difficulty: 'moderate',
    price: 890,
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop',
    description: 'Trek across pristine glaciers and through ancient forests in one of the planet\'s last truly wild places.',
    maxGroup: 10,
  },
  {
    id: 'tour-5',
    name: 'Kyoto Temple Circuit',
    category: 'sightseeing',
    location: 'Japan',
    duration: '2 days',
    difficulty: 'easy',
    price: 340,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
    description: 'Immerse yourself in Japanese culture with guided tours of Kyoto\'s most magnificent temples, zen gardens, and geisha districts.',
    maxGroup: 18,
  },
  {
    id: 'tour-6',
    name: 'Kilimanjaro Summit Trek',
    category: 'trek',
    location: 'Tanzania',
    duration: '8 days',
    difficulty: 'hard',
    price: 2100,
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1621414050946-1b936a78431e?w=800&h=600&fit=crop',
    description: 'Conquer Africa\'s highest peak on this challenging but rewarding trek through five distinct climate zones to the roof of the continent.',
    maxGroup: 8,
  },
]

// ─── Restaurants ──────────────────────────────────────
export interface Restaurant {
  id: string
  name: string
  cuisine: string
  location: string
  rating: number
  priceRange: string
  image: string
  description: string
  openHours: string
}

export const restaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Le Jardin Doré',
    cuisine: 'French Fine Dining',
    location: 'Bali, Indonesia',
    rating: 4.9,
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    description: 'An exquisite French dining experience nestled in tropical gardens. Michelin-trained chefs craft seasonal menus using the finest local ingredients.',
    openHours: '6:00 PM - 11:00 PM',
  },
  {
    id: 'rest-2',
    name: 'Sakura Omakase',
    cuisine: 'Japanese',
    location: 'Kyoto, Japan',
    rating: 4.95,
    priceRange: '$$$$',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop',
    description: 'Intimate omakase experience with only 12 seats. Master sushi chef Takeshi presents a 20-course journey through the seasons.',
    openHours: '5:30 PM - 10:00 PM',
  },
  {
    id: 'rest-3',
    name: 'Terrazza Sul Mare',
    cuisine: 'Italian Mediterranean',
    location: 'Amalfi Coast, Italy',
    rating: 4.8,
    priceRange: '$$$',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    description: 'Dine on a cliff-edge terrace with sweeping views of the Mediterranean. Fresh seafood and handmade pasta define the menu.',
    openHours: '12:00 PM - 11:00 PM',
  },
  {
    id: 'rest-4',
    name: 'The Ember Room',
    cuisine: 'Contemporary Grill',
    location: 'Cotswolds, England',
    rating: 4.7,
    priceRange: '$$',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=800&h=600&fit=crop',
    description: 'A cozy, fire-lit dining room serving heritage breed meats and seasonal vegetables cooked over open flames.',
    openHours: '5:00 PM - 10:30 PM',
  },
]

// ─── Blog Posts ───────────────────────────────────────
export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: { name: string; avatar: string }
  date: string
  readTime: string
  image: string
  category: string
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'The Art of Slow Travel: Why Luxury Means Taking Your Time',
    excerpt: 'Discover why the world\'s most discerning travelers are choosing to slow down and deeply experience each destination.',
    content: 'In an age of jet-setting and Instagram highlights, a quiet revolution is underway among luxury travelers. The art of slow travel is about immersing yourself fully...',
    author: { name: 'Elena Vasquez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    date: '2026-02-15',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop',
    category: 'Travel Philosophy',
    tags: ['slow travel', 'luxury', 'wellness'],
  },
  {
    id: 'blog-2',
    title: 'Hidden Gems of the Amalfi Coast: Beyond the Tourist Trail',
    excerpt: 'Our expert guide reveals secret coves, family-run trattorias, and ancient pathways most visitors never discover.',
    content: 'The Amalfi Coast is one of the world\'s most photographed coastlines, but beneath its well-known beauty lies a network of hidden treasures...',
    author: { name: 'Marco Bellini', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
    date: '2026-02-10',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=1200&h=800&fit=crop',
    category: 'Destinations',
    tags: ['amalfi', 'italy', 'hidden gems'],
  },
  {
    id: 'blog-3',
    title: 'Sustainable Luxury: How Eco-Resorts Are Redefining Hospitality',
    excerpt: 'The new generation of eco-luxury resorts proves that sustainability and five-star comfort are no longer mutually exclusive.',
    content: 'From solar-powered infinity pools to farm-to-table restaurants with zero waste kitchens, a new breed of resort is proving that luxury...',
    author: { name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
    date: '2026-02-05',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=800&fit=crop',
    category: 'Sustainability',
    tags: ['eco', 'sustainable', 'luxury resorts'],
  },
  {
    id: 'blog-4',
    title: 'A Guide to Alpine Wellness: Healing in the Mountains',
    excerpt: 'From thermal springs to forest bathing, learn how the Alps have become the world\'s premier destination for holistic wellness.',
    content: 'The Alpine wellness tradition stretches back centuries, when European aristocracy first discovered the healing powers of mountain air...',
    author: { name: 'Elena Vasquez', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
    date: '2026-01-28',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
    category: 'Wellness',
    tags: ['alps', 'wellness', 'spa'],
  },
]

// ─── Testimonials ─────────────────────────────────────
export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  text: string
  rating: number
  property: string
}

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Alexandra Chen',
    role: 'Travel Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    text: 'Jolly Retreats transformed our family vacation into an unforgettable experience. The villa was beyond our expectations, and the concierge service was impeccable.',
    rating: 5,
    property: 'Emerald Cliff Villa, Bali',
  },
  {
    id: 'test-2',
    name: 'James Harrington',
    role: 'Business Executive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    text: 'The attention to detail is what sets Jolly Retreats apart. From the seamless booking to the thoughtful local recommendations, every moment was curated perfectly.',
    rating: 5,
    property: 'Coastal Haven Villa, Amalfi',
  },
  {
    id: 'test-3',
    name: 'Sophie Laurent',
    role: 'Photographer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    text: 'I have traveled to over 40 countries, and the mountain cottage in Switzerland was one of the most magical stays of my life. Pure tranquility.',
    rating: 5,
    property: 'Serene Mountain Cottage, Swiss Alps',
  },
  {
    id: 'test-4',
    name: 'David Kim',
    role: 'Architect',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    text: 'The guided trekking tour was exceptionally organized. Professional guides, breathtaking trails, and the logistics were handled flawlessly.',
    rating: 5,
    property: 'Himalayan Base Camp Trek',
  },
]

// ─── Destinations ─────────────────────────────────────
export interface Destination {
  id: string
  name: string
  country: string
  image: string
  propertyCount: number
}

export const destinations: Destination[] = [
  {
    id: 'dest-1',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop',
    propertyCount: 24,
  },
  {
    id: 'dest-2',
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=800&h=600&fit=crop',
    propertyCount: 18,
  },
  {
    id: 'dest-3',
    name: 'Swiss Alps',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
    propertyCount: 12,
  },
  {
    id: 'dest-4',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
    propertyCount: 15,
  },
]

// ─── Bookings (for dashboard) ─────────────────────────
export interface Booking {
  id: string
  type: 'property' | 'car' | 'tour' | 'restaurant'
  itemName: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  total: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
}

export const bookings: Booking[] = [
  { id: 'bk-1', type: 'property', itemName: 'Emerald Cliff Villa', location: 'Bali, Indonesia', checkIn: '2026-03-15', checkOut: '2026-03-22', guests: 4, total: 3150, status: 'confirmed' },
  { id: 'bk-2', type: 'car', itemName: 'Mercedes-Benz S-Class', location: 'Bali, Indonesia', checkIn: '2026-03-15', checkOut: '2026-03-22', guests: 1, total: 1260, status: 'confirmed' },
  { id: 'bk-3', type: 'tour', itemName: 'Tuscany Wine Trail', location: 'Italy', checkIn: '2026-04-10', checkOut: '2026-04-14', guests: 2, total: 900, status: 'pending' },
  { id: 'bk-4', type: 'property', itemName: 'Coastal Haven Villa', location: 'Amalfi Coast, Italy', checkIn: '2026-01-10', checkOut: '2026-01-17', guests: 6, total: 4760, status: 'completed' },
  { id: 'bk-5', type: 'restaurant', itemName: 'Le Jardin Doré', location: 'Bali, Indonesia', checkIn: '2026-01-16', checkOut: '2026-01-16', guests: 4, total: 320, status: 'completed' },
]

// ─── Admin Stats ──────────────────────────────────────
export const adminStats = {
  totalBookings: 1247,
  revenue: 892450,
  activeUsers: 3891,
  occupancyRate: 87,
  revenueGrowth: 12.5,
  bookingGrowth: 8.3,
  userGrowth: 15.2,
}
