const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Task = require('./models/task');

const app = express();

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type Task {
            _id: ID!
            title: String!
            details: String!
            link: String
            isSolved: Boolean!
            isBeingSolved: Boolean!
            creator: Mentor!
            registeredStudent: Student
        }

        input TaskInput {
            title: String!
            details: String!
        }

        type Student {
            _id: ID!
            email: String!
            registeredTask: Task
            wantedTask: Task
        }

        input StudentInput {
            email: String!
        }

        type Mentor {
            _id: ID!
            email: String!
            createdTasks: [Task!]
        }
        
        input MentorInput {
            email: String!
        }

        type RootQuery {
            tasks: [Task!]!
        }

        type RootMutation {
            createTask(taskInput: TaskInput): Task!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        tasks: () => {
            return Task.find()
                .then(tasks => {
                    return tasks.map(task => {
                        return { ...task._doc };
                    })
                })
                .catch(err => {
                    console.log(err);
                });
        },
        createTask: args => {
            const task = new Task({
                title: args.taskInput.title,
                details: args.taskInput.details,
                // link: args.taskInput.link,
                isSolved: false,
                isBeingSolved: false
                // creator: req.userId
            });
            return task
                .save()
                .then(result => {
                    console.log(result);
                    return { ...result._doc };
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        }
    },
    // interface for testing
    graphiql: true
}));

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${
            process.env.MONGO_PASSWORD
        }@cluster0-wzo9i.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
    )
    .then(() => {
        app.listen(5000);
    })
    .catch(err => {
        console.log(err);
    });
