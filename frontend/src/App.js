import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import HomePage from './pages/Home';
import AuthPage from './pages/Auth';
import AboutPage from './pages/About';
import TasksPage from './pages/Tasks/Tasks';
import TaskPage from './pages/Tasks/Task';
import VerificationPage from './pages/Verification';
import AdminPage from './pages/Admin/Admin';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './components/context/auth-context';
import { fetchMentor } from './api-calls/Mentors';
import { fetchStudent } from './api-calls/Students';
import { fetchAuth } from './api-calls/Fetch';
import CookieConsent from "react-cookie-consent";

import firebase from 'firebase/app';
import 'firebase/auth';

import './App.css';

/**
 * Main component
 */
class App extends Component {
  state = {
    token: null,
    user: null,
    userId: null,
    isMentor: null,
    isAdmin: null,
    isVerified: null
  };

  componentDidMount() {
    const token = localStorage.token;
    if (token) {
      this.refreshLoginWithToken(token);
    }
  }

  /**
   * Verify validity of the token and login user if it's still valid
   * 
   * @param {string} token
   */
  refreshLoginWithToken = (token) => {
    const requestBody = {
      query: `query { verify { userId, token, isMentor, isAdmin, isVerified } }`
    };

    if (token) {
      fetchAuth(token, requestBody)
        .then(resData => {
          if (resData.data && resData.data.verify) {
            const response = resData.data.verify;
            this.setState({ isMentor: response.isMentor });
            this.login(
              response.token,
              response.userId,
              response.isAdmin,
              response.isVerified
            );
          }
        })
        .catch(err => {
          localStorage.removeItem("token");
          console.log(err);
        })
    }
  }

  /**
   * Login user and change the state accordingly
   * 
   * @param {string} token
   * @param {string} userId
   * @param {boolean} isAdmin
   * @param {boolean} isVerified
   */
  login = (token, userId, isAdmin, isVerified) => {
    this.setState({
      token: token,
      userId: userId,
      isAdmin: isAdmin,
      isVerified: isVerified
    });
    if (token && this.state.isMentor) {
      // fetch Mentor
      fetchMentor(userId)
        .then(resData => {
          const mentor = resData.data.mentor;
          this.setState({ user: mentor });
        })
        .catch(err => {
          alert('Failed to fetch mentor.');
          console.log(err);
        });
    } else {
      // fetch Student
      fetchStudent(userId)
        .then(resData => {
          const student = resData.data.student;
          this.setState({ user: student });
        })
        .catch(err => {
          alert('Failed to fetch student.');
          console.log(err);
        });
    }
  };

  /**
   * Logout user, reset the state and remove token from localStorage
   * 
   * @throws {Error} - if logout was not successful
   */
  logout = () => {
    firebase.auth().signOut().then(function () {
      console.log("Logout successful");
    }).catch(function (error) {
      throw new Error(error);
    });
    localStorage.removeItem("token");
    this.setState({
      token: null,
      user: null,
      userId: null,
      isMentor: null,
      isAdmin: null,
      isVerified: null
    });
  };

  /**
   * Sets isMentor value in the state
   * 
   * @param {boolean} choice
   */
  setIsMentor = (choice) => {
    this.setState({ isMentor: choice });
  };

  setRegisteredTask = (task) => {
    const user = { ...this.state.user, registeredTask: task };
    this.setState({ user: user });
  }

  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <AuthContext.Provider
            value={{
              // State attributes
              token: this.state.token,
              userId: this.state.userId,
              user: this.state.user,
              isMentor: this.state.isMentor,
              isAdmin: this.state.isAdmin,
              isVerified: this.state.isVerified,
              // App.js methods
              login: this.login,
              logout: this.logout,
              setIsMentor: this.setIsMentor,
              setRegisteredTask: this.setRegisteredTask
            }}>
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {/* without exact all pages with `/` prefix would show HomePage */}
                <Route path="/" exact component={HomePage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/tasks" render={(props) => (
                  <TasksPage {...props} />)}
                />
                <Route path="/about" component={AboutPage} />
                {/* Restricted for not verified Mentors */}
                {this.state.isMentor && !this.state.isVerified && !this.state.isAdmin && (
                  <Route exact path="/verification" component={VerificationPage} />
                )}
                {/* Restricted for Admins */}
                {this.state.isAdmin && (
                  <Route exact path="/admin" component={AdminPage} />
                )}
                {/* Dynamic Task route with unique key to force component remount */}
                <Route exact path="/task/:taskId" render={(props) => (
                  <TaskPage key={props.match.params.taskId} {...props} />)}
                />
                {/* Redirect everything else to root */}
                <Redirect to="/" />
              </Switch>
            </main>
            <CookieConsent>This website uses cookies to enhance the user experience.</CookieConsent>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
