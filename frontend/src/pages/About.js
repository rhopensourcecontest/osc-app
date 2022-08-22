import React, { Component } from 'react';
import logo from '../images/logo.svg';

import AuthContext from '../components/context/auth-context';
import { fetchRun } from '../api-calls/Fetch';
import { formatDateOutput } from '../components/Shared';
import './About.css'

const Intro = () => {
  return (
    <div>
      <h3>WHAT’S OPEN SOURCE CONTEST?</h3>
      <p>
        Open Source Contest offers an opportunity for students to easily participate in open source projects. Students work under mentor's supervision and try to fulfill a task submitted by open source project. Students can get feedback on their code or any other type of contribution and get it included in a real project. By participating in the Red Hat Open Source Contest students can also win nice prizes and have the possibility to distinguish themselves with a public contribution.
      </p>
    </div>
  );
};

/** Element with information about the concept of OSC */
const Process = () => {
  return (
    <div>
      <h3>WHAT WILL I DO?</h3>
      <ol>
        <li>Pick one task from the list.</li>
        <li>Work on the task &amp; contribute your solution under the supervision of an experienced mentor from Red Hat.</li>
        <li>Present your project in front of other competitors and mentors.</li>
        <li>Receive your fabulous prize and feel good about your contribution to open source.</li>
        <li>(Optional) Continue your work in open source world.</li>
      </ol>
    </div>
  );
};

/** Element with important dates */
const Dates = (props) => {
  return (
    <div className="about-row">
      <div className="about-text">
        <h3>IMPORTANT DATES</h3>
        <ol>
          <li>Finish projects: {
            props.run && props.run.deadline
              ? formatDateOutput(props.run.deadline) : "TBD"
          }</li>
          <li>Presentation meeting: Fri Jun 10 2022</li>
          <li>Announcing the winner: Fri July 01 2022</li>
        </ol>
      </div>
      <img src={logo} className="home-logo" alt="logo" />
    </div>
  );
};

/** Element with information about rewards */
const Rewards = () => {
  return (
    <div>
      <h3>WHAT’S IN IT FOR ME?</h3>
      <p>
        In addition to the exposure that comes with public participation in an open source project, all successful participants receive Red Hat branded swag. Exceptional participants may receive offers for an internship at Red Hat. The overall contest winner receives an eshop coupon worth 10,000 CZK (or prize of equivalent value for students not able to use the voucher in Czech Republic*).
      </p>
      <p>
        If you want to receive university credits for your work done during RHOSC and you study at MUNI, you can join this course:
      </p>
      <ul>
        <li>MUNI – PB173 Domain specific development in C/C++ – seminar group oss (Open source development)</li>
      </ul>
      <p>* We are only able to provide vouchers consumable in Europe</p>
    </div>
  );
};

/**
 * Page with info about the contest
 */
class AboutPage extends Component {
  state = {
    run: null
  };

  static contextType = AuthContext;

  componentDidMount() { fetchRun(this.setRunState); }

  /** Set state.run */
  setRunState = (run) => { this.setState({ run }); }

  render() {
    return (
      <React.Fragment>
        <div className="about">
          <div>
            <h1>About page</h1>
            <div className="about-content">
              <Intro />
              <Process />
              <Dates run={this.state.run} />
              <Rewards />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AboutPage;
