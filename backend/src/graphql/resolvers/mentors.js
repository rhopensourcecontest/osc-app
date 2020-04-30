const Task = require('../../models/task');
const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const { tasks, mentor } = require('./merge');
const { sendEmail } = require('./emails');
const { EMAILS } = require('../../constants/emails');

module.exports = {
  /**
   * Get mentor with pre-loaded createdTasks.
   * 
   * @param {string} args.mentorId
   * @throws {Error}
   * @returns {Mentor}
   */
  mentor: async (args) => {
    try {
      return await mentor(args.mentorId);
    } catch (err) {
      throw err;
    }
  },
  /**
   * Get all mentors with pre-loaded createdTasks.
   * 
   * @throws {Error}
   * @returns {Mentor[]} - Array of Mentor objects.
   */
  mentors: async () => {
    try {
      const mentors = await Mentor.find();
      return mentors.map(mentor => {
        return {
          ...mentor._doc,
          uid: '*restricted*',
          createdTasks: tasks.bind(this, mentor._doc.createdTasks)
        };
      });
    } catch (err) {
      throw err;
    }
  },
  /**
   * Create mentor.
   * 
   * @param {string} args.mentorInput.email
   * @param {string} args.mentorInput.uid
   * @throws {Error} - if Mentor already exists.
   * @returns {Mentor}
   */
  createMentor: async (args) => {
    try {
      // don't create mentor if he alredy exists
      const existingMentor = await Mentor.findOne({
        email: args.mentorInput.email,
        uid: args.mentorInput.uid
      });
      if (existingMentor) {
        throw new Error(
          `Mentor with email ${args.mentorInput.email} already exists.`
        );
      }
      const mentor = new Mentor({
        email: args.mentorInput.email,
        uid: args.mentorInput.uid,
        isVerified: false,
        isAdmin: false
      });
      const result = await mentor.save();
      await sendEmail(
        result.email,
        EMAILS.USER_REGISTRATION
      );

      return {
        ...result._doc,
        uid: '*restricted*'
      };
    } catch (err) {
      throw err;
    }
  },
  /**
   * Get emails of students who are registered to 
   * tasks of mentor with mentorId.
   * 
   * @param {ID} args.mentorId
   * @throws {Error}
   * @returns {string[]} - Array of emails.
   */
  studentEmails: async (args) => {
    try {
      const mentor = await Mentor.findById(args.mentorId);
      let emails = [];

      for (const taskId of mentor.createdTasks) {
        const task = await Task.findById(taskId);

        if (task.registeredStudent) {
          const student = await Student.findById(task.registeredStudent);
          emails.push(student.email);
        }
      }

      return emails;
    } catch (err) {
      throw err;
    }
  },
  /**
   * Get emails of all mentors.
   * 
   * @throws {Error}
   * @returns {string[]} - Array of emails.
   */
  allMentorEmails: async () => {
    try {
      const mentors = await Mentor.find();
      return mentors.map(mentor => {
        return mentor.email;
      });
    } catch (err) {
      throw err;
    }
  }
};
