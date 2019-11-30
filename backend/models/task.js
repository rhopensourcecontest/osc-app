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
    }
});

module.exports = mongoose.model('Task', taskSchema);