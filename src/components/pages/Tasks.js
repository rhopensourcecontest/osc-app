import React, { Component } from 'react';

import './Tasks.css';

class TasksPage extends Component {
    state = {
        tasks: []
    };

    componentDidMount() {
        this.fetchTasks();
    }

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
                    {task.details}
                </li>
            );
        });
        return (
            <React.Fragment>
                <h1>The Tasks Page</h1>
                <ul className="tasks__list">
                    {taskList}
                </ul>
            </React.Fragment >
        );
    }
}

export default TasksPage;