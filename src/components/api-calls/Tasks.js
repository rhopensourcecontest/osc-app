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
