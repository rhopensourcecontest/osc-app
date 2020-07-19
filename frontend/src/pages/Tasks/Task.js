import React, { Component } from 'react';
import AuthContext from '../../components/context/auth-context';
import { fetchTask } from '../../api-calls/Tasks';
import { fetchMentors } from '../../api-calls/Mentors';
import { fetchAuth, fetchNoAuth } from '../../api-calls/Fetch';
import { Taken, Free, InProgress, NotStarted, Done } from '../../components/Tags/Tags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLink, faFileAlt, faUserTie, faUser, faEdit, faTags
} from "@fortawesome/free-solid-svg-icons";
import Backdrop from '../../components/Backdrop/Backdrop';
import Modal from '../../components/Modal/Modal';

import './Task.css';

/** Task component with containg details */
class TaskPage extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.linkRef = React.createRef();
    this.detailsRef = React.createRef();
  }

  state = {
    task: null,
    editing: false,
    notFound: false,
    students: [],
    mentors: [],
    selectedStudent: null,
    selectedMentor: null
  }

  componentDidMount() {
    // fetch Task with id from url
    this.fetchTask(this.props.match.params.taskId);
    this.fetchStudents();
    this.fetchMentors();
  }

  /** 
   * Fetch Task defined by taskId and set state.task. 
   * Set state.notFound if the Task doesn't exist.
   * 
   * @param {string} taskId
   */
  fetchTask = (taskId) => {
    fetchTask(taskId)
      .then(resData => {
        const task = resData.data.task;
        task ? this.setState({ task: task }) : this.setState({ notFound: true });
      })
      .catch(err => {
        console.log(err);
      });
  }

  /** Fetch all Students and set state.students */
  fetchStudents = () => {
    const requestBody = {
      query: `
          query{
            students{
              _id
              email
              registeredTask{ _id }
            }
          }
        `
    };
    fetchNoAuth(requestBody)
      .then(resData => {
        this.setState({ students: resData.data.students });
      })
      .catch(err => {
        console.log(err);
      })
  }

  /** Fetch all Mentors and set state.mentors */
  fetchMentors = () => {
    fetchMentors()
      .then(resData => {
        this.setState({ mentors: resData.data.mentors });
      })
      .catch(err => {
        console.log(err);
      })
  }

  /**
   * Register Student to state.task if wasRegistered === false.
   * Unregister Student from state.task if wasRegistered === true.
   * 
   * @param {boolean} wasRegistered
   * @param {string} studentId
   * - States whether the current user was registered before calling the function.
   */
  taskRegistrationHandler = (wasRegistered, studentId) => {
    const task = this.state.task;

    const requestBody = {
      query: `
        mutation {
          ${wasRegistered ? `unregisterTask` : `registerTask`}
            (taskId: "${task._id}", studentId: "${studentId}") {
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
        var editedTask = task;
        if (wasRegistered) {
          editedTask.registeredStudent = null;
          if (!this.context.isMentor) this.context.setRegisteredTask(null);
          alert("Task " + task.title + " was unregistered successfully.");
        } else {
          editedTask.registeredStudent = resData.data.registerTask.registeredStudent;
          if (!this.context.isMentor) this.context.setRegisteredTask(editedTask);
          alert("Task " + task.title + " was registered successfully.");
        }
        this.setState({ task: editedTask });
        this.fetchTask(editedTask._id);
        this.fetchStudents();
      })
      .catch(err => {
        alert((wasRegistered ? "Unregistration" : "Registration") + " failed.");
        console.log(err);
      });
  };

  /**
   * Unregisters registeredStudent and registers nonRegisteredStudent to this Task
   * @param {string} registeredStudentId
   * @param {string} nonRegisteredStudentId
   */
  swapRegistrationHandler = (registeredStudentId, nonRegisteredStudentId) => {
    const token = this.context.token;
    const requestBody = {
      query: `
        mutation {
          swapRegistration (
            registeredStudentId: "${registeredStudentId}", 
            nonRegisteredStudentId: "${nonRegisteredStudentId}"
            taskId: "${this.state.task._id}"
          ) { registeredStudent { _id email } }
        }
      `
    };
    fetchAuth(token, requestBody)
      .then(resData => {
        let editedTask = this.state.task;
        editedTask.registeredStudent = resData.data.swapRegistration.registeredStudent;
        this.setState({ task: editedTask });
        this.fetchTask(editedTask._id);
        this.fetchStudents();
      })
      .catch(err => {
        alert("Changing the registered Student failed.");
        console.log(err);
      })
  }

  /**
   * Chamges creator (mentor) of the Task in state.task
   * @param {string} newMentorId
   */
  changeCreatorHandler = (newMentorId) => {
    const token = this.context.token;
    const requestBody = {
      query: `
        mutation {
          changeCreator (
            taskId: "${this.state.task._id}"
            oldMentorId: "${this.state.task.creator._id}"
            newMentorId: "${newMentorId}"
          ) { creator { _id email } }
        }
      `
    };
    fetchAuth(token, requestBody)
      .then(resData => {
        let editedTask = this.state.task;
        editedTask.creator = resData.data.changeCreator.creator;
        this.setState({ task: editedTask });
        this.fetchTask(editedTask._id);
        this.fetchMentors();
      })
      .catch(err => {
        alert("Changing the Mentors failed.");
        console.log(err);
      })
  }

  /**
   * Edit task progress
   * 
   * @param {string} taskId
   * @param {boolean} isBeingSolved
   * @param {boolean} isSolved
   */
  editTaskProgress = (taskId, isBeingSolved, isSolved) => {
    const requestBody = {
      query: `mutation { 
        editTaskProgress(
          taskId: "${taskId}",
          isSolved: ${isSolved},
          isBeingSolved: ${isBeingSolved}
        ) { _id isSolved isBeingSolved }
      }`
    }
    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        const response = resData.data.editTaskProgress;
        const resultTask = {
          ...this.state.task,
          isSolved: response.isSolved,
          isBeingSolved: response.isBeingSolved
        };
        this.setState({ task: resultTask });
      })
      .catch(err => {
        console.log(err);
      })
  }

  /** Reset state of modal by changing state.editing to false  */
  modalCancelHandler = () => {
    this.setState({ editing: false });
  }

  /** Edits Task fields with values from the form */
  editTask = () => {
    const title = this.titleRef.current.value;
    const link = this.linkRef.current.value;
    const details = this.detailsRef.current.value.split(/\r?\n/).join("\\n");

    if (this.state.selectedStudent) {
      if (this.state.selectedStudent === "none") {
        this.taskRegistrationHandler(true, this.state.task.registeredStudent._id);
      } else if (!this.state.task.registeredStudent) {
        this.taskRegistrationHandler(false, this.state.selectedStudent);
      } else {
        this.swapRegistrationHandler(
          this.state.task.registeredStudent._id, this.state.selectedStudent
        );
      }
    }

    if (this.state.selectedMentor) {
      this.changeCreatorHandler(this.state.selectedMentor);
    }

    const requestBody = {
      query: `mutation { 
        updateTask( taskInput: {
          _id: "${this.state.task._id}"
          title: "${title}"
          link: "${link}"
          details: "${details}"
        } ) { 
          title 
          details 
          link 
        }
      }`
    };
    const token = this.context.token;

    fetchAuth(token, requestBody)
      .then(resData => {
        const result = resData.data.updateTask;
        const resultTask = {
          ...this.state.task,
          title: result.title,
          link: result.link,
          details: result.details
        };
        this.setState({ task: resultTask, editing: false });
        alert("Task " + resultTask.title + " was successfully updated.");
      })
      .catch(err => {
        console.log(err);
      })
  }

  /** 
   * Decide whether the current User is a Student registered to displayed Task
   * @returns {boolean}
   */
  isRegisteredToTask = () => {
    return this.context.token && !this.context.isMentor
      && this.state.task.registeredStudent
      && this.context.userId === this.state.task.registeredStudent._id;
  }

  render() {
    const task = this.state.task;

    if (this.state.notFound) {
      return (
        <center>
          <h1>Error #404: Task not found</h1>
        </center>
      );
    }

    return (
      task && (
        <React.Fragment>
          {this.state.editing && <Backdrop />}
          {this.state.editing && (
            <Modal
              title="Edit Task"
              canCancel
              canConfirm
              onCancel={() => this.modalCancelHandler()}
              onConfirm={() => this.editTask()}
            >
              <form>
                <div className="form-control">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="edit-title"
                    ref={this.titleRef}
                    defaultValue={task.title}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="link">Link to open-source project</label>
                  <input
                    type="text"
                    id="edit-link"
                    ref={this.linkRef}
                    defaultValue={task.link}
                  />
                </div>
                {this.context.isAdmin && (
                  <div className="form-control inline">
                    <div>
                      <label>Mentor</label>
                      <select
                        defaultValue={task.creator ? task.creator._id : "none"}
                        onChange={(e) => {
                          this.setState({ selectedMentor: e.target.value });
                        }}
                      >
                        {this.state.mentors.map(mentor => {
                          return <option value={mentor._id} key={mentor._id}>{mentor.email}</option>
                        })}
                      </select>
                    </div>
                    <div>
                      <label>Registered Student</label>
                      <select
                        defaultValue={task.registeredStudent ? task.registeredStudent._id : "none"}
                        onChange={(e) => {
                          this.setState({ selectedStudent: e.target.value });
                        }}
                      >
                        {task.registeredStudent &&
                          <option
                            value={task.registeredStudent._id}
                            key={task.registeredStudent._id}
                          >{task.registeredStudent.email}</option>
                        }
                        {this.state.students.filter(student => !student.registeredTask)
                          .map(student => {
                            return <option value={student._id} key={student._id}>{student.email}</option>
                          })}
                        <option value="none" key="none">none</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="form-control">
                  <label htmlFor="details">Description</label>
                  <textarea
                    id="edit-details"
                    rows="10"
                    ref={this.detailsRef}
                    defaultValue={task.details}
                  />
                </div>
              </form>
            </Modal>
          )}
          <div className="flex-center">
            <div className="task-box">
              <h2><b>{task.title}</b></h2>

              <FontAwesomeIcon icon={faEdit} />Actions:<br />
              {this.context.token && (this.context.isAdmin ||
                this.context.userId === task.creator._id) && (
                  <button
                    className="btn"
                    onClick={() => this.setState({ editing: true })}
                  >
                    Edit
                  </button>
                )}
              {/* Display Register button for authenticated Student on free Tasks 
              only if he doesn't have any Task registered yet */}
              {this.context.token && !this.context.isMentor && !task.registeredStudent &&
                (this.context.user && !this.context.user.registeredTask) && (
                  <button
                    className="btn"
                    onClick={() => this.taskRegistrationHandler(false, this.context.userId)}
                  >
                    Register
                  </button>
                )}
              {this.isRegisteredToTask() && (
                <button
                  className="btn"
                  onClick={() => this.taskRegistrationHandler(true, this.context.userId)}
                >
                  Unregister
                </button>
              )}
              {this.isRegisteredToTask() && task.isBeingSolved && (
                <button
                  className="btn"
                  onClick={() => this.editTaskProgress(task._id, false, false)}
                >Stop progress</button>
              )}
              {this.isRegisteredToTask() && !task.isSolved && !task.isBeingSolved && (
                <button
                  className="btn"
                  onClick={() => this.editTaskProgress(task._id, true, false)}
                >Start progress</button>
              )}
              {this.isRegisteredToTask() && task.isSolved && (
                <button
                  className="btn"
                  onClick={() => this.editTaskProgress(task._id, false, false)}
                >Reopen</button>
              )}
              {this.isRegisteredToTask() && !task.isSolved && (
                <button
                  className="btn"
                  onClick={() => this.editTaskProgress(task._id, false, true)}
                >Close</button>
              )}

              <p><FontAwesomeIcon icon={faTags} />Tags:</p>
              <div className="tags">
                {task.registeredStudent ? <Taken /> : <Free />}
                {!task.isSolved && (task.isBeingSolved ? <InProgress /> : <NotStarted />)}
                {task.isSolved && <Done />}
              </div>

              <p>
                <FontAwesomeIcon icon={faLink} />Link to open-source project:
                <a href={task.link} target="_blank" rel="noopener noreferrer">&nbsp;
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
                  </a>
                  ) : ""}
              </p>

              <p><FontAwesomeIcon icon={faFileAlt} />Description:</p>
              <p>{task.details}</p>
            </div>
          </div>
        </React.Fragment>
      )
    );
  }
}

export default TaskPage;
