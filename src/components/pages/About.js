import React, { Component } from 'react';
import logo from '../../logo.svg';

import AuthContext from '../context/auth-context';
import './About.css'

const Intro = () => {
  return (
    <div>
      <p>
        Open Source Contest is a competition for students during which we want to show students how easy it is to participate in open source projects. Students can also get feedback on their code and get it included in a real project. By participating in the Red Hat Open Source Contest students can win nice prizes.
      </p>
    </div>
  );
};

const Process = () => {
  return (
    <div>
      <h3>WHAT WILL I DO?</h3>
      <ol>
        <li>Pick one of the project tasks.</li>
        <li>Contribute to an open source project under the supervision of an experienced mentor from Red Hat.</li>
        <li>Present your project in front of other competitors and mentors.</li>
        <li>Receive your fabulous prize.</li>
      </ol>
    </div>
  );
};

const Dates = () => {
  return (
    <div className="about-row">
      <h3>IMPORTANT DATES</h3>
      <div className="about-text">
        <ol>
          <li>Project list available: February 17, 2020</li>
          <li>Registration for students opens: February 23, 2020</li>
          <li>Kick-off meeting: March 2, 2020</li>
          <li>Finish projects: June 1, 2020</li>
          <li>Presentation meeting: June 2020 (TBD)</li>
          <li>Announcing the winner: June 2020 (TBD)</li>
        </ol>
      </div>
      <img src={logo} className="home-logo" alt="logo" />
    </div>
  );
};

const Rewards = () => {
  return (
    <div>
      <h3>WHAT’S IN IT FOR ME?</h3>
      <p>
        In addition to the exposure that comes with public participation in an open source project, all successful participants receive Red Hat branded swag. Exceptional participants may receive offers for an internship at Red Hat. The overall contest winner receives an eshop coupon worth 10,000 CZK (or prize of equivalent value for students not able to use the voucher in Czech Republic).
      </p>
      <p>
        If you want to receive university credits for your work done during RHOSC and you study either at MUNI or MENDELU, you can join these courses:
      </p>
      <ul>
        <li>MUNI – PB173 Domain specific development in C/C++ – seminar group oss</li>
        <li>MENDELU – EXC-KROS Open Source club</li>
      </ul>
    </div>
  );
};

/**
 * Page with info about the contest
 */
class AboutPage extends Component {
  state = {};

  static contextType = AuthContext;

  render() {
    return (
      <React.Fragment>
        <div className="about">
          <div>
            <h1>Red Hat Open Source Contest</h1>
            <Intro />
            <Process />
            <Dates />
            <Rewards />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default AboutPage;
