const stores = new Map()

const getStore = (name) => {
  if (!stores.has(name)) {
    stores.set(name, new Map())
  }
  return stores.get(name)
}

export const createRateLimiter = ({
  key = 'global',
  windowMs = 15 * 60 * 1000,
  max = 5,
  message = 'Too many requests. Please try again later.'
}) => {
  return (req, res, next) => {
    const store = getStore(key)
    const now = Date.now()
    const identifier = `${req.ip}:${req.path}`
    const entry = store.get(identifier)

    if (!entry || entry.expiresAt <= now) {
      store.set(identifier, { count: 1, expiresAt: now + windowMs })
      return next()
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.expiresAt - now) / 1000)
      res.setHeader('Retry-After', String(Math.max(retryAfter, 1)))
      return res.status(429).json({
        success: false,
        message
      })
    }

    entry.count += 1
    store.set(identifier, entry)
    return next()
  }
}
