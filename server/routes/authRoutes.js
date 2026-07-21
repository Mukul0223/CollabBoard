const authRouter = require('express').Router()
const { register, login, getCurrentUser } = require('../controllers/authController')
const authenticateUser = require('../middleware/auth')

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.get('/me', authenticateUser, getCurrentUser)

module.exports = authRouter