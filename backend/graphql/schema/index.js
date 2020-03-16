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
    uid: String!
    registeredTask: Task
  }

  input StudentInput {
    email: String!
    uid: String!
  }

  type Mentor {
    _id: ID!
    email: String!
    uid: String!
    createdTasks: [Task!]
    isVerified: Boolean!
    isAdmin: Boolean!
  }

  input MentorInput {
    email: String!
    uid: String!
  }

  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
    isMentor: Boolean!
    isAdmin: Boolean
    isVerified: Boolean
  }

  type RootQuery {
    tasks: [Task!]!
    students: [Student!]!
    mentors: [Mentor!]!
    freeTasks: [Task!]!
    takenTasks: [Task!]!
    login(email: String!, uid: String!, isMentor: Boolean!): AuthData
  }

  type RootMutation {
    createTask(taskInput: TaskInput): Task
    createStudent(studentInput: StudentInput): Student
    createMentor(mentorInput: MentorInput): Mentor
    registerTask(studentId: ID!, taskId: ID!): Task!
    unregisterTask(studentId: ID!, taskId: ID!): Task!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);