const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mentor schema with reference to createdTasks
 */
const mentorSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean
  },
  isAdmin: {
    type: Boolean
  },
  createdTasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});

module.exports = mongoose.model('Mentor', mentorSchema);
