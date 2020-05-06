require('./db-handler');

const mongoose = require('mongoose');
const taskService = require('../graphql/resolvers/tasks');
const Task = require('../models/task');
const Student = require('../models/student');
const Mentor = require('../models/mentor');

const { TASKS, NEX_ARGS } = require('./test-data/task');
const { STUDENTS, AUTH_S_REQ, NAUTH_S_REQ } = require('./test-data/student');
const {
  MENTORS,
  NAUTH_REQ,
  NADMIN_REQ,
  NVERIF_REQ,
  ADMIN_REQ
} = require('./test-data/mentor');

/**
 * Add testing Mentors, Tasks and Students.
 * Register Students to Tasks.
 */
beforeEach(async () => {
  for (let i = 0; i < STUDENTS.length; i++) {
    let mentor = new Mentor(MENTORS[i]);
    let task = new Task(TASKS[i]);
    let student = new Student(STUDENTS[i]);
    mentor.createdTasks.push(task);
    task.creator = mentor;

    // 2nd Student and 2nd Task will not be registered
    if (i != 1) {
      student.registeredTask = task;
      task.registeredStudent = student;
    }

    await mentor.save();
    await student.save();
    await task.save();
  }
});

/**
 * Task test suite.
 */
describe('task', () => {

  /**
   * Environment test
   */
  it('Testing data was added to db', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    expect((await Student.find()).length).toBe(STUDENTS.length);
    expect((await Mentor.find()).length).toBe(MENTORS.length);
  });

  /**
   * Environment test
   */
  it('Tasks have creators', async () => {
    const tasks = await Task.find();
    const mentors = await Mentor.find();

    for (let i = 0; i < tasks.length; i++) {
      expect(tasks[i].creator).not.toBeNull();
      expect(tasks[i].creator).toEqual(mentors[i]._id);
    }
  });

  /**
   * Environment test
   */
  it('Mentors have createdTasks', async () => {
    const tasks = await Task.find();
    const mentors = await Mentor.find();

    for (let i = 0; i < tasks.length; i++) {
      expect(mentors[i].createdTasks.length).toBe(1);
      expect(mentors[i].createdTasks).toContainEqual(tasks[i]._id);
    }
  });

  /**
   * Environment test
   */
  it('Students were registered to Tasks', async () => {
    const students = await Student.find();
    const tasks = await Task.find();

    for (let i = 0; i < students.length; i++) {
      if (i == 1) {
        expect(students[i].registeredTask).toBeNull();
        expect(tasks[i].registeredStudent).toBeNull();
      } else {
        expect(students[i].registeredTask).toEqual(tasks[i]._id);
        expect(tasks[i].registeredStudent).toEqual(students[i]._id);
      }
    }
  });

  it('allTasks() returns correct data', async () => {
    const actual = await taskService.allTasks();
    const tasks = await Task.find();

    expect(actual).not.toEqual(tasks);
    expect(actual.length).toBe(tasks.length);

    for (let i = 0; i < tasks.length; i++) {
      expect(actual[i]._id).not.toBeNull();
      expect(actual[i].title).toBe(tasks[i].title);
      expect(actual[i].details).toBe(tasks[i].details);
      expect(actual[i].link).toBe(tasks[i].link);
      expect(actual[i].isSolved).toBe(tasks[i].isSolved);
      expect(actual[i].isBeingSolved).toBe(tasks[i].isBeingSolved);
      expect(actual[i].creator).not.toBeNull();
      if (tasks[i].registeredStudent === null) {
        expect(actual[i].registeredStudent).toBeNull();
      } else {
        // bound Student
        expect(actual[i].registeredStudent).not.toBeNull();
      }
    }
  });

  it('freeTasks() returns correct data', async () => {
    const response = await taskService.freeTasks();
    const tasks = await Task.find();
    let expectedIds = [];

    for (const t of tasks) {
      if (t.registeredStudent === null) { expectedIds.push(t._id); }
    }

    for (const task of response) {
      expect(expectedIds).toContainEqual(task._id);
    }
  });

  it('takenTasks() returns correct data', async () => {
    const response = await taskService.takenTasks();
    const tasks = await Task.find();
    let expectedIds = [];

    for (const t of tasks) {
      if (t.registeredStudent !== null) { expectedIds.push(t._id); }
    }

    for (const task of response) {
      expect(expectedIds).toContainEqual(task._id);
    }
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('createTask() throws error', async () => {
    await expect(taskService.createTask(NEX_ARGS, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Unauthenticated Student.
   */
  it('createTask() throws error', async () => {
    await expect(taskService.createTask(NEX_ARGS, NAUTH_S_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Student.
   */
  it('createTask() throws error', async () => {
    await expect(taskService.createTask(NEX_ARGS, AUTH_S_REQ))
      .rejects.toThrow('Only Mentors can create Tasks!');
  });

  /**
   * Non-existing Mentor.
   * NADMIN_REQ generates new userId (Mentor does not exist).
   */
  it('createTask() throws error', async () => {
    await expect(taskService.createTask(NEX_ARGS, NADMIN_REQ))
      .rejects.toThrow('Mentor not found');
  });

  /**
   * Not verified Mentor without admin rights.
   * Need to replace userId in request with an existing one.
   */
  it('createTask() throws error', async () => {
    const nverifMentor = await Mentor.findOne({
      isVerified: false, isAdmin: false
    });
    await expect(taskService.createTask(
      NEX_ARGS, { ...NVERIF_REQ, userId: nverifMentor._id }
    )).rejects.toThrow('You are not verified Mentor');
  });

  /**
   * Verified Mentor without admin rights.
   */
  it('createTask() does not throw error', async () => {
    const verifMentor = await Mentor.findOne({
      isVerified: true, isAdmin: false
    });
    await expect(taskService.createTask(
      NEX_ARGS, { ...NADMIN_REQ, userId: verifMentor._id }
    )).resolves.not.toThrow();
  });

  /**
   * Verified Mentor without admin rights.
   */
  it('createTask() works correctly', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    const verifMentor = await Mentor.findOne({
      isVerified: true, isAdmin: false
    });
    const tasksCount = verifMentor.createdTasks.length;

    const response = await taskService.createTask(
      NEX_ARGS, { ...NADMIN_REQ, userId: verifMentor._id }
    );
    expect((await Task.find()).length).toBe(TASKS.length + 1);
    expect((await Mentor.findById(verifMentor._id)).createdTasks.length)
      .toBe(tasksCount + 1);

    const resultTask = await Task.findById(response._id);
    expect(resultTask._id).not.toBeNull();
    expect(resultTask._id).toEqual(response._id);
    expect(resultTask.title).toBe(NEX_ARGS.taskInput.title);
    expect(resultTask.details).toBe(NEX_ARGS.taskInput.details);
    expect(resultTask.link).not.toBeNull();
    expect(resultTask.link).toBe(NEX_ARGS.taskInput.link);
    expect(resultTask.isSolved).toBe(false);
    expect(resultTask.isBeingSolved).toBe(false);
    expect(resultTask.creator).not.toBeNull();
    expect(resultTask.creator).toEqual(verifMentor._id);
    expect(resultTask.registeredStudent).toBeNull();
  });

  /**
   * Verified Mentor with admin rights.
   */
  it('createTask() does not throw error', async () => {
    const admin = await Mentor.findOne({
      isVerified: true, isAdmin: true
    });
    await expect(taskService.createTask(
      NEX_ARGS, { ...ADMIN_REQ, userId: admin._id }
    )).resolves.not.toThrow();
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('registerTask() throws error', async () => {
    await expect(taskService.registerTask({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Unauthenticated Student.
   */
  it('registerTask() throws error', async () => {
    await expect(taskService.registerTask({}, NAUTH_S_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Mentor without Admin rights.
   */
  it('registerTask() throws error', async () => {
    await expect(taskService.registerTask({}, NADMIN_REQ))
      .rejects.toThrow('Only Students and Admins can register to Tasks!');
  });

  /**
   * Authenticated Student.
   */
  it('registerTask() does not throw error', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: null });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...AUTH_S_REQ, userId: student._id };

    await expect(taskService.registerTask(args, req)).resolves.not.toThrow();
  });

  /**
   * Authenticated Admin.
   */
  it('registerTask() does not throw error', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: null });
    const admin = await Mentor.findOne({ isAdmin: true });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...ADMIN_REQ, userId: admin._id };

    await expect(taskService.registerTask(args, req)).resolves.not.toThrow();
  });

  /**
   * Authenticated Student attempting to register someone else.
   */
  it('registerTask() throws error', async () => {
    const args = {
      studentId: mongoose.Types.ObjectId(), taskId: mongoose.Types.ObjectId()
    };
    await expect(taskService.registerTask(args, AUTH_S_REQ))
      .rejects.toThrow('Students cannot register Tasks for others!');
  });

  /**
   * Authenticated Admin registering non-existing Student.
   */
  it('registerTask() throws error', async () => {
    const args = {
      studentId: mongoose.Types.ObjectId(), taskId: mongoose.Types.ObjectId()
    };
    await expect(taskService.registerTask(args, ADMIN_REQ))
      .rejects.toThrow('Student not found.');
  });

  /**
   * Authenticated Admin registering Student who already has a Task registered.
   */
  it('registerTask() throws error', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const args = { studentId: student._id, taskId: mongoose.Types.ObjectId() };
    await expect(taskService.registerTask(args, ADMIN_REQ))
      .rejects.toThrow('Student can only have one Task at a time.');
  });

  /**
   * Authenticated Admin registering Student to non-existing Task.
   */
  it('registerTask() throws error', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const args = { studentId: student._id, taskId: mongoose.Types.ObjectId() };
    await expect(taskService.registerTask(args, ADMIN_REQ))
      .rejects.toThrow('Task not found.');
  });

  /**
   * Authenticated Admin registering Student to taken Task.
   */
  it('registerTask() throws error', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: { $ne: null } });
    const args = { studentId: student._id, taskId: task._id };
    await expect(taskService.registerTask(args, ADMIN_REQ))
      .rejects.toThrow('Task has already been taken.');
  });

  /**
   * Authenticated Student.
   */
  it('registerTask() works correctly', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: null });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...AUTH_S_REQ, userId: student._id };

    expect(student.registeredTask).toBeNull();
    expect(task.registeredStudent).toBeNull();
    await expect(taskService.registerTask(args, req)).resolves.not.toThrow();

    const resultTask = await Task.findById(task._id);
    const resultStudent = await Student.findById(student._id);

    expect(resultStudent.registeredTask).toEqual(task._id);
    expect(resultTask.registeredStudent).toEqual(student._id);
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('unregisterTask() throws error', async () => {
    await expect(taskService.unregisterTask({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Unauthenticated Student.
   */
  it('unregisterTask() throws error', async () => {
    await expect(taskService.unregisterTask({}, NAUTH_S_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Mentor without Admin rights.
   */
  it('unregisterTask() throws error', async () => {
    await expect(taskService.unregisterTask({}, NADMIN_REQ))
      .rejects.toThrow('Only Students and Admins can unregister from Tasks!');
  });

  /**
   * Authenticated Student.
   */
  it('unregisterTask() does not throw error', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({ registeredStudent: student._id });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...AUTH_S_REQ, userId: student._id };
    expect(student.registeredTask).toEqual(args.taskId);
    expect(task.registeredStudent).toEqual(args.studentId);

    await expect(taskService.unregisterTask(args, req)).resolves.not.toThrow();
  });

  /**
   * Authenticated Admin.
   */
  it('unregisterTask() does not throw error', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({ registeredStudent: student._id });
    const admin = await Mentor.findOne({ isAdmin: true });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...ADMIN_REQ, userId: admin._id };
    expect(student.registeredTask).toEqual(args.taskId);
    expect(task.registeredStudent).toEqual(args.studentId);

    await expect(taskService.unregisterTask(args, req)).resolves.not.toThrow();
  });

  /**
   * Authenticated Student attempting to unregister some else's Task.
   */
  it('unregisterTask() throws error', async () => {
    const args = {
      studentId: mongoose.Types.ObjectId(), taskId: mongoose.Types.ObjectId()
    };
    await expect(taskService.unregisterTask(args, AUTH_S_REQ))
      .rejects.toThrow('Students can unregister only their own Task!');
  });

  /**
   * Authenticated Admin trying to unregister Student registered to another Task.
   */
  it('unregisterTask() throws error', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const args = { studentId: student._id, taskId: mongoose.Types.ObjectId() };
    await expect(taskService.unregisterTask(args, ADMIN_REQ)).rejects.toThrow(
      `Student ${args.studentId} is not registered to Task ${args.taskId}`
    );
  });

  /**
   * Authenticated Admin trying to unregister Student from Task registered to
   * someone else.
   */
  it('unregisterTask() throws error', async () => {
    let student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: { $ne: student._id } });
    await student.updateOne({ registeredTask: task._id });
    const args = { studentId: student._id, taskId: task._id };
    await expect(taskService.unregisterTask(args, ADMIN_REQ)).rejects.toThrow(
      `Task ${args.taskId} doesn't have registered Student ${args.studentId}`
    );
  });

  /**
   * Authenticated Student.
   */
  it('unregisterTask() works correctly', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({ registeredStudent: { $ne: null } });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...AUTH_S_REQ, userId: student._id };

    expect(student.registeredTask).toEqual(task._id);
    expect(task.registeredStudent).toEqual(student._id);
    await expect(taskService.unregisterTask(args, req)).resolves.not.toThrow();

    const resultTask = await Task.findById(task._id);
    const resultStudent = await Student.findById(student._id);

    expect(resultStudent.registeredTask).toBeNull();
    expect(resultTask.registeredStudent).toBeNull();
  });

  /**
   * Authenticated Admin.
   */
  it('unregisterTask() clears task progress', async () => {
    const admin = await Mentor.findOne({ isAdmin: true });
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({
      registeredStudent: { $ne: null }, isBeingSolved: true
    });
    const args = { studentId: student._id, taskId: task._id };
    const req = { ...ADMIN_REQ, userId: admin._id };

    expect(task.registeredStudent).not.toBeNull();
    expect(student.registeredTask).toEqual(task._id);
    expect(task.registeredStudent).toEqual(student._id);
    await expect(taskService.unregisterTask(args, req)).resolves.not.toThrow();

    const resultTask = await Task.findById(task._id);
    const resultStudent = await Student.findById(student._id);

    // task progress should reset
    expect(resultTask.isSolved).toBe(false);
    expect(resultTask.isBeingSolved).toBe(false);
    expect(resultStudent.registeredTask).toBeNull();
    expect(resultTask.registeredStudent).toBeNull();
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('deleteTask() throws error', async () => {
    await expect(taskService.deleteTask({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Unauthenticated Student.
   */
  it('deleteTask() throws error', async () => {
    await expect(taskService.deleteTask({}, NAUTH_S_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Student.
   */
  it('deleteTask() throws error', async () => {
    await expect(taskService.deleteTask({}, AUTH_S_REQ))
      .rejects.toThrow('Only Mentors and Admins can delete Tasks!');
  });

  /**
   * Authenticated Mentor without Admin rights.
   */
  it('deleteTask() works correctly', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    const task = await Task.findOne({ registeredStudent: null });
    const mentor = await Mentor.findOne({ createdTasks: [task._id] });
    const args = { taskId: task._id };
    const req = { ...NADMIN_REQ, userId: mentor._id };

    await expect(taskService.deleteTask(args, req)).resolves.not.toThrow();
    expect((await Task.find()).length).toBe(TASKS.length - 1);
    await expect(Task.findById(task._id)).resolves.toBeNull();
  });

  /**
   * Authenticated Admin deletes someone else's task.
   */
  it('deleteTask() works correctly', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    const admin = await Mentor.findOne({ isAdmin: true });
    const task = await Task.findOne({ registeredStudent: null });
    const args = { taskId: task._id };
    const req = { ...ADMIN_REQ, userId: admin._id };

    await expect(taskService.deleteTask(args, req)).resolves.not.toThrow();
    expect((await Task.find()).length).toBe(TASKS.length - 1);
    await expect(Task.findById(task._id)).resolves.toBeNull();
  });

  /**
   * Authenticated Admin trying to delete non-existing Task.
   */
  it('deleteTask() throws error', async () => {
    const args = { taskId: mongoose.Types.ObjectId() };
    await expect(taskService.deleteTask(args, ADMIN_REQ))
      .rejects.toThrow(`Task ${args.taskId} does not exist.`);
  });

  /**
   * Authenticated Admin trying to delete Task with registered Student.
   */
  it('deleteTask() throws error', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    const admin = await Mentor.findOne({ isAdmin: true });
    const task = await Task.findOne({ registeredStudent: { $ne: null } });
    const student = await Student.findById(task.registeredStudent);
    const args = { taskId: task._id };
    const req = { ...ADMIN_REQ, userId: admin._id };

    await expect(taskService.deleteTask(args, req)).rejects.toThrow(
      `Student ${student.email} is registered to this Task`
    );
    expect((await Task.find()).length).toBe(TASKS.length);
  });

  /**
   * Authenticated Mentor without Admin rights trying to delete someone 
   * else's Task.
   */
  it('deleteTask() throws error', async () => {
    expect((await Task.find()).length).toBe(TASKS.length);
    const mentor = await Mentor.findOne({ isAdmin: false, isVerified: true });
    const task = await Task.findOne({
      registeredStudent: null, creator: { $ne: mentor._id }
    });
    const args = { taskId: task._id };
    const req = { ...NADMIN_REQ, userId: mentor._id };

    await expect(taskService.deleteTask(args, req)).rejects.toThrow(
      `You aren't creator of this Task and don't have Admin rights.`
    );
    expect((await Task.find()).length).toBe(TASKS.length);
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('editTaskProgress() throws error', async () => {
    await expect(taskService.editTaskProgress({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Unauthenticated Student.
   */
  it('editTaskProgress() throws error', async () => {
    await expect(taskService.editTaskProgress({}, NAUTH_S_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Student.
   */
  it('editTaskProgress() works correctly', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({ registeredStudent: student });
    const args = { taskId: task._id, isSolved: true, isBeingSolved: false };
    await expect(taskService.editTaskProgress(
      args, { ...AUTH_S_REQ, userId: student._id }))
      .resolves.not.toThrow();
    const resultTask = await Task.findById(task._id);

    const expectedTask = {
      ...task._doc, isSolved: args.isSolved, isBeingSolved: args.isBeingSolved
    };
    // other fields did not change
    expect(resultTask._doc).toEqual(expectedTask);
  });

  /**
   * Authenticated Student.
   */
  it('editTaskProgress() returns correct data', async () => {
    const student = await Student.findOne({ registeredTask: { $ne: null } });
    const task = await Task.findOne({ registeredStudent: student });
    const args = { taskId: task._id, isSolved: false, isBeingSolved: true };
    const response = await taskService.editTaskProgress(
      args, { ...AUTH_S_REQ, userId: student._id }
    );

    expect(response.isSolved).toBe(args.isSolved);
    expect(response.isBeingSolved).toBe(args.isBeingSolved);
  });

  /**
   * Authenticated Student not registered to Task
   */
  it('editTaskProgress() throws error', async () => {
    const student = await Student.findOne({ registeredTask: null });
    const task = await Task.findOne({ registeredStudent: { $ne: null } });
    const args = { taskId: task._id, isSolved: false, isBeingSolved: true };
    await expect(taskService.editTaskProgress(args, { ...AUTH_S_REQ, userId: student._id }))
      .rejects.toThrow('You are not registered to this Task!');
    const resultTask = await Task.findById(task._id);
    expect(resultTask.isSolved).toBe(task.isSolved);
    expect(resultTask.isBeingSolved).toBe(task.isBeingSolved);
  });

  // ------------------------------------------------------------------------ \\

  /**
   * Unauthenticated Mentor.
   */
  it('updateTask() throws error', async () => {
    await expect(taskService.updateTask({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Student.
   */
  it('updateTask() throws error', async () => {
    const student = await Student.findOne();
    const req = { ...AUTH_S_REQ, userId: student._id };
    await expect(taskService.updateTask({}, req))
      .rejects.toThrow('Only Mentors can update Tasks!');
  });

  /**
   * Authenticated Mentor without Admin rights trying to update Task not 
   * created by him.
   */
  it('updateTask() throws error', async () => {
    const mentor = await Mentor.findOne({
      isAdmin: false, createdTasks: { $ne: [] }
    });
    const task = await Task.findOne({ creator: { $ne: mentor } });
    const args = {
      taskInput: {
        _id: task._id, title: 'Edited', details: 'Edited', link: task.link
      }
    };
    await expect(taskService.updateTask(
      args, { ...NADMIN_REQ, userId: mentor._id })).rejects.toThrow(
        `You aren't creator of this Task and don't have Admin rights.`
      );
  });

  /**
   * Authenticated creator of the Task without Admin rights.
   */
  it('updateTask() works correctly', async () => {
    const mentor = await Mentor.findOne({
      isAdmin: false, createdTasks: { $ne: [] }
    });
    const task = await Task.findOne({ creator: mentor });
    const args = {
      taskInput: {
        _id: task._id, title: 'Edited', details: 'Edited', link: task.link
      }
    };
    const response = await taskService.updateTask(
      args, { ...NADMIN_REQ, userId: mentor._id }
    );

    // correct response
    expect(response.title).toBe(args.taskInput.title);
    expect(response.details).toBe(args.taskInput.details);
    expect(response.link).toBe(task.link);

    // correct data in the db
    const resultTask = await Task.findById(task._id);
    expect(resultTask.title).toBe(args.taskInput.title);
    expect(resultTask.details).toBe(args.taskInput.details);
    expect(resultTask.link).toBe(task.link);
  });

  /**
   * Authenticated Admin who did not create the Task
   */
  it('updateTask() works correctly', async () => {
    const admin = await Mentor.findOne({
      isAdmin: true, createdTasks: { $ne: [] }
    });
    const task = await Task.findOne({ creator: admin });
    const args = {
      taskInput: {
        _id: task._id,
        title: 'Edited',
        details: task.details,
        link: 'www.edited.com'
      }
    };
    const response = await taskService.updateTask(
      args, { ...NADMIN_REQ, userId: admin._id }
    );

    // correct response
    expect(response.title).toBe(args.taskInput.title);
    expect(response.details).toBe(task.details);
    expect(response.link).toBe(args.taskInput.link);

    // correct data in the db
    const resultTask = await Task.findById(task._id);
    expect(resultTask.title).toBe(args.taskInput.title);
    expect(resultTask.details).toBe(task.details);
    expect(resultTask.link).toBe(args.taskInput.link);
  });

});
