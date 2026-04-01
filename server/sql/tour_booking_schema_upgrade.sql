USE retreat_platform_db;

CREATE TABLE IF NOT EXISTS tour_availability (
  tour_id INT UNSIGNED PRIMARY KEY,
  min_start_date DATE NOT NULL,
  max_end_date DATE NOT NULL,
  CONSTRAINT fk_tour_availability_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tour_bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  booking_reference VARCHAR(40) NOT NULL UNIQUE,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_people INT UNSIGNED NOT NULL,
  price_per_person DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'confirmed',
  primary_contact_name VARCHAR(120) NOT NULL,
  primary_contact_phone VARCHAR(25) NOT NULL,
  tour_name_snapshot VARCHAR(150) NOT NULL,
  tour_description_snapshot TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tour_bookings_user (user_id),
  INDEX idx_tour_bookings_tour (tour_id),
  INDEX idx_tour_bookings_dates (start_date, end_date),
  CONSTRAINT fk_tour_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tour_bookings_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_travelers (
  traveler_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  name VARCHAR(120) NOT NULL,
  age TINYINT UNSIGNED NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  contact_number VARCHAR(25) NOT NULL,
  INDEX idx_booking_travelers_booking (booking_id),
  CONSTRAINT fk_booking_travelers_booking
    FOREIGN KEY (booking_id) REFERENCES tour_bookings(booking_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
