import React, { Component } from 'react';

import Modal from '../../Modal/Modal';
import Backdrop from '../../Backdrop/Backdrop';
import AuthContext from '../../context/auth-context';
import TaskList from './TaskList';
import TaskControl from './TaskControl';
import { TASKS } from '../../../constants/tasks';
import Notification from '../../Notification/Notification';
import { fetchAuth } from '../../api-calls/Fetch';
import { fetchTasks } from '../../api-calls/Tasks';

import './Tasks.css';

/**
 * Page displaying all Tasks
 */
class TasksPage extends Component {
  state = {
    creating: false,
    allTasks: [],
    tasks: [],
    selectedTask: null,
    regsCount: 0
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
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
    const title = this.titleRef.current.value;
    const details = this.detailsRef.current.value.split(/\r?\n/).join("\\n");

    if (title.trim().length === 0 || details.trim().length === 0) {
      return;
    }

    const requestBody = {
      query: `
        mutation {
          createTask(taskInput: {title: "${title}", details: "${details}"}) {
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
   * and state.selectedTask to null
   */
  modalCancelHandler = () => {
    this.setState({ creating: false, selectedTask: null });
  };

  /**
   * Show detail of the task defined by taskId.
   * 
   * @param {string} taskId
   */
  showDetailHandler = (taskId) => {
    // set registrations count for student
    if (!this.context.isMentor) {
      for (const task of this.state.tasks) {
        if (task.registeredStudent &&
          task.registeredStudent._id === this.context.userId) {
          this.setState({ regsCount: 1 });
          break;
        }
      }
    }
    this.setState(prevState => {
      const selectedTask = prevState.tasks.find(e => e._id === taskId);
      return { selectedTask: selectedTask };
    });
  };

  /**
   * Register Student to selectedTask if wasRegistered === false.
   * Unregister Student from selectedTask if wasRegistered === true.
   * 
   * @param {boolean} wasRegistered
   * - States whether the current user was registered before calling the function.
   */
  taskRegistrationHandler = (wasRegistered) => {
    const task = this.state.selectedTask;

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
        this.setState({ selectedTask: editedTask });
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
        <h1>The Tasks Page</h1>
        {(this.state.creating || this.state.selectedTask) && <Backdrop />}
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
                <label htmlFor="details">Details</label>
                <textarea id="details" rows="10" ref={this.detailsRef}></textarea>
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedTask && (
          <Modal
            title={this.state.selectedTask.title}
            canCancel
            canRegister
            onCancel={this.modalCancelHandler}
            onRegister={() => this.taskRegistrationHandler(false)}
            onUnregister={() => this.taskRegistrationHandler(true)}
            context={this.context}
            task={this.state.selectedTask}
            regsCount={this.state.regsCount}
          >
            <p>{this.state.selectedTask.details}</p>
            <p>
              Link: <a href={this.state.selectedTask.link} target="_blank"
                rel="noopener noreferrer">{this.state.selectedTask.link}</a>
            </p>
            <br />
            <p>Mentor: {this.state.selectedTask.creator.email}</p>
            <p>
              {this.state.selectedTask.registeredStudent
                ? "Registered student: " + this.state.selectedTask.registeredStudent.email
                : "Free"}
            </p>
            <p></p>
          </Modal>
        )}
        {/* TODO */}
        {this.context.token && this.context.isAdmin && (
          <p>Admin content</p>
        )}
        {/* TODO */}
        {this.context.token && this.context.isMentor && !this.context.isAdmin && (
          <p>Mentor content</p>
        )}
        {/* TODO */}
        {this.context.token && !this.context.isMentor && (
          <p>Student content</p>
        )}
        {/* TODO */}
        {!this.context.token && (
          <p>Public content</p>
        )}
        <TaskControl
          key={this.state.regsCount + this.state.allTasks.length}
          filterTasks={this.filterTasks}
          startCreateTaskHandler={this.startCreateTaskHandler}
        />
        <TaskList
          tasks={this.state.tasks}
          fetchTasks={this.fetchTasks}
          onDetail={this.showDetailHandler}
        />
      </React.Fragment >
    );
  }
}

export default TasksPage;
