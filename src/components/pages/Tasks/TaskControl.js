import React, { Component } from 'react';
import { TASKS } from '../../../constants/tasks';
import AuthContext from '../../context/auth-context';

import './TaskControl.css';

/**
 * Component with buttons to control displayed Tasks
 */
class TaskControl extends Component {
  static contextType = AuthContext;

  /**
   * Removes active class from all active buttons and adds it to input
   * 
   * @param {Object} e
   */
  handleActiveButtons = (e) => {
    let element = document.getElementById("task-control-btns");
    let btns = element.getElementsByClassName("active");
    for (let button of btns) {
      button.classList.remove("active");
    }
    e.target.classList.add("active");
  }

  render() {
    const taskControl = (
      <div className="task-control flex-container">
        <div id="task-control-btns">
          {this.context.token && this.context.isMentor && (
            <button className="btn active" onClick={(e) => {
              this.props.filterTasks(TASKS.MINE);
              this.handleActiveButtons(e);
            }}>
              My Tasks
            </button>
          )}
          <button
            className={`${(this.context.token && this.context.isMentor) ? "btn" : "btn active"}`}
            onClick={(e) => {
              this.props.filterTasks(TASKS.ALL);
              this.handleActiveButtons(e);
            }}>
            All Tasks
          </button>
          <button className="btn" onClick={(e) => {
            this.props.filterTasks(TASKS.FREE);
            this.handleActiveButtons(e);
          }}>
            Free Tasks
          </button>
          <button className="btn" onClick={(e) => {
            this.props.filterTasks(TASKS.TAKEN);
            this.handleActiveButtons(e);
          }}>
            Taken Tasks
          </button>
        </div>
        {this.context.token && this.context.isMentor && (
          <div>
            <button className="btn" onClick={this.props.startCreateTaskHandler}>
              + New Task
            </button>
          </div>
        )}
      </div>
    );

    return taskControl;
  }
}


export default TaskControl;
