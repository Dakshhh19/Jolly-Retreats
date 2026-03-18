export const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409
    message = 'Duplicate record detected'
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400
    message = 'Related record does not exist'
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err })
  })
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}
