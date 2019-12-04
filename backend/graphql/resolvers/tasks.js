const Task = require('../../models/task');

const { transformTask } = require('./merge');

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
    }
};