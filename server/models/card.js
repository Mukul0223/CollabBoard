const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    maxlength: [200, 'Card title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
    default: '',
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: [true, 'Parent list ID is required'],
    index: true,
  },
  board: {
    type: mongose.Schema.Types.ObjectId,
    ref: 'Board',
    required: [true, 'Parent board ID is required'],
    index: true,
  },
  position: {
    type: Number,
    required: [true, 'Position is required for card ordering'],
    default: 0,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  labels: [
    {
      type: String,
      trim: true,
    },
  ],
}, { timestamps: cardSchema})

cardSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    return returnedObject
  }
})

const Card = mongoose.model('Card', cardSchema)
module.exports = Card