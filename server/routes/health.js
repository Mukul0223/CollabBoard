const healthRouter = require('express').Router()

healthRouter.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server running well and good.',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

module.exports = healthRouter