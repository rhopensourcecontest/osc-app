import React from 'react';

// accessible from the whole project
export default React.createContext({
  token: null,
  userId: null,
  isStudent: null,
  login: () => { },
  logout: () => { },
  setIsMentor: () => { }
});