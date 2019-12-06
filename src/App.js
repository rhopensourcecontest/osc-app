import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import HomePage from './pages/Home';
import AuthPage from './pages/Auth';
import TasksPage from './pages/Tasks';
import MainNavigation from './components/Navigation/MainNavigation';

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <MainNavigation />
          <main className="main-content">
            <Switch>
              {/* without exact all pages with `/` prefix would be redirected */}
              <Route path="/" exact component={HomePage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/tasks" component={TasksPage} />
            </Switch>
          </main>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
