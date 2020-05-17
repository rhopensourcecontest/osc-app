const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Run schema
 */
const runSchema = new Schema(
  {
    title: {
      type: String,
      require: true
    },
    deadline: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Run', runSchema);
