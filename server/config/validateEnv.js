function validateEnv() {
  const requiredEnv = ['MONGODB_URI', 'JWT_SECRET']
  const missingEnv = []

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      missingEnv.push(key)
    }
  })

  if (missingEnv.length > 0) {
    console.log('CRITICAL ERROR: Missing required enviroment variables: ')
    missingEnv.forEach((env) => console.error(` - ${env}`))
    console.log('\nPlease check your server/.env file!\n')

    process.exit(1)
  }
}

module.exports = validateEnv