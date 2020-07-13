import React from 'react';

import TaskItem from './TaskItem';
import './TaskList.css';

/**
 * Component containing Task Items
 * 
 * @param {Object} props 
 */
const taskList = props => {
  const taskList = props.tasks.map(task => {
    return (
      <TaskItem
        key={task._id}
        task={task}
        fetchTasks={props.fetchTasks}
        onDetail={props.onDetail}
      />
    );
  });

  return <ul className="task__list">{taskList}</ul>;
};

export default taskList;
