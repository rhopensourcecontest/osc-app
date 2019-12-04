const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const transformTask = task => {
    if (!task.registeredStudent) {
        return { 
            ...task._doc, 
            creator: mentor.bind(this, task.creator)
        };    
    }
    return { 
        ...task._doc, 
        creator: mentor.bind(this, task.creator),
        registeredStudent: student.bind(this, task.registeredStudent)
    };
};

// prevents infinite calls
const tasks = async taskIds => {
    try {
        const tasks = await Task.find({ _id: { $in: taskIds } });
        return tasks.map(task => {
            return transformTask(task);      
        });
    } catch(err) {
        throw err;
    }
};

// prevents infinite calls
const singleTask = async taskId => {
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return null;
        }
        return transformTask(task);
    } catch (err) {
        throw err;   
    }
};

// prevents infinite calls
const mentor = async mentorId => {
    try {
        const mentor = await Mentor.findById(mentorId);
        return { 
            ...mentor._doc,
            createdTasks: tasks.bind(this, mentor._doc.createdTasks)
        };
    } catch (err) {
        throw err;
    }
};

// prevents infinite calls
const student = async studentId => {
    try {
        const student = await Student.findById(studentId);
        return { 
            ...student._doc
        };
    } catch (err) {
        throw err;   
    }
};

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
    createTask: async (args) => {
        const task = new Task({
            title: args.taskInput.title,
            details: args.taskInput.details,
            // link: args.taskInput.link,
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
    createMentor: async args => {
        try {
            // don't create if he alredy exists
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
            // don't create if he alredy exists
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