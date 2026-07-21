const bcrypt = require('bcryptjs')
const User = require('../models/user')
const { generateToken } = require('../utils/token')
const AppError = require('../utils/AppError')

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return next(new AppError('Name, email, and password are required.', 400))
    }

    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 charaters long.', 400))
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new AppError('Email is already registered.', 400))
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({ name, email, passwordHash })
    const savedUser = await user.save()

    const token = generateToken(savedUser._id)

    res.status(201).json({ token, user: savedUser })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return next(new AppError('Email and password are required.', 400))
    }

    const user = await User.findOne({ email })
    const isPasswordCorrect = user === null ? false : await user.comparePassword(password)

    if (!(user && isPasswordCorrect)) {
      return next(new AppError('Invalid email or password.', 401))
    }

    const token = generateToken(user._id)

    res.status(200).json({
      token, user, 
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/auth/me (Protected)
const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user)
}

module.exports = {
  register, login, getCurrentUser
}