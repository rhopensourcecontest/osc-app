import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

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
    userId: null,
    isSignedIn: false,
    isMentor: null
  }

  login = (token, userId, tokenExpiration, isSignedIn) => {
    this.setState({ token: token, userId: userId, isSignedIn: isSignedIn });
  };

  logout = () => {
    firebase.auth().signOut().then(function () {
      console.log("Sign out successful");
    }).catch(function (error) {
      throw new Error(error);
    });
    this.setState({ token: null, userId: null, isSignedIn: false, isMentor: null });
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
              token: this.state.token,
              userId: this.state.userId,
              isSignedIn: this.state.isSignedIn,
              isMentor: this.state.isMentor,
              login: this.login,
              logout: this.logout,
              setIsMentor: this.setIsMentor
            }}>
            <MainNavigation />
            <main className="main-content">
              <Switch>
                {/* without exact all pages with `/` prefix would be redirected */}
                <Route path="/" exact component={HomePage} />
                <Route path="/auth" component={AuthPage} />
                <Route path="/tasks" component={TasksPage} />
              </Switch>
            </main>
          </AuthContext.Provider>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
