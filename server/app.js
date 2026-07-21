const express = require('express')

const configureCors = require('./config/cors')
const logger = require('./middleware/logger')
const unknownEndpoint = require('./middleware/unknownEndpoint')
const errorHandler = require('./middleware/errorHandler')

const healthRouter = require('./routes/health')
const authRouter = require('./routes/authRoutes')

const app = express()

// Global Middlewares
configureCors(app)
app.use(logger)
app.use(express.json())

// Base Routes
app.get('/', (req, res) => {
  res.send('Server is up and running!')
})

app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)

// Error Handling
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app