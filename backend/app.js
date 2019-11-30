const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`
        type RootQuery {
            tasks: [String!]!
        }

        type RootMutation {
            createTask(title: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        tasks: () => {
            return ['Test 1', 'Test 2', 'Test 3'];
        },
        createTask: (args) => {
            const taskTitle = args.title;
            return taskTitle;
        }
    },
    // interface for testing
    graphiql: true
}));

app.listen(5000);