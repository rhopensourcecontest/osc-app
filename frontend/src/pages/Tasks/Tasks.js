import React, { Component } from 'react';

import Modal from '../../components/Modal/Modal';
import Backdrop from '../../components/Backdrop/Backdrop';
import AuthContext from '../../components/context/auth-context';
import TaskList from './TaskList';
import TaskControl from './TaskControl';
import { TASKS } from '../../constants/tasks';
import Notification from '../../components/Notification/Notification';
import { fetchAuth } from '../../api-calls/Fetch';
import { fetchTasks } from '../../api-calls/Tasks';
import { escapeQuotes, replaceNewLines } from '../../components/Shared';

import './Tasks.css';

/**
 * Page displaying all Tasks
 */
class TasksPage extends Component {
  state = {
    creating: false,
    allTasks: [],
    tasks: [],
    regsCount: 0
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.linkRef = React.createRef();
    this.detailsRef = React.createRef();
  }

  /**
   * Fetch tasks after reload or state change.
   */
  componentDidMount() {
    this.fetchTasks(TASKS.ALL);
  }

  /**
   * Set flag to show modal for Task creation.
   */
  startCreateTaskHandler = () => {
    if (!this.context.isVerified) {
      alert("You have to be verified by Admin to create Tasks.");
      return;
    }
    this.setState({ creating: true });
  }

  /**
   * Handle Task creation. Takes title and details input from form in the modal.
   */
  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = escapeQuotes(this.titleRef.current.value);
    const link = escapeQuotes(this.linkRef.current.value);
    const details = escapeQuotes(replaceNewLines(this.detailsRef.current.value));

    if (title.trim().length === 0) {
      alert("You have to provide title!");
      return;
    }

    if (details.trim().length === 0) {
      alert("You have to provide details!");
      return;
    }

    if (link.trim().length === 0) {
      alert("You have to provide link to the project!");
      return;
    }

    const requestBody = {
      query: `
        mutation {
          createTask(taskInput: {
            title: "${title}", details: "${details}", link: "${link}"
          }) {
            _id
            title
            details
            link
            isSolved
            isBeingSolved
            creator{
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
        alert("Task " + title + " was created successfully.");
        this.fetchTasks(TASKS.ALL);
      })
      .catch(err => {
        alert("Task creation failed.");
        console.log(err);
      });
  };

  /**
   * Reset state of modals by changing state.creating to false
   */
  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  /**
   * Register Student to the task if wasRegistered === false.
   * Unregister Student from the task if wasRegistered === true.
   * 
   * @param {boolean} wasRegistered
   * - States whether the current user was registered before calling the function.
   * @param {Object} task
   */
  taskRegistrationHandler = (wasRegistered, task) => {
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
          this.setState(prevState => {
            const regsCount = prevState.regsCount - 1;
            return { regsCount: regsCount };
          });
          this.context.setRegisteredTask(null);
          alert("Task " + task.title + " was unregistered successfully.");
        } else {
          editedTask.registeredStudent = resData.data.registerTask.registeredStudent;
          this.setState(prevState => {
            const regsCount = prevState.regsCount + 1;
            return { regsCount: regsCount };
          });
          this.context.setRegisteredTask(editedTask);
          alert("Task " + task.title + " was registered successfully.");
        }
        this.fetchTasks(TASKS.ALL);
      })
      .catch(err => {
        alert((wasRegistered ? "Unregistration" : "Registration") + " failed.");
        console.log(err);
      });
  };

  /**
   * Filter state.allTasks according to filter provided and save to state.tasks
   * 
   * @param {string} filter - value from TASKS enum
   */
  filterTasks = (filter) => {
    switch (filter) {
      case TASKS.MINE:
        this.setState({
          tasks: this.state.allTasks.filter(task => {
            return task.creator._id === this.context.userId;
          })
        });
        break;
      case TASKS.ALL:
        this.setState({ tasks: this.state.allTasks });
        break;
      case TASKS.TAKEN:
        this.setState({
          tasks: this.state.allTasks.filter(task => {
            return task.registeredStudent !== null;
          })
        });
        break;
      case TASKS.FREE:
        this.setState({
          tasks: this.state.allTasks.filter(task => {
            return task.registeredStudent === null;
          })
        });
        break;
      default: break;
    }
  };

  /**
   * Get tasks from db. queryName can have values from TASKS enum
   * 
   * @param {string} queryName
   */
  fetchTasks = (queryName) => {
    fetchTasks(queryName)
      .then(resData => {
        // get object with key queryName
        const tasks = resData.data[queryName];
        this.setState({ allTasks: tasks });
        this.filterTasks(
          this.context.token && this.context.isMentor && this.context.isVerified
            ? TASKS.MINE : TASKS.ALL);
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <React.Fragment>
        {this.context.token && this.context.isMentor && !this.context.isVerified && (
          <Notification msg="You are not verified yet." type="info" />
        )}
        <h1>Tasks page</h1>
        {this.state.creating && <Backdrop />}
        {this.state.creating && (
          <Modal
            title="Add Task"
            canCancel
            canConfirm
            onCancel={this.modalCancelHandler}
            onConfirm={this.modalConfirmHandler}
          >
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleRef}></input>
              </div>
              <div className="form-control">
                <label htmlFor="link">Link to open-source project</label>
                <input type="text" id="link" ref={this.linkRef}></input>
              </div>
              <div className="form-control">
                <label htmlFor="details">Description</label>
                <textarea id="details" rows="10" ref={this.detailsRef}></textarea>
              </div>
            </form>
          </Modal>
        )}

        <TaskControl
          key={this.state.regsCount + this.state.allTasks.length}
          filterTasks={this.filterTasks}
          startCreateTaskHandler={this.startCreateTaskHandler}
        />
        <TaskList
          tasks={this.state.tasks}
          fetchTasks={this.fetchTasks}
          taskRegistrationHandler={this.taskRegistrationHandler}
        />
      </React.Fragment >
    );
  }
}

export default TasksPage;
