// Load environment variables into process.env
require('dotenv').config()

// Immediately validates the enviroment valriables
const validateEnv = require('./config/validateEnv')
validateEnv()

// Load config and app setup after validation succeeds
const env = require('./config/env')
const app = require('./app')
const connectDB = require('./config/db')

const startServer = async () => {
  await connectDB()

  app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`)
  })
}

startServer()