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

  input UpdateInput {
    _id: ID!
    title: String!
    details: String!
    link: String!
  }

  input TaskInput {
    title: String!
    details: String!
    link: String!
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

  type Run {
    _id: ID!
    title: String!
    deadline: String
  }

  input RunInput {
    title: String!
    deadline: String!
  }

  type UnregData {
    studentId: ID!
    taskId: ID!
  }

  type RootQuery {
    mentor(mentorId: ID!): Mentor!
    task(taskId: ID!): Task
    student(studentId: ID!): Student!
    allTasks: [Task!]!
    freeTasks: [Task!]!
    takenTasks: [Task!]!
    students: [Student!]!
    mentors: [Mentor!]!
    run: Run
    login(email: String!, uid: String!, isMentor: Boolean!): AuthData
    verify: AuthData
    studentEmails(mentorId: ID!): [String]!
    allStudentEmails: [String]!
    allMentorEmails: [String]!
    sendVerificationEmail(
      recipient: String!, emailType: String!, text: String!
    ): String!
  }

  type RootMutation {
    createTask(taskInput: TaskInput): Task
    createStudent(studentInput: StudentInput): Student
    createMentor(mentorInput: MentorInput): Mentor
    registerTask(studentId: ID!, taskId: ID!): Task!
    unregisterTask(studentId: ID!, taskId: ID!): Task!
    swapRegistration(
      registeredStudentId: ID!, nonRegisteredStudentId: ID!, taskId: ID!
    ): Task!
    changeCreator(taskId: ID!, oldMentorId: ID!, newMentorId: ID!): Task!
    deleteTask(taskId: ID!): Task
    updateTask(taskInput: UpdateInput!): Task!
    setRun(runInput: RunInput!): Run!
    unregisterAllStudents: [UnregData]!
    changeMentorRights(
      mentorId: ID!, isVerified: Boolean!, isAdmin: Boolean!
    ): Mentor!
    editTaskProgress(
      taskId: ID!, isSolved: Boolean!, isBeingSolved: Boolean!
    ): Task!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
