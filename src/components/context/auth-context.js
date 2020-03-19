import React from 'react';

// accessible from the whole project
export default React.createContext({
  token: null,
  user: null,
  userId: null,
  isMentor: null,
  isAdmin: null,
  isVerified: null,
  login: () => { },
  logout: () => { },
  setIsMentor: () => { }
});
