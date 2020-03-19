import React, { Component } from 'react';

import Modal from '../Modal/Modal';
import Backdrop from '../Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Tasks.css';
import { TASKS } from '../../constants/tasks';

class TasksPage extends Component {
  state = {
    creating: false,
    tasks: []
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.detailsRef = React.createRef();
  }

  componentDidMount() {
    this.fetchTasks(TASKS.ALL);
  }

  startCreateTaskHandler = () => {
    this.setState({ creating: true });
  }

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

    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        alert("Task " + title + " was created successfully.");
        this.fetchTasks(TASKS.ALL);
      })
      .catch(err => {
        alert("Task creation failed.");
        console.log(err);
      });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false });
  };

  /**
   * Delete task from db.
   *
   * @param {ID} taskId
   */
  deleteTask = (taskId) => {
    const requestBody = {
      query: `
        mutation {
          deleteTask(taskId: "${taskId}") {
            _id
            title
            details
            link
            isSolved
            isBeingSolved
          }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.deleteTask) {
          this.fetchTasks(TASKS.ALL);
          alert("Successfully deleted task " + resData.data.deleteTask.title);
        } else {
          alert("Something went wrong.");
          console.log(resData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  /**
   * Get tasks from db. queryName can have values from 
   * {TASKS.ALL, TASKS.FREE, TASKS.TAKEN}
   * 
   * @param {string} queryName
   */
  fetchTasks = (queryName) => {
    const requestBody = {
      query: `
        query {
          ${queryName} {
            _id
            title
            details
            link
            isSolved
            isBeingSolved
            registeredStudent{
              _id
              email
            }
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed');
        }
        return res.json();
      })
      .then(resData => {
        // get object with key queryName
        const tasks = resData.data[queryName];
        this.setState({ tasks: tasks });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const taskList = this.state.tasks.map(task => {
      return (
        <li key={task._id} className="tasks__list-item">
          <div className="flex-container">
            <div>
              <h4>{task.title}</h4>
              {/* Show first line of details if it has multiple lines, 20 chars otherwise */}
              {
                task.details.indexOf('\n', 0) >= 0
                  ? task.details.slice(0, task.details.indexOf('\n', 0))
                  : task.details.slice(0, 20)
              }
            </div>
            {this.context.token && this.context.isMentor && (
              <div>
                <button
                  className="btn" onClick={() => this.deleteTask(task._id)}>Delete</button>
              </div>
            )}
          </div>
        </li>
      );
    });

    return (
      <React.Fragment>
        <h1>The Tasks Page</h1>
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
                <label htmlFor="details">Details</label>
                <textarea id="details" rows="10" ref={this.detailsRef}></textarea>
              </div>
            </form>
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
        <div className="tasks-control flex-container">
          <div>
            <button onClick={() => this.fetchTasks(TASKS.ALL)}>
              All Tasks
            </button>
            <button onClick={() => this.fetchTasks(TASKS.FREE)}>
              Free Tasks
            </button>
            <button onClick={() => this.fetchTasks(TASKS.TAKEN)}>
              Taken Tasks
            </button>
          </div>
          {this.context.token && this.context.isMentor && (
            <div>
              <button onClick={this.startCreateTaskHandler}>
                + New Task
              </button>
            </div>
          )}
        </div>

        <ul className="tasks__list">
          {taskList}
        </ul>
      </React.Fragment >
    );
  }
}

export default TasksPage;
