const Run = require('../../models/run');

module.exports = {
  /**
   * Gets current run.
   *
   * @throws {Error}
   * @returns {Object} Run object.
   */
  run: async () => {
    try {
      const run = await Run.findOne();
      return run
        ? {
          ...run._doc,
          deadline: new Date(run._doc.deadline).toISOString()
        }
        : null;
    } catch (err) {
      throw err;
    }
  },
  /**
   * Sets current run.
   * Changes the current run if it exists already or creates a new one otherwise
   *
   * @param {string} args.runInput.title
   * @param {string} args.runInput.deadline
   * @throws {Error} for unauthenticated users and users without admin rights
   * @returns {Object}
   */
  setRun: async (args, req) => {
    if (!req.isAuth) {
      throw Error('Unauthenticated!');
    }
    if (!req.isAdmin) {
      throw Error('You do not have admin rights!');
    }

    const deadline = args.runInput.deadline;

    try {
      // don't create run if it alredy exists
      const run = await Run.findOneAndUpdate(
        {},
        {
          title: args.runInput.title,
          deadline: deadline ? new Date(deadline) : null
        },
        { new: true, upsert: true }
      );
      return {
        ...run._doc,
        title: args.runInput.title,
        deadline: deadline ? new Date(deadline).toISOString() : null
      };
    } catch (err) {
      throw err;
    }
  }
};
