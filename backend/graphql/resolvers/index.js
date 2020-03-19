const authResolver = require('./auth');
const tasksResolver = require('./tasks');
const mentorsResolver = require('./mentors');
const studentsResolver = require('./students');
const adminsResolver = require('./admins');

const rootResolver = {
  ...authResolver,
  ...tasksResolver,
  ...mentorsResolver,
  ...studentsResolver,
  ...adminsResolver
};

module.exports = rootResolver;
