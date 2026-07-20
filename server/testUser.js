require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('./config/db')
const User = require('./models/user')

const testUserSchema = async () => {
  try {
    await connectDB()

    console.log('\n--- STARTING SCHEMA TEST ---\n')

    const dummyData = {
      name: 'Alex',
      email: 'alex@example.com',
      passwordHash: 'temporary_secret_123',
    }

    const newUser = await User.create(dummyData)
    console.log('1. User saved to MongoDB')

    const userJson = newUser.toJSON()
    console.log('2. Serialized User JSON', userJson)

    console.log('\n--- VERIFICATION CHECKS ---')
    console.log('Has `id` string?:', typeof userJson.id === 'string' ? 'PASSED' : 'FAILED')
    console.log('Has `_id` removed?:', userJson._id === undefined ? 'PASSED' : 'FAILED')
    console.log('Has `passwordHash` removed?:', userJson.passwordHash === undefined ? 'PASSED' : 'FAILED')
    console.log('Has `createdAt` timestamp?:', userJson.createdAt ? 'PASSED' : 'FAILED')

    await User.findByIdAndDelete(newUser.id)
    console.log('\n3. Test user cleaned up from database successfully!')
    
  } catch (error) {
    console.error('\nSCHEMA TEST FAILED:', error.message)
  } finally {
      // 5. Close database connection so script exits smoothly
      await mongoose.connection.close()
      console.log('\nDatabase connection closed.')
  }
}

testUserSchema()