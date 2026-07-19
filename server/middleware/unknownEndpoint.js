const AppError = require('../utils/AppError')

const unknownEndpoint = (req, res, next) => {
  const message = `Unknown Endpoint`
  const error = new AppError(message, 404)
  next(error)
}

module.exports = unknownEndpoint