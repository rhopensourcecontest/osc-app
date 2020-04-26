import React, { Component } from 'react';
import { TASKS } from '../../constants/tasks';
import AuthContext from '../context/auth-context';
import { NavLink } from 'react-router-dom';
import { Free, Taken, NotStarted, InProgress, Done } from '../Tags/Tags';
import { fetchAuth } from '../api-calls/Fetch';

import './TaskItem.css';

/**
 * Task component with containg details
 */
class TaskItem extends Component {
  static contextType = AuthContext;

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

  render() {
    const task = this.props.task;
    const taskItem = (
      <li key={task._id} className="task__list-item">
        <div className="task-container">
          <div className="left">
            <NavLink className="title" title="Navigate to task" to={{
              pathname: `/task/${task._id}`,
              state: {
                task: task
              }
            }}>
              <h3>{task.title}</h3>
            </NavLink>
            {/* Show first line of details if it has multiple lines, 20 chars otherwise */}
            {
              task.details.indexOf('\n', 0) >= 0
                ? task.details.slice(0, task.details.indexOf('\n', 0))
                : task.details.slice(0, 20)
            }
          </div>
          <div className="">
            <div>
              {task.registeredStudent ? <Taken /> : <Free />}
            </div>
            <div>
              {!task.isSolved && (task.isBeingSolved ? <InProgress /> : <NotStarted />)}
              {task.isSolved && <Done />}
            </div>
          </div>
          <div className="button-col">
            <button className="btn" onClick={this.props.onDetail.bind(this, task._id)}>
              Details
            </button>
            {/* Display Delete button only to creator and admin */}
            {((this.context.token && this.context.isMentor && this.context.userId === task.creator._id) ||
              (this.context.token && this.context.isAdmin)) && (
                <button className="btn" onClick={() => this.deleteTask(task._id)}>
                  Delete
                </button>
              )}
          </div>
        </div>
      </li>
    );

    return taskItem;
  }
}

export default TaskItem;
