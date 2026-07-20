const mongoose = require('mongoose')
const env = require('./env')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI)
    console.log(`[Database]: MongoDB connected successfully to host ${conn.connection.host}`)
  } catch {
    console.error(`[Database Error]: Failed to connect to MongoDB - ${error.message}`)
        process.exit(1);
  }
} 

module.exports = connectDB