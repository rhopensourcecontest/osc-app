import React, { Component } from 'react';
import logo from '../../logo.svg';

import { Redirect } from 'react-router-dom';
import Modal from '../Modal/Modal';
import Backdrop from '../Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Home.css'

class HomePage extends Component {
  state = {
    choosing: false,
    selectedOption: "student",
    redirect: false
  }

  static contextType = AuthContext;

  startChooseRoleHandler = () => {
    this.setState({ choosing: true });
  };

  modalConfirmHandler = () => {
    this.setState({ choosing: false });
    console.log("You have submitted:", this.state.selectedOption);
    this.setState({ redirect: true });
    this.context.setIsMentor(this.state.selectedOption === "mentor");
  };

  modalCancelHandler = () => {
    this.setState({ choosing: false });
  };
  
  handleOptionChange = changeEvent => {
    this.setState({
      selectedOption: changeEvent.target.value
    });
  };

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to='/auth' />
    }
  }

  render() {
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
        { this.renderRedirect() }
        <div className="home">
          <header className="home-header">
            <img src={logo} className="home-logo" alt="logo" />
            {this.context.isMentor === null
              && <button className="btn" onClick={this.startChooseRoleHandler}>Choose your role</button>
            }
            <p>
              This application is currently under development.
            </p>
            <a
              className="home-link"
              href="https://research.redhat.com/red-hat-open-source-contest/"
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