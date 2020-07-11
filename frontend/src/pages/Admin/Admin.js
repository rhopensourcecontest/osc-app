import React, { Component } from 'react';
import AuthContext from '../../components/context/auth-context';
import MentorItem from './MentorItem';
import { fetchMentors } from '../../api-calls/Mentors';
import { fetchNoAuth, fetchAuth, fetchRun } from '../../api-calls/Fetch';
import Notification from '../../components/Notification/Notification';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';

import './Admin.css';

/**
 * Administration page accessible only by Admin
 */
class AdminPage extends Component {
  static contextType = AuthContext;

  state = {
    mentors: [],
    queryName: 'allMentorEmails',
    run: null,
    confirming: false,
    notify: null,
    error: null
  };

  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.titleRef = React.createRef();
  }

  componentDidMount = () => {
    this.fetchMentors();
    fetchRun(this.setRunState);
  }

  /** Set state.run */
  setRunState = (run) => { this.setState({ run }); }

  /** Fetch all mentors and save them to state.mentors */
  fetchMentors = () => {
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

  /**
   * Unregisters all Students from all Tasks.
   * Displays notification with count of cancelled registrations.
   */
  unregisterAllStudents = () => {
    // clear object to be able to notify
    this.setState({ notify: null });
    const requestBody = {
      query: `mutation { unregisterAllStudents { studentId taskId } }`
    };

    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        const response = resData.data.unregisterAllStudents;
        let notification = {
          type: 'success', msg: `Removed ${response.length} registrations.`
        };
        this.setState({ confirming: false, notify: notification });
      })
      .catch(err => {
        this.setState({ error: true });
        console.log(err);
      });
  }

  /**
   * Change state.queryName to selected value after selected option changed
   * 
   * @param {Object} event
   */
  handleEmailChange = (event) => {
    const val = event.target.value;
    this.setState({ queryName: val });
  }

  /**
   * Cancel modal by changing state.confirming to false
   */
  modalCancelHandler = () => {
    this.setState({ confirming: false });
  }

  /**
   * Validates input data and sets the current run of the contest.
   * Changes the current run if it exists already or creates a new one otherwise
   * 
   * @param {Object} event
   */
  setRun = (event) => {
    event.preventDefault();
    if (!this.titleRef.current.value) {
      alert("Please, choose a title.");
      return;
    }
    const deadline = this.dateRef.current.value;
    let runInput = {
      title: this.titleRef.current.value,
      deadline: deadline === "" ? "" : new Date(this.dateRef.current.value)
    };
    const token = this.context.token;

    const requestBody = {
      query: `mutation {
        setRun (
          runInput: {
            title: "${runInput.title}",
            deadline: "${runInput.deadline}"
          }
        ) { title deadline }
      }`
    };

    fetchAuth(token, requestBody)
      .then(resData => {
        alert(`Edited ${resData.data.setRun.title}`);
      })
      .catch(err => {
        alert(err);
        console.log(err);
      })
  }

  render() {
    const run = this.state.run;
    return (
      <React.Fragment>
        {this.state.notify && (
          <Notification msg={this.state.notify.msg} type={this.state.notify.type} />
        )}
        {this.state.error && (
          <Notification msg="Something went wrong." type="error" />
        )}
        {this.state.confirming && (
          <React.Fragment>
            <Backdrop />
            <Modal
              title="Are you sure?"
              canCancel
              canConfirm
              onCancel={this.modalCancelHandler}
              onConfirm={this.unregisterAllStudents}
            >
              Do you really want to unregister all Students from all Tasks?
            </Modal>
          </React.Fragment>
        )}
        <div className="">
          <h1>Administration page</h1>
          <div className="admin-box">
            <div className="col left form-control">
              <label>Get emails</label>
              <select
                defaultValue={this.state.queryName}
                onChange={this.handleEmailChange.bind(this)}
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
              <label style={{ color: "red", fontWeight: "bold" }}>
                Unregister all Students from all Tasks
              </label>
              <button
                className="btn"
                onClick={() => this.setState({ confirming: true })}
              >
                Unregister
              </button>
            </div>

            <div className="col">
              <form className="form-control">
                <h3>Set current run</h3><br />
                <label htmlFor="title">Run title</label>
                <input
                  type="text"
                  id="title"
                  ref={this.titleRef}
                  defaultValue={run ? run.title : ""}
                  title="e.g. 'Spring 2020'"
                />
                <label htmlFor="date">Deadline for finishing tasks</label>
                <input
                  type="date"
                  id="date"
                  ref={this.dateRef}
                  defaultValue={
                    run
                      ? new Date(run.deadline).toISOString().split('T')[0]
                      : ""
                  }
                />
                <button
                  className="btn"
                  onClick={this.setRun.bind(this)}
                >
                  Submit
                </button>
              </form>
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
