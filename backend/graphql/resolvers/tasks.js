const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

module.exports = {
    tasks: async () => {
        try {
            const tasks = await Task.find();
            return tasks.map(task => {
                return transformTask(task);
            });
        } catch (err) {
            throw err;
        }
    },
    freeTasks: async () => {
        try {
            const tasks = await Task.find({ registeredStudent: null });
            return tasks.map(task => {
                return transformTask(task);
            });
        } catch (err) {
            throw err;
        }
    },
    takenTasks: async () => {
        try {
            // select all tasks where registeredStudent is NOT null
            const tasks = await Task.find({ registeredStudent: { $ne: null } });
            return tasks.map(task => {
                return transformTask(task);
            });
        } catch (err) {
            throw err;
        }
    },
    // restricted to authenticated Mentors
    createTask: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }

        if (!req.isMentor) {
            throw new Error('Only mentors can create tasks!');
        }

        const task = new Task({
            title: args.taskInput.title,
            details: args.taskInput.details,
            link: null,
            isSolved: false,
            isBeingSolved: false,
            creator: req.userId,
            registeredStudent: null
        });

        let createdTask;

        try {
            const creator = await Mentor.findById(req.userId);

            if (!creator) {
                throw new Error('Mentor not found');
            }
            // mongoose save
            const result = await task.save();
            createdTask = transformTask(result);
            creator.createdTasks.push(task);
            await creator.save();
            return createdTask;
        } catch (err) {
            throw err;
        }
    },
    // restricted
    registerTask: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }

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
    // restricted
    unregisterTask: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');
        }

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