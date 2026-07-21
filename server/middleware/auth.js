const { verifyToken } = require('../utils/token')
const User = require('../models/user')
const AppError = require('../utils/AppError')

const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access denied.', 401))
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyToken(token)
    req.user = await User.findById(decoded.id)

    if (!req.user) {
      return next(new AppError('User account no longer exists.', 401))
    }
    next()
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401))
  }
}

module.exports = authenticateUser