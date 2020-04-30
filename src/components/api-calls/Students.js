import { fetchNoAuth } from './Fetch';

/**
 * Fetch Student
 * 
 * @returns {Promise} response data
 */
export const fetchStudent = (studentId) => {
  const requestBody = {
    query: `
      query { 
        student(studentId: "${studentId}") { 
          _id email registeredTask{ _id } 
        } 
      }
    `
  };
  return fetchNoAuth(requestBody);
};
