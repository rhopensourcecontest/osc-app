import React, { Component } from 'react';
import AuthContext from '../../context/auth-context';
import { fetchTasks, fetchTask } from '../../api-calls/Tasks';
import { fetchAuth } from '../../api-calls/Fetch';
import { Taken, Free, InProgress, NotStarted, Done } from '../../Tags/Tags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLink, faFileAlt, faUserTie, faUser, faEdit, faTags
} from "@fortawesome/free-solid-svg-icons";
import './Task.css';

/**
 * Task component with containg details
 */
class TaskPage extends Component {
  static contextType = AuthContext;

  state = {
    task: null,
    error: null
  }

  componentDidMount() {
    // fetch Task with id from url
    this.fetchTask(this.props.match.params.taskId);
  }

  /**
   * Fetch single Task
   */
  fetchTask = (taskId) => {
    fetchTask(taskId)
      .then(resData => {
        const task = resData.data.task;
        this.setState({ task: task });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Fetch Tasks based on queryName
   * 
   * @param {string} queryName
   */
  fetchTasks = (queryName) => {
    fetchTasks(queryName)
      .then(resData => {
        // get object with key queryName
        const tasks = resData.data[queryName];
        const task = tasks.find(e => e._id === this.props.match.params.taskId);
        task ? this.setState({ task: task }) : this.setState({ error: true });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /**
   * Register Student to selectedTask if wasRegistered === false.
   * Unregister Student from selectedTask if wasRegistered === true.
   * 
   * @param {boolean} wasRegistered
   * - States whether the current user was registered before calling the function.
   */
  taskRegistrationHandler = (wasRegistered) => {
    const task = this.state.task;

    const requestBody = {
      query: `
        mutation {
          ${wasRegistered ? `unregisterTask` : `registerTask`}
            (taskId: "${task._id}", studentId: "${this.context.userId}") {
              registeredStudent {
                _id
                email
              }
          }
        }
      `
    };

    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        var editedTask = task;
        if (wasRegistered) {
          editedTask.registeredStudent = null;
          this.context.setRegisteredTask(null);
          alert("Task " + task.title + " was unregistered successfully.");
        } else {
          editedTask.registeredStudent = resData.data.registerTask.registeredStudent;
          this.context.setRegisteredTask(editedTask);
          alert("Task " + task.title + " was registered successfully.");
        }
        this.setState({ task: editedTask });
        this.fetchTask(editedTask._id);
      })
      .catch(err => {
        alert((wasRegistered ? "Unregistration" : "Registration") + " failed.");
        console.log(err);
      });
  };

  render() {
    const task = this.state.task;

    if (this.state.error) {
      return (
        <center>
          <h1>Error #404: Page not found</h1>
        </center>
      );
    }

    return (
      <React.Fragment>
        {task && (
          <div className="flex-center">
            <div className="task-box">
              <h2><b>{task.title}</b></h2>

              <FontAwesomeIcon icon={faEdit} />Actions:<br />
              {/* Display Register button for authenticated Student on free Tasks 
              only if he doesn't have any Task registered yet */}
              {this.context.token && !this.context.isMentor && !task.registeredStudent &&
                (this.context.user && !this.context.user.registeredTask) && (
                  <button className="btn" onClick={() => this.taskRegistrationHandler(false)}>
                    Register
                </button>
                )}
              {/* Display Unregister button for authenticated students on their Tasks */}
              {this.context.token && !this.context.isMentor && task.registeredStudent &&
                this.context.userId === task.registeredStudent._id && (
                  <button className="btn" onClick={() => this.taskRegistrationHandler(true)}>
                    Unregister
                </button>
                )}

              <p><FontAwesomeIcon icon={faTags} />Tags:</p>
              <div className="tags">
                {task.registeredStudent ? <Taken /> : <Free />}
                {!task.isSolved && (task.isBeingSolved ? <InProgress /> : <NotStarted />)}
                {task.isSolved && <Done />}
              </div>

              <p>
                <FontAwesomeIcon icon={faLink} />Link to open-source project:
                <a href={task.link} target="_blank" rel="noopener noreferrer"> {task.link}</a>
              </p>

              <p>
                <FontAwesomeIcon icon={faUserTie} />Mentor:&nbsp;
                <a href={`mailto: ${task.creator.email}`}>{task.creator.email}</a>
              </p>

              <p><FontAwesomeIcon icon={faUser} />Registered student:&nbsp;
              {task.registeredStudent
                  ? (<a href={`mailto: ${task.registeredStudent.email}`}>
                    {task.registeredStudent.email}
                  </a>
                  ) : ""}
              </p>

              <p>
                <FontAwesomeIcon icon={faFileAlt} /><b>Description: <br /></b>
                {task.details}
              </p>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default TaskPage;
