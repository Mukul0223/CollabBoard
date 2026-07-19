const express = require('express')

require('dotenv').config() // Loads enviroment variables

// Immediately validates if requires enviroment valriables are present or not
/*
 TO DO: Right now missing MONGODN_URI and JWT_SECRET
*/
// const validateEnv = require('./config/validateEnv')
// validateEnv()

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is up and running!')
})

PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})