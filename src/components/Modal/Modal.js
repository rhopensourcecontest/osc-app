import React from 'react';

import './Modal.css';

const modal = (props) => (
  <div className="modal">
    <header className="modal__header">
      <h1>
        {props.title}
      </h1>
    </header>
    <section className="modal__content">
      {props.children}
    </section>
    <section className="modal__actions">
      {/* Display Cancel button */}
      {props.canCancel && (
        <button className="btn" onClick={props.onCancel}>Cancel</button>
      )}
      {/* Display Confirm button */}
      {props.canConfirm && (
        <button className="btn" onClick={props.onConfirm}>Confirm</button>
      )}
      {/* Display Register button for authenticated Students */}
      {props.canRegister && props.context.token && !props.context.isMentor && (
        <button className="btn" onClick={props.onConfirm}>Register</button>
      )}
    </section>
  </div>
);

export default modal;
