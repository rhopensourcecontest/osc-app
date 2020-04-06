const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');
const { sendEmail } = require('./emails');
const { EMAILS } = require('../../constants/emails');

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
   * Register Task defined by taskId to Student defined by studentId.
   * Restricted to authenticated Students and Admins.
   * Student can register Task only for himself.
   * 
   * @param {string} args.studentId
   * @param {string} args.taskId
   * @returns {Task} Task with pre-loaded creator and registeredStudent.
   */
  registerTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isAdmin && req.isMentor) {
      throw new Error('Only Students and Admins can register to Tasks!');
    }

    if (!req.isMentor && req.userId !== args.studentId) {
      throw new Error('Students cannot register Tasks for others!');
    }

    try {
      const resultStudent = await Student.findById(args.studentId);
      if (resultStudent.registeredTask) {
        throw new Error("Student can only have one Task at a time.")
      }
      const resultTask = await Task.findById(args.taskId);
      if (resultTask.registeredStudent) {
        throw new Error("Task has already been taken.")
      }

      await resultStudent.updateOne({ registeredTask: args.taskId });
      await resultTask.updateOne({ registeredStudent: args.studentId });
      const creator = await Mentor.findById({ _id: resultTask.creator });
      sendEmail(
        creator.email,
        EMAILS.TASK_REGISTRATION,
        resultStudent.email,
        resultTask.title
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
   * Unregister Task defined by taskId from Student defined by studentId.
   * Restricted to authenticated Students and Admins.
   * Student can unregister Task only for himself.
   *
   * @param {string} args.studentId
   * @param {string} args.taskId
   * @returns {Task} Task with pre-loaded creator and registeredStudent
   */
  unregisterTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isAdmin && req.isMentor) {
      throw new Error('Only Students and Admins can unregister from Tasks!');
    }

    if (!req.isMentor && req.userId !== args.studentId) {
      throw new Error('Students can unregister only their own Task!');
    }

    try {
      const resultStudent = await Student.findById(args.studentId);
      if (resultStudent.registeredTask != args.taskId) {
        throw new Error("Student " + resultStudent._id + " is not registered " +
          "to Task " + args.taskId);
      }

      const resultTask = await Task.findById(args.taskId);
      if (resultTask.registeredStudent != args.studentId) {
        throw new Error("Task " + resultTask._id +
          " doesn't have registered Student " + args.studentId);
      }
      await resultStudent.updateOne({ registeredTask: null });
      await resultTask.updateOne({ registeredStudent: null });

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
   * Deletes Task defined by taskId.
   * Deletes Task from Mentor.createdTasks defined by task.creator._id
   * Mentor can delete only tasks that he created.
   * Restricted to authenticated Mentors and Admins
   * 
   * @param {string} args.taskId
   * @returns {Task} Task with pre-loaded creator and registeredStudent
   * Deletes Task defined by taskId
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

      if (task.registeredStudent) {
        const registeredStudent = await Student.findOne({ _id: task.registeredStudent });
        throw new Error("Student " + registeredStudent.email +
          " is registered to this task");
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
