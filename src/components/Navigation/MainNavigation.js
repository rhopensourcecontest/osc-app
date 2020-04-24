import React from 'react';
import { NavLink } from 'react-router-dom';

import AuthContext from '../context/auth-context';
import './MainNavigation.css'

/**
 * Main navigation panel
 * 
 * @param {Object} props 
 */
const mainNavigation = props => (
  <AuthContext.Consumer>
    {(context) => {
      return (
        <header className="main-navigation">
          <div className="main-navigation__logo">
            <NavLink to="/">
              <h1>Red Hat Open Source Contest</h1>
            </NavLink>
          </div>
          <nav className="main-navigation__items">
            <ul>
              {/* Show "Sign in" button only if user isn't logged in */}
              {!context.token && context.isMentor !== null && (
                <li>
                  <NavLink to="/auth">Sign in</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/tasks">Tasks</NavLink>
              </li>
              {context.token && context.isMentor && !context.isVerified && (
                <li><NavLink to="/verification">Verification</NavLink></li>
              )}
              {context.token && context.isAdmin && (
                <li><NavLink to="/admin">Administration</NavLink></li>
              )}
              {context.token && !context.isMentor && context.user && context.user.registeredTask && (
                <li>
                  <NavLink to={`/task/${context.user.registeredTask._id}`}>
                    My Task
                  </NavLink>
                </li>
              )}
              {context.token && (
                <React.Fragment>
                  <li>
                    <button onClick={context.logout}>Logout</button>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </nav>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default mainNavigation;
