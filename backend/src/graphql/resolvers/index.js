const authResolver = require('./auth');
const tasksResolver = require('./tasks');
const mentorsResolver = require('./mentors');
const studentsResolver = require('./students');
const adminsResolver = require('./admins');
const emailsResolver = require('./emails');
const runsResolver = require('./runs');

/**
 * Connects all graphql resolvers
 */
const rootResolver = {
  ...authResolver,
  ...tasksResolver,
  ...mentorsResolver,
  ...studentsResolver,
  ...adminsResolver,
  ...emailsResolver,
  ...runsResolver
};

module.exports = rootResolver;
