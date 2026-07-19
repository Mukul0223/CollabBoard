const cors = require('cors')

function configureCors(app) {
  if (process.env.NODE_ENV !== 'production') {
    app.use(cors({
      origin: process.env.CLIENT_ORIGIN,
      optionsSuccessStatus: 200
    }))
    console.log('CORS enabled for development')
  }
}

module.exports = configureCors