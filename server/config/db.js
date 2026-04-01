import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { defaultTourSeeds } from '../data/tourSeeds.js'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'retreat_platform_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  namedPlaceholders: false
})

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export const withTransaction = async (callback) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

const reconcileServiceCapacity = async (connection) => {
  await connection.execute(`
    UPDATE services s
    LEFT JOIN (
      SELECT
        'tour' AS service_type,
        tb.tour_id AS service_id,
        COALESCE(SUM(CASE WHEN tb.booking_status <> 'cancelled' THEN tb.total_people ELSE 0 END), 0) AS active_bookings
      FROM tour_bookings tb
      GROUP BY tb.tour_id

      UNION ALL

      SELECT
        b.service_type,
        b.service_id,
        COALESCE(SUM(CASE WHEN b.status <> 'cancelled' THEN b.booking_count ELSE 0 END), 0) AS active_bookings
      FROM bookings b
      GROUP BY b.service_type, b.service_id
    ) usage_counts
      ON usage_counts.service_type = s.service_type
     AND usage_counts.service_id = s.id
    SET
      s.current_bookings = COALESCE(usage_counts.active_bookings, 0),
      s.status = CASE
        WHEN s.is_enabled = 0 OR s.status = 'closed' THEN 'closed'
        WHEN COALESCE(usage_counts.active_bookings, 0) >= s.max_capacity THEN 'full'
        WHEN s.max_capacity - COALESCE(usage_counts.active_bookings, 0) <= 5 THEN 'limited'
        ELSE 'available'
      END
  `)
}

export const testConnection = async () => {
  const connection = await pool.getConnection()
  try {
    await connection.ping()
    const hasColumn = async (tableName, columnName) => {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?`,
        [tableName, columnName]
      )
      return Number(rows[0]?.count || 0) > 0
    }

    const hasIndex = async (tableName, indexName) => {
      const [rows] = await connection.execute(
        `SELECT COUNT(*) AS count
         FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND INDEX_NAME = ?`,
        [tableName, indexName]
      )
      return Number(rows[0]?.count || 0) > 0
    }

    const getColumnDefinition = async (tableName, columnName) => {
      const [rows] = await connection.execute(
        `SELECT COLUMN_TYPE AS columnType,
                IS_NULLABLE AS isNullable,
                CHARACTER_SET_NAME AS characterSet,
                COLLATION_NAME AS collationName
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
         LIMIT 1`,
        [tableName, columnName]
      )
      return rows[0] || null
    }

    const getForeignKeyName = async (tableName, columnName) => {
      const [rows] = await connection.execute(
        `SELECT CONSTRAINT_NAME AS constraintName
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND COLUMN_NAME = ?
           AND REFERENCED_TABLE_NAME IS NOT NULL
         LIMIT 1`,
        [tableName, columnName]
      )
      return rows[0]?.constraintName || null
    }

    if (!(await hasColumn('users', 'is_blocked'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0`)
    }
    if (!(await hasColumn('users', 'username'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN username VARCHAR(30) NULL AFTER email`)
    }
    if (!(await hasColumn('users', 'security_question'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN security_question VARCHAR(150) NULL AFTER contact_number`)
    }
    if (!(await hasColumn('users', 'security_answer_hash'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN security_answer_hash VARCHAR(255) NULL AFTER security_question`)
    }
    if (!(await hasColumn('users', 'updated_at'))) {
      await connection.execute(
        `ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
      )
    }

    await connection.execute(`
      UPDATE users
      SET username = CASE
        WHEN username IS NULL OR username = '' THEN CONCAT('user_', id)
        ELSE username
      END
    `)

    if (!(await hasIndex('users', 'uq_users_contact_number'))) {
      await connection.execute(`ALTER TABLE users ADD CONSTRAINT uq_users_contact_number UNIQUE (contact_number)`)
    }
    if (!(await hasIndex('users', 'uq_users_username'))) {
      await connection.execute(`ALTER TABLE users ADD CONSTRAINT uq_users_username UNIQUE (username)`)
    }
    await connection.execute(`ALTER TABLE users MODIFY COLUMN username VARCHAR(30) NOT NULL`)

    await connection.execute(
      `ALTER TABLE services MODIFY COLUMN service_type ENUM('tour','trek','restaurant','car','property','stay','experience') NOT NULL`
    )
    await connection.execute(
      `ALTER TABLE bookings MODIFY COLUMN service_type ENUM('tour','trek','restaurant','car','property','stay','experience') NOT NULL`
    )

    if (!(await hasColumn('services', 'service_name'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN service_name VARCHAR(150) NULL`)
    }
    if (!(await hasColumn('services', 'description'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN description TEXT NULL`)
    }
    if (!(await hasColumn('services', 'location'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN location VARCHAR(150) NULL`)
    }
    if (!(await hasColumn('services', 'price'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN price DECIMAL(10,2) NULL`)
    }
    if (!(await hasColumn('services', 'max_capacity'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN max_capacity INT UNSIGNED NOT NULL DEFAULT 50`)
    }
    if (!(await hasColumn('services', 'current_bookings'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN current_bookings INT UNSIGNED NOT NULL DEFAULT 0`)
    }
    if (!(await hasColumn('services', 'status'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN status ENUM('available','limited','full','closed') NOT NULL DEFAULT 'available'`)
    }
    if (!(await hasColumn('services', 'is_enabled'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN is_enabled TINYINT(1) NOT NULL DEFAULT 1`)
    }
    if (!(await hasColumn('services', 'updated_at'))) {
      await connection.execute(`ALTER TABLE services ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    }

    if (!(await hasColumn('bookings', 'booking_count'))) {
      await connection.execute(`ALTER TABLE bookings ADD COLUMN booking_count INT UNSIGNED NOT NULL DEFAULT 1`)
    }

    if (!(await hasIndex('services', 'idx_services_status'))) {
      await connection.execute(`CREATE INDEX idx_services_status ON services(status)`)
    }
    if (!(await hasIndex('services', 'idx_services_capacity'))) {
      await connection.execute(`CREATE INDEX idx_services_capacity ON services(max_capacity, current_bookings)`)
    }
    if (!(await hasIndex('bookings', 'idx_bookings_service_date'))) {
      await connection.execute(`CREATE INDEX idx_bookings_service_date ON bookings(service_id, booking_date)`)
    }
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tour_availability (
        tour_id INT UNSIGNED PRIMARY KEY,
        min_start_date DATE NOT NULL,
        max_end_date DATE NOT NULL,
        CONSTRAINT fk_tour_availability_tour
          FOREIGN KEY (tour_id) REFERENCES tours(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `)
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    const normalizeBookingIdColumn = async (tableName) => {
      const columnDefinition = await getColumnDefinition(tableName, 'booking_id')
      if (!columnDefinition) {
        return
      }

      const columnType = String(columnDefinition.columnType || '').toLowerCase()
      const isNullable = String(columnDefinition.isNullable || '').toUpperCase() === 'YES'
      const characterSet = String(columnDefinition.characterSet || '').toLowerCase()
      const collationName = String(columnDefinition.collationName || '').toLowerCase()
      const requiresUpdate =
        columnType !== 'varchar(32)' ||
        isNullable ||
        characterSet !== 'utf8mb4' ||
        collationName !== 'utf8mb4_unicode_ci'

      if (requiresUpdate) {
        await connection.execute(
          `ALTER TABLE ${tableName}
           MODIFY COLUMN booking_id VARCHAR(32)
           CHARACTER SET utf8mb4
           COLLATE utf8mb4_unicode_ci
           NOT NULL`
        )
      }
    }

    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    if (!(await hasColumn('tour_bookings', 'price_per_person'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN price_per_person DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total_people`)
    }
    if (!(await hasColumn('tour_bookings', 'booking_reference'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN booking_reference VARCHAR(40) NULL AFTER booking_id`)
    }
    await connection.execute(`
      UPDATE tour_bookings
      SET booking_reference = booking_id
      WHERE booking_reference IS NULL OR booking_reference = ''
    `)
    const hasBookingReferenceUniqueIndex =
      (await hasIndex('tour_bookings', 'booking_reference')) ||
      (await hasIndex('tour_bookings', 'uq_tour_bookings_booking_reference'))
    if (!hasBookingReferenceUniqueIndex) {
      await connection.execute(`ALTER TABLE tour_bookings ADD CONSTRAINT uq_tour_bookings_booking_reference UNIQUE (booking_reference)`)
    }
    await connection.execute(`ALTER TABLE tour_bookings MODIFY COLUMN booking_reference VARCHAR(40) NOT NULL`)
    if (!(await hasColumn('tour_bookings', 'tax_amount'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER price_per_person`)
    }
    if (!(await hasColumn('tour_bookings', 'booking_status'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN booking_status ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'confirmed' AFTER total_amount`)
    }
    if (!(await hasColumn('tour_bookings', 'primary_contact_name'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN primary_contact_name VARCHAR(120) NOT NULL DEFAULT 'Primary Traveler' AFTER booking_status`)
    }
    if (!(await hasColumn('tour_bookings', 'primary_contact_phone'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN primary_contact_phone VARCHAR(25) NOT NULL DEFAULT '' AFTER primary_contact_name`)
    }
    if (!(await hasColumn('tour_bookings', 'tour_name_snapshot'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN tour_name_snapshot VARCHAR(150) NOT NULL DEFAULT 'Tour Booking' AFTER primary_contact_phone`)
    }
    if (!(await hasColumn('tour_bookings', 'tour_description_snapshot'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN tour_description_snapshot TEXT NULL AFTER tour_name_snapshot`)
    }
    if (!(await hasColumn('tour_bookings', 'updated_at'))) {
      await connection.execute(`ALTER TABLE tour_bookings ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at`)
    }
    if (!(await hasIndex('tour_bookings', 'idx_tour_bookings_user'))) {
      await connection.execute(`CREATE INDEX idx_tour_bookings_user ON tour_bookings(user_id)`)
    }
    if (!(await hasIndex('tour_bookings', 'idx_tour_bookings_tour'))) {
      await connection.execute(`CREATE INDEX idx_tour_bookings_tour ON tour_bookings(tour_id)`)
    }
    if (!(await hasIndex('tour_bookings', 'idx_tour_bookings_dates'))) {
      await connection.execute(`CREATE INDEX idx_tour_bookings_dates ON tour_bookings(start_date, end_date)`)
    }
    if (!(await hasColumn('booking_travelers', 'contact_number'))) {
      await connection.execute(`ALTER TABLE booking_travelers ADD COLUMN contact_number VARCHAR(25) NOT NULL DEFAULT '' AFTER gender`)
    }
    const travelerBookingForeignKey = await getForeignKeyName('booking_travelers', 'booking_id')
    if (travelerBookingForeignKey) {
      await connection.execute(`ALTER TABLE booking_travelers DROP FOREIGN KEY ${travelerBookingForeignKey}`)
    }
    await normalizeBookingIdColumn('tour_bookings')
    await normalizeBookingIdColumn('booking_travelers')
    if (!(await getForeignKeyName('booking_travelers', 'booking_id'))) {
      await connection.execute(`
        ALTER TABLE booking_travelers
        ADD CONSTRAINT fk_booking_travelers_booking
        FOREIGN KEY (booking_id) REFERENCES tour_bookings(booking_id)
        ON DELETE CASCADE ON UPDATE CASCADE
      `)
    }
    if (!(await hasIndex('booking_travelers', 'idx_booking_travelers_booking'))) {
      await connection.execute(`CREATE INDEX idx_booking_travelers_booking ON booking_travelers(booking_id)`)
    }
    await connection.execute(`
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
      ) ENGINE=InnoDB
    `)

    const propertySeeds = [
      [1, 'Emerald Cliff Villa', 'Bali, Indonesia', 450, 8, 4, 3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', 'Perched cliffside villa with panoramic views'],
      [2, 'Serene Mountain Cottage', 'Swiss Alps, Switzerland', 320, 4, 2, 2, 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop', 'Charming alpine cottage retreat'],
      [3, 'Coastal Haven Villa', 'Amalfi Coast, Italy', 680, 10, 5, 4, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', 'Mediterranean villa with sea views'],
      [4, 'Forest Hideaway Cottage', 'Cotswolds, England', 195, 3, 1, 1, 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop', 'Private countryside hideaway'],
      [5, 'Sunset Bay Villa', 'Santorini, Greece', 520, 6, 3, 3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 'Sunset-facing Greek island villa'],
      [6, 'Lakeside Timber Lodge', 'Lake Como, Italy', 380, 5, 2, 2, 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&h=600&fit=crop', 'Lakeside lodge with mountain backdrop']
    ]

    for (const seed of propertySeeds) {
      const [id, name, location, price, capacity, bedrooms, bathrooms, imageUrl, description] = seed
      await connection.execute(
        `INSERT INTO services (id, service_type)
         VALUES (?, 'property')
         ON DUPLICATE KEY UPDATE service_type = VALUES(service_type)`,
        [id]
      )
      await connection.execute(
        `INSERT INTO properties (id, name, location, price_per_night, capacity, bedrooms, bathrooms, image_url, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          location = VALUES(location),
          price_per_night = VALUES(price_per_night),
          capacity = VALUES(capacity),
          bedrooms = VALUES(bedrooms),
          bathrooms = VALUES(bathrooms),
          image_url = VALUES(image_url),
          description = VALUES(description)`,
        [id, name, location, price, capacity, bedrooms, bathrooms, imageUrl, description]
      )
    }

    for (const tour of defaultTourSeeds) {
      const [existingTourRows] = await connection.execute(
        `SELECT id FROM tours WHERE title = ? LIMIT 1`,
        [tour.title]
      )

      let serviceId = existingTourRows[0]?.id
      if (!serviceId) {
        const [serviceResult] = await connection.execute(
          `INSERT INTO services (service_type, service_name, description, location, price, max_capacity, current_bookings, status, is_enabled)
           VALUES ('tour', ?, ?, ?, ?, ?, 0, 'available', 1)`,
          [tour.title, tour.description, tour.location, Number(tour.price), Number(tour.max_capacity)]
        )
        serviceId = serviceResult.insertId
        await connection.execute(
          `INSERT INTO tours (id, title, description, location, price, duration, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [serviceId, tour.title, tour.description, tour.location, Number(tour.price), tour.duration, tour.image_url]
        )
      } else {
        await connection.execute(
          `UPDATE services
           SET service_name = ?, description = ?, location = ?, price = ?, max_capacity = ?
           WHERE id = ? AND service_type = 'tour'`,
          [tour.title, tour.description, tour.location, Number(tour.price), Number(tour.max_capacity), serviceId]
        )
        await connection.execute(
          `UPDATE tours
           SET description = ?, location = ?, price = ?, duration = ?, image_url = ?
           WHERE id = ?`,
          [tour.description, tour.location, Number(tour.price), tour.duration, tour.image_url, serviceId]
        )
      }

      await connection.execute(
        `INSERT INTO tour_availability (tour_id, min_start_date, max_end_date)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
           min_start_date = VALUES(min_start_date),
           max_end_date = VALUES(max_end_date)`,
        [serviceId, tour.min_start_date, tour.max_end_date]
      )
    }

    await reconcileServiceCapacity(connection)
  } finally {
    connection.release()
  }
}

export default pool
