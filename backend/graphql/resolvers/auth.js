const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

module.exports = {
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
    },
    createTask: async (args) => {
        const task = new Task({
            title: args.taskInput.title,
            details: args.taskInput.details,
            // link: args.taskInput.link,
            link: null,
            isSolved: false,
            isBeingSolved: false,
            creator: '5dd9247dad05fd273b4e205f',
            registeredStudent: null
        });
        
        let createdTask;
        
        try {
            // mongoose save
            const result = await task.save();
            createdTask = transformTask(result);
            const creator = await Mentor.findById('5dd9247dad05fd273b4e205f');

            if (!creator) {
                throw new Error('User not found');
            }
            creator.createdTasks.push(task);
            await creator.save();
            return createdTask;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    registerTask: async (args) => {
        try {
            const resultStudent = await Student.findByIdAndUpdate(
                args.studentId, { registeredTask: args.taskId }
            );
            const resultTask = await Task.findByIdAndUpdate(
                args.taskId, { registeredStudent: args.studentId }
            );
            return {
                ...resultTask._doc,
                creator: mentor.bind(this, resultTask._doc.creator),
                registeredStudent: student.bind(this, resultStudent._id)
            };   
        } catch (err) {
            throw err;
        }
    },
    unregisterTask: async (args) => {
        try {
            await Student.findByIdAndUpdate(
                args.studentId, { registeredTask: null }
            );
            const resultTask = await Task.findByIdAndUpdate(
                args.taskId, { registeredStudent: null }
            );
            return {
                ...resultTask._doc,
                creator: mentor.bind(this, resultTask._doc.creator),
                registeredStudent: null
            };
        } catch (err) {
            throw err;
        }
    }
};