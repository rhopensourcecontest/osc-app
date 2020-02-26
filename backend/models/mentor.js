const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mentorSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    createdTasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
});

module.exports = mongoose.model('Mentor', mentorSchema);
