const express = require('express')
require('dotenv').config()

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Server is up and running!')
})

PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})