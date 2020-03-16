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
  } catch (err) {
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
      uid: "*restricted*",
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