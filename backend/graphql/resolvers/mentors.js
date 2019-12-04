const Mentor = require('../../models/mentor');

const { tasks } = require('./merge');

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
    }
};