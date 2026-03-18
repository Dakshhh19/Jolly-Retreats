import express from 'express'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/errorHandler.js'
import { query } from '../config/db.js'
import { isDbConnected } from '../config/runtime.js'
import {
  fallbackBookingsModel,
  fallbackCarRentalsModel,
  fallbackPropertiesModel,
  fallbackRestaurantsModel,
  fallbackToursModel,
  fallbackTreksModel,
  fallbackUsersModel
} from '../models/fallbackModels.js'

const router = express.Router()

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2))

const buildFallbackAnalytics = async () => {
  const [users, bookings, tours, treks, restaurants, cars] = await Promise.all([
    fallbackUsersModel.getAll(),
    fallbackBookingsModel.getAll(),
    fallbackToursModel.getAll(),
    fallbackTreksModel.getAll(),
    fallbackRestaurantsModel.getAll(),
    fallbackCarRentalsModel.getAll()
  ])
  const properties = await fallbackPropertiesModel.getAll()

  const serviceMap = new Map()
  tours.forEach((item) => serviceMap.set(`tour:${item.id}`, { name: item.title, price: Number(item.price || 0) }))
  treks.forEach((item) => serviceMap.set(`trek:${item.id}`, { name: item.title, price: Number(item.price || 0) }))
  restaurants.forEach((item) => serviceMap.set(`restaurant:${item.id}`, { name: item.name, price: 0 }))
  cars.forEach((item) => serviceMap.set(`car:${item.id}`, { name: item.car_name, price: Number(item.price_per_day || 0) }))
  properties.forEach((item) => serviceMap.set(`property:${item.id}`, { name: item.name, price: Number(item.price_per_night || 0) }))

  const dailyOrdersMap = new Map()
  const dailyRevenueMap = new Map()
  const userGrowthMap = new Map()
  const topMap = new Map()

  for (const user of users) {
    const day = String(user.created_at).slice(0, 10)
    userGrowthMap.set(day, (userGrowthMap.get(day) || 0) + 1)
  }

  let totalRevenue = 0
  for (const booking of bookings) {
    const day = String(booking.created_at || booking.booking_date).slice(0, 10)
    dailyOrdersMap.set(day, (dailyOrdersMap.get(day) || 0) + 1)

    const key = `${booking.service_type}:${booking.service_id}`
    const service = serviceMap.get(key) || { name: `${booking.service_type} #${booking.service_id}`, price: 0 }
    const revenue = booking.status === 'cancelled' ? 0 : Number(service.price || 0)
    totalRevenue += revenue
    dailyRevenueMap.set(day, roundCurrency((dailyRevenueMap.get(day) || 0) + revenue))

    const top = topMap.get(key) || {
      serviceType: booking.service_type,
      serviceId: booking.service_id,
      serviceName: service.name,
      orderCount: 0,
      revenue: 0
    }
    top.orderCount += 1
    top.revenue = roundCurrency(top.revenue + revenue)
    topMap.set(key, top)
  }

  const toSeries = (map, key) =>
    [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ day, [key]: value }))

  return {
    summary: {
      totalUsers: users.length,
      totalOrders: bookings.length,
      totalRevenue: roundCurrency(totalRevenue),
      totalServices: tours.length + treks.length + restaurants.length + cars.length + properties.length,
      fullyBookedServices: 0,
      averageOccupancy: 0
    },
    charts: {
      salesOverTime: toSeries(dailyRevenueMap, 'revenue'),
      ordersPerDay: toSeries(dailyOrdersMap, 'orders'),
      userGrowth: toSeries(userGrowthMap, 'users')
    },
    topServices: [...topMap.values()].sort((a, b) => b.orderCount - a.orderCount).slice(0, 5)
  }
}

router.get('/admin', requireAuth, requireAdmin, asyncHandler(async (_req, res) => {
  if (!isDbConnected()) {
    return res.json({ success: true, data: await buildFallbackAnalytics() })
  }

  const [summaryRows] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS totalUsers,
        (SELECT COUNT(*) FROM bookings) AS totalOrders,
        (
          SELECT COALESCE(SUM(
            CASE b.service_type
              WHEN 'tour' THEN IFNULL(t.price, 0)
              WHEN 'trek' THEN IFNULL(tr.price, 0)
              WHEN 'car' THEN IFNULL(c.price_per_day, 0)
              WHEN 'property' THEN IFNULL(p.price_per_night, 0)
              WHEN 'restaurant' THEN 0
              ELSE 0
            END
          ), 0)
          FROM bookings b
          LEFT JOIN tours t ON b.service_type = 'tour' AND b.service_id = t.id
          LEFT JOIN treks tr ON b.service_type = 'trek' AND b.service_id = tr.id
          LEFT JOIN car_rentals c ON b.service_type = 'car' AND b.service_id = c.id
          LEFT JOIN properties p ON b.service_type = 'property' AND b.service_id = p.id
          WHERE b.status <> 'cancelled'
        ) AS totalRevenue,
        (SELECT COUNT(*) FROM services) AS totalServices,
        (SELECT COUNT(*) FROM services WHERE status = 'full') AS fullyBookedServices,
        (
          SELECT IFNULL(ROUND(AVG((current_bookings / NULLIF(max_capacity, 0)) * 100), 2), 0)
          FROM services
          WHERE max_capacity > 0
        ) AS averageOccupancy
    `)
  ])

  const salesOverTime = await query(`
    SELECT
      DATE(b.created_at) AS day,
      COALESCE(SUM(
        CASE b.service_type
          WHEN 'tour' THEN IFNULL(t.price, 0)
          WHEN 'trek' THEN IFNULL(tr.price, 0)
          WHEN 'car' THEN IFNULL(c.price_per_day, 0)
          WHEN 'property' THEN IFNULL(p.price_per_night, 0)
          WHEN 'restaurant' THEN 0
          ELSE 0
        END
      ), 0) AS revenue
    FROM bookings b
    LEFT JOIN tours t ON b.service_type = 'tour' AND b.service_id = t.id
    LEFT JOIN treks tr ON b.service_type = 'trek' AND b.service_id = tr.id
    LEFT JOIN car_rentals c ON b.service_type = 'car' AND b.service_id = c.id
    LEFT JOIN properties p ON b.service_type = 'property' AND b.service_id = p.id
    WHERE b.status <> 'cancelled'
    GROUP BY DATE(b.created_at)
    ORDER BY day ASC
  `)

  const ordersPerDay = await query(`
    SELECT DATE(created_at) AS day, COUNT(*) AS orders
    FROM bookings
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `)

  const userGrowth = await query(`
    SELECT DATE(created_at) AS day, COUNT(*) AS users
    FROM users
    GROUP BY DATE(created_at)
    ORDER BY day ASC
  `)

  const topServices = await query(`
    SELECT
      b.service_type AS serviceType,
      b.service_id AS serviceId,
      COALESCE(t.title, tr.title, r.name, c.car_name, p.name, CONCAT(b.service_type, ' #', b.service_id)) AS serviceName,
      COUNT(*) AS orderCount,
      COALESCE(SUM(
        CASE b.service_type
          WHEN 'tour' THEN IFNULL(t.price, 0)
          WHEN 'trek' THEN IFNULL(tr.price, 0)
          WHEN 'car' THEN IFNULL(c.price_per_day, 0)
          WHEN 'property' THEN IFNULL(p.price_per_night, 0)
          WHEN 'restaurant' THEN 0
          ELSE 0
        END
      ), 0) AS revenue
    FROM bookings b
    LEFT JOIN tours t ON b.service_type = 'tour' AND b.service_id = t.id
    LEFT JOIN treks tr ON b.service_type = 'trek' AND b.service_id = tr.id
    LEFT JOIN restaurants r ON b.service_type = 'restaurant' AND b.service_id = r.id
    LEFT JOIN car_rentals c ON b.service_type = 'car' AND b.service_id = c.id
    LEFT JOIN properties p ON b.service_type = 'property' AND b.service_id = p.id
    GROUP BY b.service_type, b.service_id
    ORDER BY orderCount DESC
    LIMIT 5
  `)

  return res.json({
    success: true,
    data: {
      summary: summaryRows[0],
      charts: {
        salesOverTime,
        ordersPerDay,
        userGrowth
      },
      topServices
    }
  })
}))

export default router
