-- Jolly Retreats DB health checks
-- Run this file in MySQL Workbench whenever you want to validate stored data.

USE retreat_platform_db;

-- 1) Quick row counts for all core tables
SELECT 'users' AS table_name, COUNT(*) AS total_rows FROM users
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'tours', COUNT(*) FROM tours
UNION ALL
SELECT 'treks', COUNT(*) FROM treks
UNION ALL
SELECT 'restaurants', COUNT(*) FROM restaurants
UNION ALL
SELECT 'car_rentals', COUNT(*) FROM car_rentals
UNION ALL
SELECT 'properties', COUNT(*) FROM properties
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings;

-- 2) Latest users
SELECT id, full_name, email, role, is_blocked, created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- 3) Latest bookings with user info
SELECT
  b.id,
  b.user_id,
  u.full_name AS user_name,
  b.service_type,
  b.service_id,
  b.booking_date,
  b.status,
  b.created_at
FROM bookings b
LEFT JOIN users u ON u.id = b.user_id
ORDER BY b.created_at DESC
LIMIT 20;

-- 4) Latest records per service table
SELECT id, title, location, price, duration, created_at
FROM tours
ORDER BY id DESC
LIMIT 10;

SELECT id, title, difficulty_level, location, duration, price
FROM treks
ORDER BY id DESC
LIMIT 10;

SELECT id, name, cuisine_type, location, price_range, rating
FROM restaurants
ORDER BY id DESC
LIMIT 10;

SELECT id, car_name, company, location, price_per_day, seats, fuel_type
FROM car_rentals
ORDER BY id DESC
LIMIT 10;

SELECT id, name, location, price_per_night, capacity, bedrooms, bathrooms
FROM properties
ORDER BY id DESC
LIMIT 10;

-- 5) Booking status summary
SELECT status, COUNT(*) AS total
FROM bookings
GROUP BY status
ORDER BY total DESC;

