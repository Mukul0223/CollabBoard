const mongoose = require('mongoose')

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [50, 'Board title cannot exceed 50 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Board owner is required'],
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  ],
}, { timestamps: true })

boardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    return returnedObject
  }
})

const Board = mongoose.model('Board', boardSchema)
module.exports = Board