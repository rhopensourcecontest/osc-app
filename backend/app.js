const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

const tasks = [];

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
            return tasks;
        },
        createTask: (args) => {
            const task = {
                _id: Math.random().toString(),
                title: args.taskInput.title,
                details: args.taskInput.details,
                // link: args.taskInput.link,
                isSolved: false,
                isBeingSolved: false
                // creator: req.userId
            }
            tasks.push(task);
            return task;
        }
    },
    // interface for testing
    graphiql: true
}));

app.listen(5000);