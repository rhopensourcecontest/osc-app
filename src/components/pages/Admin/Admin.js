import React, { Component } from 'react';
import AuthContext from '../../context/auth-context';
import MentorItem from './MentorItem';
import { fetchMentors } from '../../api-calls/Mentors';
import { fetchNoAuth, fetchAuth } from '../../api-calls/Fetch';
import Notification from '../../Notification/Notification';

import './Admin.css';

/**
 * Administration page accessible only by Admin
 */
class AdminPage extends Component {
  static contextType = AuthContext;

  state = {
    mentors: [],
    queryName: 'allMentorEmails',
    notify: null,
    error: null
  };

  componentDidMount = () => {
    fetchMentors()
      .then(resData => {
        const mentors = resData.data.mentors;
        this.setState({ mentors: mentors });
      })
      .catch(err => {
        alert('Failed to fetch mentors.');
        console.log(err);
      });
  }

  /**
   * Copies emails from query to clipboard
   * 
   * @param {string} queryName
   */
  copyEmails = (queryName) => {
    const requestBody = { query: `query { ${queryName} }` };
    this.setState({ notify: null, error: null });

    fetchNoAuth(requestBody)
      .then(resData => {
        const emails = resData.data[queryName];
        var temporaryElement = document.createElement('textarea');
        document.body.appendChild(temporaryElement);
        temporaryElement.value = emails;
        temporaryElement.select();
        document.execCommand('copy');
        document.body.removeChild(temporaryElement);

        let notification = { type: 'success', msg: 'Emails copied to clipboard.' };
        this.setState({ notify: notification });
      })
      .catch(err => {
        this.setState({ error: true });
        console.log(err);
      });
  };

  unregisterAllStudents = () => {
    const requestBody = {
      query: `mutation { unregisterAllStudents { studentId taskId } }`
    };

    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        const response = resData.data.unregisterAllStudents;
        alert(`Unregistered ${response.length} students.`);
        let notification = { type: 'success', msg: 'All registrations removed.' };
        this.setState({ notify: notification });
      })
      .catch(err => {
        this.setState({ error: true });
        console.log(err);
      });
  }

  handleOptionChange = (event) => {
    const val = event.target.value;
    this.setState({ queryName: val });
  }

  render() {
    return (
      <React.Fragment>
        {this.state.notify && (
          <Notification msg={this.state.notify.msg} type={this.state.notify.type} />
        )}
        {this.state.error && (
          <Notification msg="Something went wrong." type="error" />
        )}
        <div className="">
          <h1>Administration Page</h1>
          <div className="admin-box">
            <div className="col left">
              <label>Get emails: </label>
              <select
                defaultValue={this.state.queryName}
                onChange={this.handleOptionChange.bind(this)}
              >
                <option value="allStudentEmails">All student emails</option>
                <option value="allMentorEmails">All mentor emails</option>
              </select>
              <button
                className="btn"
                title="Copy to clipboard"
                onClick={() => this.copyEmails(this.state.queryName)}
              >
                Copy
              </button>
            </div>

            <div className="col">
              <label>Unregister all Students from all Tasks</label>
              <button
                className="btn"
                onClick={() => this.unregisterAllStudents()}
              >
                Unregister
              </button>
            </div>
          </div>

          <ul className="task__list">
            <p>Here you can add / remove Mentor rights.</p>
            {this.state.mentors.map(mentor => {
              return (
                <MentorItem
                  key={mentor._id}
                  mentor={mentor}
                />
              )
            })}
          </ul>
        </div>
      </React.Fragment>
    );
  }
};

export default AdminPage;
