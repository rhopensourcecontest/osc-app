import React, { Component } from 'react';
import logo from '../images/logo.svg';
import background from '../images/osc-background.svg';

import { Redirect } from 'react-router-dom';
import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../components/context/auth-context';
import { fetchRun } from '../api-calls/Fetch';
import './Home.css'

/**
 * Home Page of the application
 */
class HomePage extends Component {
  state = {
    choosing: false,
    run: null,
    selectedOption: "student",
    redirect: false
  }

  static contextType = AuthContext;

  componentDidMount() {
    fetchRun(this.setRunState);
  }

  /** Set state.run */
  setRunState = (run) => { this.setState({ run }); }

  /**
   * Sets state.choosing to true
   */
  startChooseRoleHandler = () => {
    this.setState({ choosing: true });
  };

  /**
   * Unsets state.choosing and triggers redirect to /auth page
   */
  modalConfirmHandler = () => {
    this.setState({ choosing: false });
    console.log("You have submitted:", this.state.selectedOption);
    this.setState({ redirect: true });
    this.context.setIsMentor(this.state.selectedOption === "mentor");
  };

  /**
   * Unsets state.choosing
   */
  modalCancelHandler = () => {
    this.setState({ choosing: false });
  };

  /**
   * Sets state.selectedOption according to user choice in the modal
   */
  handleOptionChange = changeEvent => {
    this.setState({
      selectedOption: changeEvent.target.value
    });
  };

  /**
   * Renders redirect element if state.redirect is true
   */
  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/auth' />
    }
  }

  render() {
    const run = this.state.run;
    return (
      <React.Fragment>
        {this.state.choosing && <Backdrop />}
        {this.state.choosing && (
          <Modal
            title="Choose your role"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form>
              <div className="form-check">
                <label title="You will choose a Task and Mentor
                  responsible for this task will help you complete it."
                >
                  <input
                    type="radio"
                    name="react-tips"
                    value="student"
                    checked={this.state.selectedOption === "student"}
                    onChange={this.handleOptionChange}
                    className="form-check-input"
                  />
                  Student
                </label>
              </div>

              <div className="form-check">
                <label title="You will create Tasks and help students 
                  who will work on these tasks."
                >
                  <input
                    type="radio"
                    name="react-tips"
                    value="mentor"
                    checked={this.state.selectedOption === "mentor"}
                    onChange={this.handleOptionChange}
                    className="form-check-input"
                  />
                  Mentor
                </label>
              </div>
            </form>
          </Modal>
        )}
        {this.renderRedirect()}
        <div className="home" style={{
          backgroundImage: "url(" + background + ")"
        }}>
          <header className="home-header">
            <p>
              Current run: {run ? run.title : "TBD"}<br />
              Deadline for finishing tasks:&nbsp;
              {run ? new Date(run.deadline).toDateString() : "TBD"}<br />
            </p>
            <img src={logo} className="home-logo" alt="logo" />
            {this.context.isMentor === null && (
              <button
                className="btn"
                id="role-choice"
                onClick={this.startChooseRoleHandler}
              >
                Choose your role
              </button>
            )}
            <p>
              This application is currently under development.
            </p>
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
