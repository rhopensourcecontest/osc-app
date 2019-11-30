const { buildSchema } = require('graphql');

module.exports = buildSchema(`
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
        createMentor(mentorInput: MentorInput): Mentor!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);