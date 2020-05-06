const API_LOCATION = process.env.NODE_ENV === 'production'
  ? process.env.REACT_APP_REMOTE_API_LOCATION
  : process.env.REACT_APP_LOCAL_API_LOCATION;

/**
 * Fetch from API_LOCATION without auth header
 * @param {Object} requestBody defines query
 * @returns {Promise} response
 */
export const fetchNoAuth = (requestBody) => {
  return fetch(API_LOCATION, {
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

/**
 * Fetch from API_LOCATION with auth header
 * 
 * @param {string} token
 * @param {Object} requestBody defines query
 * @returns {Promise} response
 */
export const fetchAuth = (token, requestBody) => {
  return fetch(API_LOCATION, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
    .then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed');
      }
      return res.json();
    });
};
