import React, { Component } from 'react';
import { TASKS } from '../../constants/tasks';
import AuthContext from '../context/auth-context';

import './TaskControl.css';

class TaskControl extends Component {
  static contextType = AuthContext;

  render() {
    const taskControl = (
      <div className="task-control flex-container">
        <div>
          <button className="btn" onClick={() => this.props.filterTasks(TASKS.ALL)}>
            All Tasks
          </button>
          <button className="btn" onClick={() => this.props.filterTasks(TASKS.FREE)}>
            Free Tasks
          </button>
          <button className="btn" onClick={() => this.props.filterTasks(TASKS.TAKEN)}>
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
