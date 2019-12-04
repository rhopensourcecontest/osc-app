const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

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
    },
    createStudent: async args => {
        try {
            // don't create student if he alredy exists
            const existingStudent = await Student.findOne({
                email: args.studentInput.email
            });
            if (existingStudent) {
                throw new Error('Student with email ' + args.studentInput.email + ' already exists.');
            }
            const student = new Student({
                email: args.studentInput.email,
                registeredTask: null
            });
            const result = await student.save();
            return { 
                ...result._doc
            };
        } catch (err) {
            throw err;
        } 
    }
};