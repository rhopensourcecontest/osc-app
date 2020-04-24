/**
 * Fetch from graphql without auth header
 * @param {Object} requestBody defines query
 * @returns {Promise} response
 */
export const fetchNoAuth = (requestBody) => {
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
