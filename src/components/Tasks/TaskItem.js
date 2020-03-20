import React, { Component } from 'react';
import { TASKS } from '../../constants/tasks';
import AuthContext from '../context/auth-context';

import './TaskItem.css'

class TaskItem extends Component {
  static contextType = AuthContext;

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
          this.props.fetchTasks(TASKS.ALL);
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

  render() {
    const task = this.props.task;
    const taskItem = (
      <li key={task._id} className="task__list-item">
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
              <button onClick={() => this.deleteTask(task._id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      </li>
    );

    return taskItem;
  }
}

export default TaskItem;
