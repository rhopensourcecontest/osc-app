const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

/**
 * Tranforms Task by binding creator and registeredStudent to allow 
 * recursive calls in graphql.
 * 
 * @param {Task} task 
 */
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

/**
 * Prevents infinite calls by transforming Tasks to depth of one 
 * recursive call.
 * 
 * @param {string[]} taskIds
 * @throws {Error}
 */
const tasks = async taskIds => {
  try {
    // get only the Tasks that have ids in taskIds array
    const tasks = await Task.find({ _id: { $in: taskIds } });
    return tasks.map(task => {
      return transformTask(task);
    });
  } catch (err) {
    throw err;
  }
};

/**
 * Prevents infinite calls by transforming Task to depth of one 
 * recursive call.
 *
 * @param {string} taskId
 * @throws {Error}
 */
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

/**
 * Returns transformed Mentor.
 * Prevents infinite calls by transforming createdTasks to depth 
 * of one recursive call.
 *
 * @param {string} mentorId
 * @throws {Error}
 */
const mentor = async mentorId => {
  try {
    const mentor = await Mentor.findById(mentorId);
    return {
      ...mentor._doc,
      uid: "*restricted*",
      createdTasks: tasks.bind(this, mentor._doc.createdTasks)
    };
  } catch (err) {
    throw err;
  }
};

/**
 * Returns transformed Student.
 * Prevents infinite calls by transforming registeredStudent 
 * to depth of one recursive call.
 *
 * @param {string} studentId
 * @throws {Error}
 */
const student = async studentId => {
  try {
    const student = await Student.findById(studentId);
    return {
      ...student._doc,
      uid: "*restricted*",
      registeredTask: singleTask.bind(this, student._doc.registeredTask)
    };
  } catch (err) {
    throw err;
  }
};

exports.singleTask = singleTask;
exports.tasks = tasks;
exports.student = student;
exports.mentor = mentor;
exports.transformTask = transformTask;
