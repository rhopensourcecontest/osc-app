const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { transformTask, singleTask, tasks, mentor, student } = require('./merge');
const { EMAILS } = require('../../constants/emails');
const { sendVerificationEmail } = require('./emails');

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
      let unregData = [];

      for (const student of students) {
        const taskId = student.registeredTask;
        if (taskId) {
          const studentId = student._id;
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
  /**
   * Change mentor rights based on parameters
   * 
   * @param {string} args.mentorId
   * @param {bool} args.isVerified
   * @param {bool} args.isAdmin
   * @param {Object} req
   * @throws {Error}
   * 1. For unauthenticated users
   * 2. For users without Admin rights
   */
  changeMentorRights: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    if (!req.isAdmin) {
      throw new Error('You do not have Admin rights!');
    }

    try {
      const mentor = await Mentor.findById(args.mentorId);
      await Mentor.findByIdAndUpdate(
        args.mentorId,
        { isVerified: args.isVerified, isAdmin: args.isAdmin }
      );
      const resultMentor = await Mentor.findById(args.mentorId);

      if (!mentor.isAdmin && args.isAdmin) {
        await sendVerificationEmail(
          {
            recipient: mentor.email,
            emailType: EMAILS.ADMIN_VERIFIED,
            text: 'You are now an Admin!'
          },
          req
        );
      } else if (!mentor.isVerified && args.isVerified) {
        await sendVerificationEmail(
          {
            recipient: mentor.email,
            emailType: EMAILS.MENTOR_VERIFIED,
            text: 'You are now a verified Mentor!'
          },
          req
        );
      }
      return {
        ...resultMentor._doc,
        uid: '*restricted*'
      };
    } catch (err) {
      throw err;
    }
  }
};
