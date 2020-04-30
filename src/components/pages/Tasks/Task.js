import React, { Component } from 'react';
import { TASKS } from '../../../constants/tasks';
import AuthContext from '../../context/auth-context';
import { fetchTasks } from '../../api-calls/Tasks';
import { fetchAuth } from '../../api-calls/Fetch';

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
    // Prevent fetching if task is passed to props
    const propState = this.props.location.state;
    if (propState && propState.task) {
      this.setState({ task: propState.task });
    } else {
      this.fetchTasks(TASKS.ALL);
    }
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
        this.fetchTasks(TASKS.ALL);
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
              <p><b>ID: </b>{task._id}</p>
              <p><b>Details: <br /></b>{task.details}</p>
              <p>
                Link: <a href={task.link} target="_blank"
                  rel="noopener noreferrer">{task.link}</a>
              </p>
              <p>Mentor: {task.creator.email}</p>
              <p>
                {task.registeredStudent
                  ? "Registered student: " + task.registeredStudent.email
                  : "Free"}
              </p>
              <p></p>
            </div>

            {/* Display Register button for authenticated Student on free Tasks 
              only if he doesn't have any Task registered yet */}
            {this.context.token && !this.context.isMentor && !task.registeredStudent &&
              !this.context.user.registeredTask && (
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
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default TaskPage;
