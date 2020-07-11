import { fetchNoAuth } from './Fetch';

/**
 * Fetch Tasks
 * 
 * @returns {Promise} response data
 */
export const fetchTasks = (queryName) => {
  const requestBody = {
    query: `
        query {
          ${queryName} {
            _id
            title
            details
            link
            isSolved
            isBeingSolved
            registeredStudent{
              _id
              email
            }
            creator {
              _id
              email
            }
          }
        }
      `
  };
  return fetchNoAuth(requestBody);
};

/**
 * Fetch Task
 * 
 * @returns {Promise} response data
 */
export const fetchTask = (taskId) => {
  const requestBody = {
    query: `
        query {
          task ( taskId: "${taskId}" ) {
            _id
            title
            details
            link
            isSolved
            isBeingSolved
            registeredStudent{
              _id
              email
            }
            creator {
              _id
              email
            }
          }
        }
      `
  };
  return fetchNoAuth(requestBody);
};
