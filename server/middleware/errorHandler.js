const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message

  if (err.isOperational) {
    console.warn(`[Operational Warning]: ${statusCode} - ${message}`)
  } else {
    console.error('[UNEXPECTED SERVER ERROR]:', err)
    
    statusCode = 500
    message = 'Something went wrong on our end. Please try again later.'
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: message
  })
}

module.exports = errorHandler