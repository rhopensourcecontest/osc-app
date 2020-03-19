import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import HomePage from './components/pages/Home';
import AuthPage from './components/pages/Auth';
import TasksPage from './components/pages/Tasks';
import MainNavigation from './components/Navigation/MainNavigation';
import AuthContext from './components/context/auth-context';

import firebase from 'firebase';

import './App.css';

class App extends Component {
  state = {
    token: null,
    user: null,
    userId: null,
    isMentor: null,
    isAdmin: null,
    isVerified: null
  };

  login = (token, userId, tokenExpiration, isAdmin, isVerified) => {
    this.setState({
      token: token,
      userId: userId,
      isAdmin: isAdmin,
      isVerified: isVerified
    });
  };

  logout = () => {
    firebase.auth().signOut().then(function () {
      console.log("Sign out successful");
    }).catch(function (error) {
      throw new Error(error);
    });
    this.setState({
      token: null,
      user: null,
      userId: null,
      isMentor: null,
      isAdmin: null,
      isVerified: null
    });
  };

  setIsMentor = (choice) => {
    this.setState({ isMentor: choice });
  };

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
              setIsMentor: this.setIsMentor
            }}>
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {/* without exact all pages with `/` prefix would show HomePage */}
                <Route path="/" exact component={HomePage} />
                {/* /auth becomes accessible after role is chosen */}
                {this.state.isMentor === null && <Redirect from="/auth" to="/" exact />}
                <Route path="/auth" component={AuthPage} />
                <Route path="/tasks" component={TasksPage} />
                {/* Redirect everything else to root */}
                <Redirect to="/" />
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
