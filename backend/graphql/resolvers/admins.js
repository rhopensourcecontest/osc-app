const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');

module.exports = {
  /**
   * Unregisters all students from tasks.
   * Restricted to authenticated Admins.
   *
   * @returns {{studentId: string, taskId: string}} unregData
   */
  unregisterAllStudents: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isAdmin) {
      throw new Error('You do not have admin rights!');
    }

    try {
      const students = await Student.find();
      unregData = [];

      for (const student of students) {
        if (taskId = student.registeredTask) {
          studentId = student._id;
          student.registeredTask = null;
          await Task.findByIdAndUpdate(
            taskId, { registeredStudent: null }
          );
          await student.save();
          unregData.push({ studentId, taskId });
        }
      }

      return unregData;
    } catch (err) {
      throw err;
    }
  },
};
