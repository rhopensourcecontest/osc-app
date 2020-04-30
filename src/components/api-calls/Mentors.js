import { fetchNoAuth } from './Fetch';

/**
 * Fetch all Mentors
 * 
 * @returns {Promise} response data
 */
export const fetchMentors = () => {
  const requestBody = {
    query: `
      query { 
        mentors { 
          _id email isVerified isAdmin createdTasks{ _id } 
        } 
      }
    `
  };
  return fetchNoAuth(requestBody);
};

/**
 * Fetch Mentor
 * 
 * @returns {Promise} response data
 */
export const fetchMentor = (mentorId) => {
  const requestBody = {
    query: `
      query { 
        mentor(mentorId: "${mentorId}") { 
          _id email isVerified isAdmin createdTasks{ _id } 
        } 
      }
    `
  };
  return fetchNoAuth(requestBody);
};
