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

  return fetch('http://localhost:5000/graphql', {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed');
      }
      return res.json();
    });
};
