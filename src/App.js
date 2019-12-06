import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import AuthPage from './pages/Auth';
import TasksPage from './pages/Tasks';

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          {/* without exact all pages with `/` prefix would be redirected */}
          <Redirect from="/" to="/auth" exact />
          <Route path="/auth" component={AuthPage} />
          <Route path="/tasks" component={TasksPage} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
