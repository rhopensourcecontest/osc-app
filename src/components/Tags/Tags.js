import React from 'react';
import './Tags.css';

const Free = (props) => (
  <div className="tag free" title="Task availability">
    Free
  </div>
);

const Taken = (props) => (
  <div className="tag taken" title="Task availability">
    Taken
  </div>
);

const NotStarted = (props) => (
  <div className="tag default" title="Task progress">
    Not started
  </div>
);

const InProgress = (props) => (
  <div className="tag default" title="Task progress">
    In progress
  </div>
);

const Done = (props) => (
  <div className="tag default" title="Task progress">
    Done
  </div>
);

export {
  Free,
  Taken,
  NotStarted,
  InProgress,
  Done
};
