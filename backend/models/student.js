const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    registeredTask: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }
});

module.exports = mongoose.model('Student', studentSchema);
