const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

module.exports = {
    mentors: async () => {
        try {
            const mentors = await Mentor.find();
            return mentors.map(mentor => {
                return {
                    ...mentor._doc,
                    createdTasks: tasks.bind(this, mentor._doc.createdTasks)
                };
            });
        } catch (err) {
            throw err;
        }
    },
    createMentor: async args => {
        try {
            // don't create mentor if he alredy exists
            const existingMentor = await Mentor.findOne({
                email: args.mentorInput.email
            });
            if (existingMentor) {
                throw new Error('Mentor with email ' + args.mentorInput.email + ' already exists.');
            }
            const mentor = new Mentor({
                email: args.mentorInput.email
            });
            const result = await mentor.save();
            return { 
                ...result._doc
            };
        } catch (err) {
            throw err;
        }
    }
};