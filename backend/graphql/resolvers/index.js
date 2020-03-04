const authResolver = require('./auth');
const tasksResolver = require('./tasks');
const mentorsResolver = require('./mentors');
const studentsResolver = require('./students');

const rootResolver = {
  ...authResolver,
  ...tasksResolver,
  ...mentorsResolver,
  ...studentsResolver
};

module.exports = rootResolver;