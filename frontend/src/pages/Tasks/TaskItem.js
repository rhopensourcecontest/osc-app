import React, { Component } from 'react';
import { TASKS } from '../../constants/tasks';
import AuthContext from '../../components/context/auth-context';
import { NavLink } from 'react-router-dom';
import { Free, Taken, NotStarted, InProgress, Done } from '../../components/Tags/Tags';
import { fetchAuth } from '../../api-calls/Fetch';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLink, faFileAlt, faUserTie, faUser
} from "@fortawesome/free-solid-svg-icons";

import './TaskItem.css';

/**
 * Component with details about the Task
 */
class TaskItem extends Component {
  static contextType = AuthContext;

  state = {
    confirming: false
  };

  componentDidMount() {
    this.handleTaskDetailsCollapse();
  }

  /**
   * Finds the corresponding element based on id and hides/displays it based 
   * on current classes of the element
   */
  handleTaskDetailsCollapse = () => {
    var coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = document.getElementById(`cnt-${this.id.substring(3)}`);
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }

  /**
   * Delete task from db.
   *
   * @param {ID} taskId
   * @throws {Error} if the request status is not 200 or 201
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
            creator {
              _id
              email
            }
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
        if (resData.data.deleteTask) {
          this.props.fetchTasks(TASKS.ALL);
          this.setState({ confirming: false });
          alert("Successfully deleted task " + resData.data.deleteTask.title);
        } else {
          alert(resData.errors[0].message);
          console.log(resData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  /**
   * Cancel modal by changing state.confirming to false
   */
  modalCancelHandler = () => {
    this.setState({ confirming: false });
  }

  /**
   * Adjust length of the task details displayed in TaskItem.
   * Display first 50 chars or split with first newline.
   * 
   * @param {string} text
   * @returns {string}
   */
  adjustDetails = (text) => {
    const pos = text.indexOf('\n');
    const maxLength = 50;

    if (pos === -1) {
      return text.length < maxLength ? text : text.slice(0, maxLength) + "...";
    } else {
      return pos < maxLength
        ? text.slice(0, pos)
        : text.slice(0, maxLength) + "...";
    }
  }

  /**
   * Decides whether the user is a mentor who did not create this task
   * 
   * @param {Object} task
   * @returns {boolean}
   */
  isNotStudentAndNotCreator = (task) => {
    if (!this.context.isMentor || this.context.isAdmin) return false;
    let found = false;
    if (this.context.isMentor && this.context.user) {
      for (const t of this.context.user.createdTasks) {
        if (t._id === task._id) {
          found = true;
        }
      }
    }
    return !found;
  }

  render() {
    const task = this.props.task;
    const taskItem = (
      <>
        {this.state.confirming && (
          <React.Fragment>
            <Backdrop />
            <Modal
              title="Are you sure?"
              canCancel
              canConfirm
              onCancel={this.modalCancelHandler}
              onConfirm={() => this.deleteTask(task._id)}
            >
              Do you really want to delete the task <b>{task.title}</b>?
            </Modal>
          </React.Fragment>
        )}
        <li key={task._id} className="task__list-item">
          <div className="task-container">
            <div className="left">
              <NavLink className="title" title="Navigate to task" to={{
                pathname: `/task/${task._id}`,
                state: {
                  task: task
                }
              }}
              >
                <h3>{task.title}</h3>
              </NavLink>
              <button
                type="button"
                className="collapsible"
                id={`cl-${task._id}`}
                title="Toggle task detail"
              >
                {this.adjustDetails(task.details)}
              </button>
            </div>
            <div className="">
              <div>
                {task.registeredStudent ? <Taken /> : <Free />}
              </div>
              <div>
                {!task.isSolved &&
                  (task.isBeingSolved ? <InProgress /> : <NotStarted />)}
                {task.isSolved && <Done />}
              </div>
            </div>
            <div className="button-col">
              {/* Fill the blank space */}
              {this.isNotStudentAndNotCreator(task) && (
                <button className="btn" style={{ visibility: "hidden" }}>
                  Delete
                </button>
              )}
              {/* Display Delete button only to creator and admin */}
              {((this.context.token && this.context.isMentor &&
                this.context.userId === task.creator._id) ||
                (this.context.token && this.context.isAdmin)) && (
                  <button className="btn" onClick={() => {
                    this.setState({ confirming: true });
                  }}>
                    Delete
                  </button>
                )}
            </div>
          </div>

          <div className="content" id={`cnt-${task._id}`}>
            <p>
              <FontAwesomeIcon icon={faLink} />Link to open-source project:&nbsp;
              <a href={task.link} target="_blank" rel="noopener noreferrer">
                {task.link}
              </a>
            </p>

            <p>
              <FontAwesomeIcon icon={faUserTie} />Mentor:&nbsp;
              {task.creator && (
                <a href={`mailto: ${task.creator.email}`}>{task.creator.email}</a>
              )}
            </p>

            <p>
              <FontAwesomeIcon icon={faUser} />Registered student:&nbsp;
              {task.registeredStudent
                ? (<a href={`mailto: ${task.registeredStudent.email}`}>
                  {task.registeredStudent.email}
                </a>)
                : ""}
            </p>

            <p><FontAwesomeIcon icon={faFileAlt} />Description:</p>
            <p>{task.details}</p>

            {this.context.token && !this.context.isMentor
              && !task.registeredStudent && this.context.user
              && !this.context.user.registeredTask && (
                <button className="btn" onClick={() => {
                  this.props.taskRegistrationHandler(false, task);
                }}>
                  Register
                </button>
              )}
          </div>
        </li>
      </>
    );

    return taskItem;
  }
}

export default TaskItem;
