import React, { Component } from 'react';
import { TASKS } from '../../constants/tasks';
import AuthContext from '../../components/context/auth-context';
import { NavLink } from 'react-router-dom';
import { Free, Taken, NotStarted, InProgress, Done } from '../../components/Tags/Tags';
import { fetchAuth } from '../../api-calls/Fetch';
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';

import './TaskItem.css';

/**
 * Component with details about the Task
 */
class TaskItem extends Component {
  static contextType = AuthContext;

  state = {
    confirming: false
  };

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
   * Adjust length of the details text displayed in TaskItem
   * 
   * @param {string} text
   * @returns {string}
   */
  adjustDetails = (text) => {
    return text.indexOf('\n') <= 50
      ? text.slice(0, text.indexOf('\n'))
      : (text.slice(0, 50) + "...")
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
              {this.adjustDetails(task.details)}
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
              <button
                className="btn"
                onClick={this.props.onDetail.bind(this, task._id)}
              >
                Details
              </button>
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
        </li>
      </>
    );

    return taskItem;
  }
}

export default TaskItem;
