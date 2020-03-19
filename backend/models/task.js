const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  isSolved: {
    type: Boolean,
    required: true
  },
  isBeingSolved: {
    type: Boolean,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor'
  },
  registeredStudent: {
    type: Schema.Types.ObjectId,
    ref: 'Student'
  }
});

module.exports = mongoose.model('Task', taskSchema);