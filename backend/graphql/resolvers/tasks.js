const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

module.exports = {
  allTasks: async () => {
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
  /**
   * restricted to authenticated Mentors
   */
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
      if (!creator.isVerified) {
        throw new Error('You are not verified mentor');
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
  /**
   * restricted
   */
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
  /**
   * restricted
   */
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
  },
  /**
   * restricted to authenticated Mentors and Admins
   * 
   * Mentor can delete only tasks that he created
   * 
   * Return deleted Task
   * Deletes Task defined by taskId
   * Deletes Task from createdTasks in Mentor defined by task.creator._id
   */
  deleteTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    if (!req.isMentor) {
      throw new Error('Only Mentors and Admins can delete Tasks!');
    }

    try {
      const task = await Task.findById(args.taskId);

      if (!task) {
        throw new Error("Task " + args.taskId + " does not exist.");
      }

      const expectedCreator = await mentor(req.userId);

      if (expectedCreator.isAdmin) {
        // continue
      } else if (task.creator._id !== expectedCreator._id) {
        throw new Error("You aren't creator of this task.");
      } else if (!expectedCreator.isAdmin) {
        throw new Error("You do not have admin rights.");
      }

      // remove Task from createdTasks of creator
      await Mentor.updateOne(
        { _id: task.creator._id },
        { $pullAll: { createdTasks: [args.taskId] } }
      );

      // delete Task from db
      await Task.deleteOne({ _id: args.taskId });
      return transformTask(task);
    } catch (err) {
      throw err;
    }
  }
};
