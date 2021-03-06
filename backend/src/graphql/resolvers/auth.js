const Mentor = require('../../models/mentor');
const Student = require('../../models/student');

const jwt = require('jsonwebtoken');

module.exports = {
  /**
   * Login user (Mentor or Student)
   * 
   * @param {string} email
   * @param {string} uid
   * @param {boolean} isMentor
   * @throws {Error} if user is not registered yet
   */
  login: async ({ email, uid, isMentor }) => {
    // validate combination
    const user = isMentor
      ? await Mentor.findOne({ email: email, uid: uid })
      : await Student.findOne({ email: email, uid: uid });
    if (!user) {
      throw new Error((isMentor ? 'Mentor' : 'Student') + ' with email ' +
        email + ' is not registered!');
    }

    // generate token
    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      isMentor: isMentor,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified
    },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '8h' }
    );

    return {
      userId: user._id,
      token: token,
      tokenExpiration: 1,
      isMentor: isMentor,
      isAdmin: isMentor ? user.isAdmin : null,
      isVerified: isMentor ? user.isVerified : null
    };
  },
  /**
   * Verify validity of the token
   * @param {Object} args arguments
   * @param {Object} req request
   * @throws {Error}
   * @returns {Object} auth data
   */
  verify: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    } else {
      const authHeader = req.get('Authorization');
      const token = authHeader.split(' ')[1]; // Bearer vmdsawllnvslvsvonb
      return {
        userId: req.userId,
        token: token,
        isMentor: req.isMentor,
        isAdmin: req.isAdmin,
        isVerified: req.isVerified
      };
    }
  }
};
