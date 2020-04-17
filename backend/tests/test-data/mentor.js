const mongoose = require('mongoose');

/**
 * Testing array of mentors
 */
const MENTORS = [{
  email: 'john@gmail.com',
  uid: 'John',
  isVerified: true,
  isAdmin: true,
  createdTasks: []
}, {
  email: 'vince@gmail.com',
  uid: 'Vince',
  isVerified: false,
  isAdmin: false,
  createdTasks: []
}, {
  email: 'peter@gmail.com',
  uid: 'Peter',
  isVerified: true,
  isAdmin: false,
  createdTasks: []
}];

/**
* Args with non-existing Mentor input
*/
const NEX_ARGS = {
  mentorInput: {
    email: "test@gmail.com",
    uid: "123test"
  }
};

/**
 * Args with non-existing Mentor input
 */
const EX_ARGS = {
  mentorInput: {
    email: MENTORS[0].email,
    uid: MENTORS[0].uid
  }
};

/**
 * Request with admin rights
 */
const ADMIN_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: true,
  isMentor: true,
  isAdmin: true,
  isVerified: true
}

/**
 * Request without authentication
 */
const NAUTH_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: false,
  isMentor: true,
  isAdmin: true,
  isVerified: true
}

/**
 * Request without admin rights
 */
const NADMIN_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: true,
  isMentor: true,
  isAdmin: false,
  isVerified: true
}

/**
 * Request without mentor rights
 */
const NVERIF_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: true,
  isMentor: true,
  isAdmin: false,
  isVerified: false
}

exports.MENTORS = MENTORS;

exports.EX_ARGS = EX_ARGS;
exports.NEX_ARGS = NEX_ARGS;

exports.ADMIN_REQ = ADMIN_REQ;
exports.NAUTH_REQ = NAUTH_REQ;
exports.NADMIN_REQ = NADMIN_REQ;
exports.NVERIF_REQ = NVERIF_REQ;
