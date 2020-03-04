import React, { Component } from 'react';

import Modal from '../Modal/Modal';
import Backdrop from '../Backdrop/Backdrop';
import AuthContext from '../context/auth-context';
import './Tasks.css';

class TasksPage extends Component {
    state = {
        creating: false,
        tasks: []
    };

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleRef = React.createRef();
        this.detailsRef = React.createRef();
    }

    componentDidMount() {
        this.fetchTasks();
    }

    startCreateTaskHandler = () => {
        this.setState({ creating: true });
    }

    modalConfirmHandler = () => {
        this.setState({ creating: false });
        const title = this.titleRef.current.value;
        const details = this.detailsRef.current.value.split(/\r?\n/).join("\\n");

        if (title.trim().length === 0 || details.trim().length === 0) {
            return;
        }

        const requestBody = {
            query: `
                mutation {
                    createTask(taskInput: {title: "${title}", details: "${details}"}) {
                        _id
                        title
                        details
                        link
                        isSolved
                        isBeingSolved
                        creator{
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
                alert("Task " + title + " was created successfully.");
                this.fetchTasks();
            })
            .catch(err => {
                alert("Task creation failed.");
                console.log(err);
            });
    };

    modalCancelHandler = () => {
        this.setState({ creating: false });
    };

    fetchTasks = () => {
        const requestBody = {
            query: `
                query {
                    tasks {
                        _id
                        title
                        details
                        link
                        isSolved
                        isBeingSolved
                        registeredStudent{
                            _id
                            email
                        }
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status !== 200 && res.status !== 201) {
                    throw new Error('Failed');
                }
                return res.json();
            })
            .then(resData => {
                const tasks = resData.data.tasks;
                this.setState({ tasks: tasks });
            })
            .catch(err => {
                console.log(err);
            });
    }

    render() {
        const taskList = this.state.tasks.map(task => {
            return (
                <li key={task._id} className="tasks__list-item">
                    <b><h4>{task.title}</h4></b>
                    {/* Show first line of details if it has multiple lines, 20 chars otherwise */}
                    {
                        task.details.indexOf('\n', 0) >= 0
                            ? task.details.slice(0, task.details.indexOf('\n', 0))
                            : task.details.slice(0, 20)
                    }
                </li>
            );
        });
        return (
            <React.Fragment>
                <h1>The Tasks Page</h1>
                {this.state.creating && <Backdrop />}
                {this.state.creating && (
                    <Modal
                        title="Add Task"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleRef}></input>
                            </div>
                            <div className="form-control">
                                <label htmlFor="details">Details</label>
                                <textarea id="details" rows="10" ref={this.detailsRef}></textarea>
                            </div>
                        </form>
                    </Modal>
                )}
                {this.context.token && this.context.isMentor && (
                    <div className="tasks-control">
                        <p>Add some new tasks</p>
                        <button className="btn" onClick={this.startCreateTaskHandler}>Create Task</button>
                    </div>
                )}

                <ul className="tasks__list">
                    {taskList}
                </ul>
            </React.Fragment >
        );
    }
}

export default TasksPage;