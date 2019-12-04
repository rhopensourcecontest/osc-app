const Student = require('../../models/student');

const { singleTask } = require('./merge');

module.exports = {
    students: async () => {
        try {
            const students = await Student.find();
            return students.map(student => {
                return {
                    ...student._doc,
                    registeredTask: singleTask.bind(this, student._doc.registeredTask)
                };
            });
        } catch (err) {
            throw err;
        }
    }
};