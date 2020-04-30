const mongoose = require('mongoose');

/**
 * Testing array of Students
 */
const STUDENTS = [{
  email: 'adam@gmail.com',
  uid: 'Adam',
  registeredTask: null
}, {
  email: 'martin@gmail.com',
  uid: 'Martin',
  registeredTask: null
}, {
  email: 'tim@gmail.com',
  uid: 'Tim',
  registeredTask: null
}];

/**
* Args with existing Student input
*/
const EX_ARGS = {
  studentInput: {
    email: STUDENTS[0].email,
    uid: STUDENTS[0].uid
  }
};

/**
* Args with non-existing Student input
*/
const NEX_ARGS = {
  studentInput: {
    email: 'test@gmail.com',
    uid: '123test'
  }
};

/**
 * Request with authentication
 */
const AUTH_S_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: true,
  isMentor: false
}

/**
 * Request without authentication
 */
const NAUTH_S_REQ = {
  userId: mongoose.Types.ObjectId(),
  isAuth: false,
  isMentor: false
}

exports.STUDENTS = STUDENTS;
exports.EX_ARGS = EX_ARGS;
exports.NEX_ARGS = NEX_ARGS;
exports.AUTH_S_REQ = AUTH_S_REQ;
exports.NAUTH_S_REQ = NAUTH_S_REQ;
