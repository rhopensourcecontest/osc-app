const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, mentor, student, singleTask } = require('./merge');
const { sendEmail } = require('./emails');
const { EMAILS } = require('../../constants/emails');

module.exports = {
  /**
   * Get task with pre-loaded registeredStudent.
   * 
   * @param {string} args.taskId
   * @throws {Error}
   * @returns {Mentor}
   */
  task: async (args) => {
    try {
      return await singleTask(args.taskId);
    } catch (err) {
      throw err;
    }
  },
  /**
   * Returns all Tasks.
   * Tasks can be used in recursive calls.
   * 
   * @throws {Error}
   * @returns {Task[]}
   */
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
  /**
   * Returns free Tasks.
   * Tasks can be used in recursive calls.
   * 
   * @throws {Error}
   * @returns {Task[]}
   */
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
  /**
   * Returns taken Tasks.
   * Tasks can be used in recursive calls.
   *
   * @throws {Error}
   * @returns {Task[]}
   */
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
   * Creates Task with specified title and details
   *
   * @param {string} args.taskInput.title
   * @param {string} args.taskInput.details
   * @param {string} args.taskInput.link
   * @param {Object} req
   * @throws {Error} 
   * 1. If user is not authenticated
   * 2. If user is not Mentor
   * 3. If Mentor wasn't found
   * 4. If Mentor is not verified
   * @returns {Task[]}
   */
  createTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isMentor) {
      throw new Error('Only Mentors can create Tasks!');
    }

    const task = new Task({
      title: args.taskInput.title,
      details: args.taskInput.details,
      link: args.taskInput.link,
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
        throw new Error('You are not verified Mentor');
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
   * Update all fields of the Task
   * 
   * @param {Object} args.taskInput
   */
  updateTask: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isMentor) {
      throw new Error('Only Mentors can update Tasks!');
    }

    try {
      const taskInput = args.taskInput;
      const resultTask = await Task.findById(taskInput._id);

      if (!req.isAdmin &&
        resultTask.creator.toString() !== req.userId.toString()) {
        throw new Error(
          `You aren't creator of this Task and don't have Admin rights.`
        );
      }

      await resultTask.updateOne({
        title: taskInput.title,
        link: taskInput.link,
        details: taskInput.details
      });

      return {
        ...resultTask._doc,
        title: taskInput.title,
        link: taskInput.link,
        details: taskInput.details
      };
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
   * @param {Object} req
   * @throws {Error}
   * 1. If user is not authenticated
   * 2. If user isn't Student or Admin
   * 3. If Student wants to register Task for someone else
   * 4. If Student was not found
   * 5. If Students already has a Task registered
   * 6. If Task was not found
   * 7. If the Task is already taken
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
      if (!resultStudent) {
        throw new Error('Student not found.');
      }
      if (resultStudent.registeredTask) {
        throw new Error('Student can only have one Task at a time.')
      }
      const resultTask = await Task.findById(args.taskId);
      if (!resultTask) {
        throw new Error('Task not found.');
      }
      if (resultTask.registeredStudent) {
        throw new Error('Task has already been taken.')
      }

      await resultStudent.updateOne({ registeredTask: args.taskId });
      await resultTask.updateOne({ registeredStudent: args.studentId });
      const creator = await Mentor.findById({ _id: resultTask.creator });
      await sendEmail(
        creator.email,
        EMAILS.TASK_REGISTRATION,
        resultStudent.email,
        resultTask.title
      );

      await sendEmail(
        resultStudent.email,
        EMAILS.STUDENT_REGISTRATION,
        null,
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
   * @param {Object} req
   * @throws {Error}
   * 1. If user is not authenticated
   * 2. If user isn't Student or Admin
   * 3. If Student wants to unregister Task for someone else
   * 4. If Students is not registered to the Task
   * 5. If the Task doesn't have a Student registered
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
      if (resultStudent.registeredTask.toString() !== args.taskId.toString()) {
        throw new Error(
          `Student ${resultStudent._id} is not registered to Task ${args.taskId}`
        );
      }

      const resultTask = await Task.findById(args.taskId);
      if (resultTask.registeredStudent.toString() !== args.studentId.toString()) {
        throw new Error(`Task ${resultTask._id}` +
          ` doesn't have registered Student ${args.studentId}`);
      }
      await resultStudent.updateOne({ registeredTask: null });
      await resultTask.updateOne({
        registeredStudent: null, isSolved: false, isBeingSolved: false
      });

      const creator = await Mentor.findById(resultTask.creator);

      await sendEmail(
        creator.email,
        EMAILS.STUDENT_UNREGISTRATION,
        resultStudent.email,
        resultTask.title
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
   * Deletes Task defined by taskId.
   * Deletes Task from Mentor.createdTasks defined by task.creator._id
   * Mentor can delete only tasks that he created.
   * Restricted to authenticated Mentors and Admins
   * 
   * @param {string} args.taskId
   * @param {Object} req
   * @throws {Error}
   * 1. If user is not auuthenticated
   * 2. If user isn't Mentor or Admin
   * 3. If the Task doesn't exist
   * 4. If there is a Student registered to the Task
   * 5. If user isn't creator of the Task or Admin
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
        throw new Error(`Task ${args.taskId} does not exist.`);
      }

      if (task.registeredStudent) {
        const registeredStudent = await Student.findOne({
          _id: task.registeredStudent
        });
        throw new Error(
          `Student ${registeredStudent.email} is registered to this Task`
        );
      }

      const expectedCreator = await mentor(req.userId);

      if (!expectedCreator.isAdmin &&
        task.creator._id.toString() !== expectedCreator._id.toString()) {
        throw new Error(
          `You aren't creator of this Task and don't have Admin rights.`
        );
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
  },
  /**
   * Edit isSolved and isBeingSolved values of Task
   * 
   * @param {string} args.taskId
   * @param {bool} args.isSolved
   * @param {bool} args.isBeingSolved
   * @throws {Error}
   * 1. For unauthenticated users
   * 2. For Students attempting to edit Task that they are not registered to
   */
  editTaskProgress: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    if (req.isMentor) {
      throw new Error('Only for Students.');
    }

    const student = await Student.findById(req.userId);
    if (!student.registeredTask ||
      student.registeredTask.toString() !== args.taskId.toString()) {
      throw new Error('You are not registered to this Task!');
    }

    const resultTask = await Task.findById(args.taskId);
    await resultTask.updateOne(
      { isSolved: args.isSolved, isBeingSolved: args.isBeingSolved }
    );

    return {
      ...resultTask._doc,
      creator: mentor.bind(this, resultTask._doc.creator),
      isSolved: args.isSolved,
      isBeingSolved: args.isBeingSolved
    };
  }
};
