import React, { Component } from 'react';
import AuthContext from '../context/auth-context';
import { fetchMentors } from '../api-calls/Mentors';
import { fetchAuth } from '../api-calls/Fetch';

import './Verification.css';

/**
 * Verification Page for Mentors.
 * Requests for verification by administrators are sent from here.
 */
class VerificationPage extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.textRef = React.createRef();
  }

  state = {
    isSubmitted: false,
    adminEmails: []
  };

  componentDidMount = () => {
    this.fetchAdminEmails();
  }

  /**
   * Fetch all Admin emails and set state.adminEmails
   */
  fetchAdminEmails = () => {
    fetchMentors()
      .then(resData => {
        const mentors = resData.data.mentors;
        let adminEmails = [];
        for (const mentor of mentors) {
          if (mentor.isAdmin) { adminEmails.push(mentor.email); }
        }
        this.setState({ adminEmails: adminEmails });
      })
      .catch(err => {
        alert('Failed to fetch mentors.');
        console.log(err);
      });
  }

  /**
   * Sends email with verification request to administrators.
   * Sets state.isSubmitted.
   */
  handleSubmit = (event) => {
    event.preventDefault();
    const text = this.textRef.current.value.split(/\r?\n/).join('<br/>');

    const requestBody = {
      query: `
          query { sendVerificationEmail(
            recipient: "${this.state.adminEmails}",
            emailType: "mentor_verification",
            text: "${text}"
          )}
        `
    };

    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        alert('Message sent.');
        this.setState({ isSubmitted: true });
      })
      .catch(err => {
        alert('Failed to send email.');
        console.log(err);
      });
  }

  render() {
    return (
      <React.Fragment>
        <div className="verif-flex-container">
          <h1>Mentor Verification page</h1>
          <center>
            <b>
              To become a verified Mentor you have to create a request to the
              Administrator.
            </b>
            <br />
            <b>Please include all information listed below:</b>
          </center>
          <ul>
            <li>Short introduction about yourself.</li>
            <li>Why do you want to be a Mentor?</li>
            <li>What kind of Tasks would you like to create for Students?</li>
          </ul>
          <div className="verif-form">
            {!this.state.isSubmitted
              ? (
                <form onSubmit={this.handleSubmit.bind(this)} method="POST">
                  <div className="form-control">
                    <label htmlFor="text">Your request:</label>
                    <textarea id="text" rows="20" cols="100" ref={this.textRef} />
                  </div>
                  <center>
                    <input className="btn" type="submit" value="Submit" />
                  </center>
                </form>)
              : (
                <p>You will receive an email after your request is accepted.</p>
              )
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
};

export default VerificationPage;
