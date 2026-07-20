const mongoose = require('mongoose')

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'List title is required'],
    trim: true,
    maxlength: [100, 'List title cannot exceed 100 characters'],
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Parent board ID is required'],
    index: true,
  },
  position: {
    type: Number,
    required: [true, 'Position is required for list ordering'],
    default: 0
  },
}, { timestamps: true })

listSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    return returnedObject
  }
})

const List = mongoose.model('List', listSchema)
module.exports = List