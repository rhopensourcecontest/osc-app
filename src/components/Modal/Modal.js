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

      {/* Display Register button for authenticated Student on free Tasks 
      only if he doesn't have any Task registered yet */}
      {props.canRegister && props.context.token && !props.context.isMentor &&
        !props.task.registeredStudent && props.regsCount === 0 && (
          <button className="btn" onClick={props.onRegister}>Register</button>
        )}

      {/* Display Unregister button for authenticated students on their Tasks */}
      {props.canRegister && props.context.token && !props.context.isMentor &&
        props.task.registeredStudent &&
        props.context.userId === props.task.registeredStudent._id && (
          <button className="btn" onClick={props.onUnregister}>Unregister</button>
        )}
    </section>
  </div>
);

export default modal;
