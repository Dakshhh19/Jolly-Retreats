const isAllowedOrigin = (origin = '') => /^(https?:\/\/)(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(origin)

export const requireTrustedOrigin = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next()
  }

  const origin = req.headers.origin
  if (!origin) {
    return next()
  }

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Request origin is not allowed'
    })
  }

  return next()
}
