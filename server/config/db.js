import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

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

    if (!(await hasColumn('users', 'is_blocked'))) {
      await connection.execute(`ALTER TABLE users ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0`)
    }
    if (!(await hasIndex('users', 'uq_users_contact_number'))) {
      await connection.execute(`ALTER TABLE users ADD CONSTRAINT uq_users_contact_number UNIQUE (contact_number)`)
    }

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
  } finally {
    connection.release()
  }
}

export default pool
