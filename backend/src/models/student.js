const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Student schema with reference to registeredTask
 */
const studentSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  registeredTask: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }
});

module.exports = mongoose.model('Student', studentSchema);
