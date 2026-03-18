CREATE DATABASE IF NOT EXISTS retreat_platform_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE retreat_platform_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  security_question VARCHAR(255) NULL,
  security_answer_hash VARCHAR(255) NULL,
  security_answer_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  security_answer_locked_until DATETIME NULL,
  password_reset_token_hash VARCHAR(64) NULL,
  password_reset_expires_at DATETIME NULL,
  contact_number VARCHAR(25) NOT NULL UNIQUE,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_blocked (is_blocked)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  service_type ENUM('tour', 'trek', 'restaurant', 'car', 'property', 'stay', 'experience') NOT NULL,
  service_name VARCHAR(150) NULL,
  description TEXT NULL,
  location VARCHAR(150) NULL,
  price DECIMAL(10,2) NULL,
  max_capacity INT UNSIGNED NOT NULL DEFAULT 50,
  current_bookings INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('available', 'limited', 'full', 'closed') NOT NULL DEFAULT 'available',
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_services_id_type (id, service_type),
  INDEX idx_services_type (service_type),
  INDEX idx_services_status (status),
  INDEX idx_services_capacity (max_capacity, current_bookings)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tours (
  id INT UNSIGNED PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  location VARCHAR(150) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(60) NOT NULL,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tours_services
    FOREIGN KEY (id) REFERENCES services(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS treks (
  id INT UNSIGNED PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  difficulty_level ENUM('easy', 'moderate', 'hard', 'extreme') NOT NULL,
  location VARCHAR(150) NOT NULL,
  duration VARCHAR(60) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_treks_services
    FOREIGN KEY (id) REFERENCES services(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS restaurants (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  cuisine_type VARCHAR(80) NOT NULL,
  location VARCHAR(150) NOT NULL,
  price_range VARCHAR(40) NOT NULL,
  rating DECIMAL(2,1) NULL,
  description TEXT NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_restaurants_services
    FOREIGN KEY (id) REFERENCES services(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT chk_restaurants_rating
    CHECK (rating IS NULL OR (rating >= 0.0 AND rating <= 5.0))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS car_rentals (
  id INT UNSIGNED PRIMARY KEY,
  car_name VARCHAR(120) NOT NULL,
  company VARCHAR(120) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  location VARCHAR(150) NOT NULL,
  seats TINYINT UNSIGNED NOT NULL,
  fuel_type VARCHAR(30) NOT NULL,
  image_url VARCHAR(500) NULL,
  CONSTRAINT fk_car_rentals_services
    FOREIGN KEY (id) REFERENCES services(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS properties (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(150) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  capacity TINYINT UNSIGNED NOT NULL,
  bedrooms TINYINT UNSIGNED NOT NULL,
  bathrooms TINYINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NULL,
  description TEXT NULL,
  CONSTRAINT fk_properties_services
    FOREIGN KEY (id) REFERENCES services(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  service_type ENUM('tour', 'trek', 'restaurant', 'car', 'property', 'stay', 'experience') NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  booking_count INT UNSIGNED NOT NULL DEFAULT 1,
  booking_date DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bookings_user_id (user_id),
  INDEX idx_bookings_service (service_type, service_id),
  INDEX idx_bookings_date (booking_date),
  INDEX idx_bookings_service_date (service_id, booking_date),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookings_service
    FOREIGN KEY (service_id, service_type) REFERENCES services(id, service_type)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tour_availability (
  tour_id INT UNSIGNED PRIMARY KEY,
  min_start_date DATE NOT NULL,
  max_end_date DATE NOT NULL,
  CONSTRAINT fk_tour_availability_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tour_bookings (
  booking_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_reference VARCHAR(40) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_people INT UNSIGNED NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tour_bookings_user (user_id),
  INDEX idx_tour_bookings_tour (tour_id),
  INDEX idx_tour_bookings_dates (start_date, end_date),
  CONSTRAINT fk_tour_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tour_bookings_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS booking_travelers (
  traveler_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  age TINYINT UNSIGNED NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  contact_number VARCHAR(25) NOT NULL,
  INDEX idx_booking_travelers_booking (booking_id),
  CONSTRAINT fk_booking_travelers_booking
    FOREIGN KEY (booking_id) REFERENCES tour_bookings(booking_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS analytics (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  metric_key VARCHAR(120) NOT NULL,
  metric_value DECIMAL(14,2) NOT NULL DEFAULT 0,
  dimension VARCHAR(120) NULL,
  captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_analytics_metric_key (metric_key),
  INDEX idx_analytics_captured_at (captured_at)
) ENGINE=InnoDB;

INSERT INTO users (full_name, email, password_hash, security_question, security_answer_hash, contact_number, role)
SELECT
  'Admin User',
  'admin@example.com',
  '$2a$10$euiu2LRoFkL03DTzuJitY.Rjrd0f3LKIabEre7zcOOY4QhGp38F0G',
  'What is the name of your first pet?',
  '$2a$10$sRRTfCVR0tXF/ROQ7.O0A.Qn0wgdyCJCO0fIjtYZDWWdUPm3dWDuC',
  '+1234567890',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@example.com'
);

INSERT INTO services (id, service_type)
SELECT 1, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 1);
INSERT INTO services (id, service_type)
SELECT 2, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 2);
INSERT INTO services (id, service_type)
SELECT 3, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 3);
INSERT INTO services (id, service_type)
SELECT 4, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 4);
INSERT INTO services (id, service_type)
SELECT 5, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 5);
INSERT INTO services (id, service_type)
SELECT 6, 'property' WHERE NOT EXISTS (SELECT 1 FROM services WHERE id = 6);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  1,
  'Emerald Cliff Villa',
  'Bali, Indonesia',
  450,
  8,
  4,
  3,
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
  'Perched on the edge of a stunning cliff, this luxurious villa offers panoramic ocean views.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 1);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  2,
  'Serene Mountain Cottage',
  'Swiss Alps, Switzerland',
  320,
  4,
  2,
  2,
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop',
  'Nestled among snow-capped peaks, this charming cottage blends rustic Alpine charm with modern comfort.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 2);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  3,
  'Coastal Haven Villa',
  'Amalfi Coast, Italy',
  680,
  10,
  5,
  4,
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
  'A magnificent Mediterranean villa on the Amalfi Coast with terraced gardens and a stunning infinity pool.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 3);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  4,
  'Forest Hideaway Cottage',
  'Cotswolds, England',
  195,
  3,
  1,
  1,
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop',
  'A quintessentially English cottage surrounded by wildflower meadows and ancient woodlands.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 4);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  5,
  'Sunset Bay Villa',
  'Santorini, Greece',
  520,
  6,
  3,
  3,
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
  'Watch the world-famous Santorini sunset from your private terrace in this modern whitewashed villa.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 5);

INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
SELECT
  6,
  'Lakeside Timber Lodge',
  'Lake Como, Italy',
  380,
  5,
  2,
  2,
  'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop',
  'A stunning lakeside retreat on the shores of Lake Como with dock access and mountain views.'
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id = 6);

INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
SELECT
  'tour',
  'Tuscany Wine Trail',
  'Wander through rolling Tuscan hills, sampling world-class wines and savoring authentic Italian cuisine along the way.',
  'Italy',
  450,
  15,
  0,
  'available',
  1
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Tuscany Wine Trail');

INSERT INTO tours (id, title, description, location, price, duration, image_url)
SELECT
  s.id,
  'Tuscany Wine Trail',
  'Wander through rolling Tuscan hills, sampling world-class wines and savoring authentic Italian cuisine along the way.',
  'Italy',
  450,
  '4 days',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop'
FROM services s
WHERE s.service_type = 'tour'
  AND s.service_name = 'Tuscany Wine Trail'
  AND NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Tuscany Wine Trail');

INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
SELECT id, '2026-04-01', '2026-10-31'
FROM tours
WHERE title = 'Tuscany Wine Trail'
ON DUPLICATE KEY UPDATE
  min_start_date = VALUES(min_start_date),
  max_end_date = VALUES(max_end_date);

INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
SELECT
  'tour',
  'Machu Picchu Explorer',
  'Discover the ancient Incan citadel of Machu Picchu with expert guides. Explore hidden temples and learn about one of the world''s greatest civilizations.',
  'Peru',
  680,
  20,
  0,
  'available',
  1
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Machu Picchu Explorer');

INSERT INTO tours (id, title, description, location, price, duration, image_url)
SELECT
  s.id,
  'Machu Picchu Explorer',
  'Discover the ancient Incan citadel of Machu Picchu with expert guides. Explore hidden temples and learn about one of the world''s greatest civilizations.',
  'Peru',
  680,
  '3 days',
  'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop'
FROM services s
WHERE s.service_type = 'tour'
  AND s.service_name = 'Machu Picchu Explorer'
  AND NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Machu Picchu Explorer');

INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
SELECT id, '2026-05-01', '2026-11-30'
FROM tours
WHERE title = 'Machu Picchu Explorer'
ON DUPLICATE KEY UPDATE
  min_start_date = VALUES(min_start_date),
  max_end_date = VALUES(max_end_date);

INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
SELECT
  'tour',
  'Patagonia Glacier Hike',
  'Trek across pristine glaciers and through ancient forests in one of the planet''s last truly wild places.',
  'Argentina',
  890,
  10,
  0,
  'available',
  1
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Patagonia Glacier Hike');

INSERT INTO tours (id, title, description, location, price, duration, image_url)
SELECT
  s.id,
  'Patagonia Glacier Hike',
  'Trek across pristine glaciers and through ancient forests in one of the planet''s last truly wild places.',
  'Argentina',
  890,
  '6 days',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&h=600&fit=crop'
FROM services s
WHERE s.service_type = 'tour'
  AND s.service_name = 'Patagonia Glacier Hike'
  AND NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Patagonia Glacier Hike');

INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
SELECT id, '2026-06-15', '2026-12-15'
FROM tours
WHERE title = 'Patagonia Glacier Hike'
ON DUPLICATE KEY UPDATE
  min_start_date = VALUES(min_start_date),
  max_end_date = VALUES(max_end_date);

INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
SELECT
  'tour',
  'Kyoto Temple Circuit',
  'Immerse yourself in Japanese culture with guided tours of Kyoto''s most magnificent temples, zen gardens, and geisha districts.',
  'Japan',
  340,
  18,
  0,
  'available',
  1
WHERE NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Kyoto Temple Circuit');

INSERT INTO tours (id, title, description, location, price, duration, image_url)
SELECT
  s.id,
  'Kyoto Temple Circuit',
  'Immerse yourself in Japanese culture with guided tours of Kyoto''s most magnificent temples, zen gardens, and geisha districts.',
  'Japan',
  340,
  '2 days',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop'
FROM services s
WHERE s.service_type = 'tour'
  AND s.service_name = 'Kyoto Temple Circuit'
  AND NOT EXISTS (SELECT 1 FROM tours WHERE title = 'Kyoto Temple Circuit');

INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
SELECT id, '2026-03-20', '2026-09-30'
FROM tours
WHERE title = 'Kyoto Temple Circuit'
ON DUPLICATE KEY UPDATE
  min_start_date = VALUES(min_start_date),
  max_end_date = VALUES(max_end_date);
