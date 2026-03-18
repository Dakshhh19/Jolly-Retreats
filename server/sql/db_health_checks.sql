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

-- ============================================================
-- REGISTERED USERS DETAILS HEALTH CHECKS
-- ============================================================

-- 6) Total registered users breakdown
SELECT 
  COUNT(*) AS total_users,
  SUM(CASE WHEN is_blocked = 0 THEN 1 ELSE 0 END) AS active_users,
  SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) AS blocked_users
FROM users;

-- 7) Users by role distribution
SELECT role, COUNT(*) AS user_count, 
  ROUND((COUNT(*) / (SELECT COUNT(*) FROM users)) * 100, 2) AS percentage
FROM users
GROUP BY role
ORDER BY user_count DESC;

-- 8) Active vs Blocked users status
SELECT 
  CASE WHEN is_blocked = 0 THEN 'Active' ELSE 'Blocked' END AS status,
  COUNT(*) AS total,
  ROUND((COUNT(*) / (SELECT COUNT(*) FROM users)) * 100, 2) AS percentage
FROM users
GROUP BY is_blocked;

-- 9) All registered users - complete details
SELECT 
  id,
  full_name,
  email,
  contact_number,
  role,
  is_blocked,
  created_at
FROM users
ORDER BY created_at DESC;

-- 10) Users registration trend (by month)
SELECT 
  DATE_TRUNC(created_at, MONTH) AS registration_month,
  COUNT(*) AS new_registrations
FROM users
GROUP BY registration_month
ORDER BY registration_month DESC;

-- 11) Users with duplicate contact numbers (data integrity check)
SELECT contact_number, COUNT(*) AS occurrences, GROUP_CONCAT(id) AS user_ids
FROM users
GROUP BY contact_number
HAVING COUNT(*) > 1;

-- 12) Users with duplicate emails (should not exist)
SELECT email, COUNT(*) AS occurrences, GROUP_CONCAT(id) AS user_ids
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- 13) Admin vs Regular users breakdown
SELECT 
  role,
  COUNT(*) AS count,
  SUM(CASE WHEN is_blocked = 0 THEN 1 ELSE 0 END) AS active,
  SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) AS blocked
FROM users
GROUP BY role;

-- 14) User account activity - bookings per user
SELECT 
  u.id,
  u.full_name,
  u.email,
  COUNT(b.id) AS total_bookings,
  SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
  SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending_bookings,
  SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
  MAX(b.created_at) AS last_booking_date
FROM users u
LEFT JOIN bookings b ON u.id = b.user_id
GROUP BY u.id
ORDER BY total_bookings DESC;

-- 15) User profile completeness check
SELECT 
  COUNT(CASE WHEN full_name IS NOT NULL AND full_name != '' THEN 1 END) AS users_with_name,
  COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) AS users_with_email,
  COUNT(CASE WHEN contact_number IS NOT NULL AND contact_number != '' THEN 1 END) AS users_with_contact,
  COUNT(*) AS total_users
FROM users;

-- ============================================================
-- PASSWORD SECURITY & VALIDATION CHECKS
-- ============================================================

-- 16) Password hash validation - users with valid hashes
SELECT 
  COUNT(CASE WHEN password_hash IS NOT NULL AND password_hash != '' AND LENGTH(password_hash) > 0 THEN 1 END) AS users_with_valid_hash,
  COUNT(CASE WHEN password_hash IS NULL OR password_hash = '' THEN 1 END) AS users_without_password,
  COUNT(*) AS total_users
FROM users;

-- 17) Users missing password hashes (security issue)
SELECT 
  id,
  full_name,
  email,
  password_hash,
  role,
  created_at
FROM users
WHERE password_hash IS NULL OR password_hash = ''
ORDER BY created_at DESC;

-- 18) Password hash length distribution
SELECT 
  LENGTH(password_hash) AS hash_length,
  COUNT(*) AS user_count
FROM users
WHERE password_hash IS NOT NULL AND password_hash != ''
GROUP BY hash_length
ORDER BY hash_length;

-- 19) Users by password hash type (bcrypt, SHA, MD5, etc.)
SELECT 
  CASE 
    WHEN password_hash LIKE '$2%' THEN 'bcrypt'
    WHEN password_hash LIKE '$1%' THEN 'SHA-512/crypt'
    WHEN password_hash LIKE '$5%' THEN 'SHA-256/crypt'
    WHEN password_hash LIKE '$6%' THEN 'SHA-512/crypt'
    WHEN LENGTH(password_hash) = 32 THEN 'MD5 (WEAK)'
    WHEN LENGTH(password_hash) = 40 THEN 'SHA-1 (WEAK)'
    WHEN LENGTH(password_hash) = 64 THEN 'SHA-256'
    ELSE 'Unknown/Other'
  END AS hash_type,
  COUNT(*) AS user_count
FROM users
WHERE password_hash IS NOT NULL AND password_hash != ''
GROUP BY hash_type
ORDER BY user_count DESC;

-- 20) Advanced password security audit
SELECT 
  id,
  full_name,
  email,
  LENGTH(password_hash) AS hash_length,
  CASE 
    WHEN password_hash IS NULL OR password_hash = '' THEN 'NO_PASSWORD'
    WHEN LENGTH(password_hash) = 32 THEN 'WEAK_MD5'
    WHEN LENGTH(password_hash) = 40 THEN 'WEAK_SHA1'
    WHEN password_hash LIKE '$2%' THEN 'SECURE_BCRYPT'
    WHEN password_hash LIKE '$%' THEN 'SECURE_CRYPT'
    ELSE 'UNKNOWN'
  END AS password_status,
  role,
  is_blocked,
  created_at
FROM users
ORDER BY is_blocked, CASE 
  WHEN password_hash IS NULL OR password_hash = '' THEN 1
  WHEN LENGTH(password_hash) = 32 THEN 2
  WHEN LENGTH(password_hash) = 40 THEN 2
  ELSE 0
END DESC;

-- 21) All user passwords (hashed) - complete view
SELECT 
  id,
  full_name,
  email,
  contact_number,
  password_hash,
  role,
  is_blocked,
  created_at
FROM users
ORDER BY id ASC;

-- 22) User password details (truncated hash for security viewing)
SELECT 
  id,
  full_name,
  email,
  CONCAT(SUBSTRING(password_hash, 1, 10), '...', SUBSTRING(password_hash, -10)) AS password_hash_preview,
  LENGTH(password_hash) AS hash_length,
  CASE 
    WHEN password_hash LIKE '$2%' THEN 'bcrypt (Secure)'
    WHEN password_hash LIKE '$%' THEN 'Crypt variant (Secure)'
    WHEN LENGTH(password_hash) = 32 THEN 'MD5 (WEAK - Should upgrade)'
    WHEN LENGTH(password_hash) = 40 THEN 'SHA-1 (WEAK - Should upgrade)'
    WHEN LENGTH(password_hash) = 64 THEN 'SHA-256 (Moderate)'
    ELSE 'Unknown Format'
  END AS hash_algorithm,
  role,
  is_blocked,
  created_at
FROM users
ORDER BY id ASC;

