const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [12, 'Name cannot exceed 12 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
            'Please provide a valid email address',
          ],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
  },
}, { timestamps: true })

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash

    return returnedObject
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User