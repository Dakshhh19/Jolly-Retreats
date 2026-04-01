import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'retreat_platform_db'
}

const safeConfig = {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database
}

const run = async () => {
  let connection
  try {
    connection = await mysql.createConnection(config)
    await connection.ping()
    console.log(`DB check passed: ${JSON.stringify(safeConfig)}`)
    process.exit(0)
  } catch (error) {
    console.error(`DB check failed: ${error.message}`)
    console.error(`Used config: ${JSON.stringify(safeConfig)}`)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

void run()
