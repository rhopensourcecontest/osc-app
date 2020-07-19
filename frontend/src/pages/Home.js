import React, { Component } from 'react';
import logo from '../images/logo.svg';
import background from '../images/osc-background.svg';

import AuthContext from '../components/context/auth-context';
import { fetchRun } from '../api-calls/Fetch';
import { formatDateOutput } from '../components/Shared';
import './Home.css'

/**
 * Home Page of the application
 */
class HomePage extends Component {
  state = {
    run: null
  }

  static contextType = AuthContext;

  componentDidMount() {
    fetchRun(this.setRunState);
  }

  /** 
   * Set state.run 
   */
  setRunState = (run) => { this.setState({ run }); }

  render() {
    const run = this.state.run;
    return (
      <React.Fragment>
        <div className="home" style={{
          backgroundImage: "url(" + background + ")"
        }}>
          <header className="home-header">
            <p>
              Current run: {run ? run.title : "TBD"}<br />
              Deadline for finishing tasks:&nbsp;
              {run ? formatDateOutput(run.deadline) : "TBD"}<br />
            </p>
            <img src={logo} className="home-logo" alt="logo" />
            <br />
            <a
              className="home-link"
              href="https://research.redhat.com/open-source-contest/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn About Open Source Contest!
            </a>
          </header>
        </div>
      </React.Fragment>
    );
  }
}

export default HomePage;
