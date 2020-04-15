require('./db-handler');

const mongoose = require('mongoose');
const adminService = require('../graphql/resolvers/admins');
const Task = require('../models/task');
const Student = require('../models/student');

const { STUDENTS } = require('./test-data/student');
const { TASKS } = require('./test-data/task');
const { NAUTH_REQ, NADMIN_REQ, ADMIN_REQ } = require('./test-data/mentor');

/**
 * Add predefined Students and Tasks.
 * Register Students to Tasks.
 */
beforeEach(async () => {
  for (let i = 0; i < STUDENTS.length; i++) {
    let task = new Task(TASKS[i]);
    let student = new Student(STUDENTS[i]);
    student.registeredTask = task;
    task.registeredStudent = student;
    await student.save();
    await task.save();
  }
});

/**
 * Admin test suite.
 */
describe('admin', () => {

  /**
   * Environment test
   */
  it('Testing data was added to db', async () => {
    expect((await Student.find()).length).toBe(STUDENTS.length);
    expect((await Task.find()).length).toBe(TASKS.length);
  });

  /**
   * Environment test
   */
  it('students were registered to tasks', async () => {
    const students = await Student.find();
    const tasks = await Task.find();

    for (let i = 0; i < students.length; i++) {
      expect(students[i].registeredTask).toEqual(tasks[i]._id);
      expect(tasks[i].registeredStudent).toEqual(students[i]._id);
    }
  });

  /**
   * Unauthenticated Admin
   */
  it('unregisterAllStudents() throws error', async () => {
    await expect(adminService.unregisterAllStudents(NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Mentor without Admin rights
   */
  it('unregisterAllStudents() throws error', async () => {
    await expect(adminService.unregisterAllStudents(NADMIN_REQ))
      .rejects.toThrow('You do not have admin rights!');
  });

  /**
   * Authenticated Admin
   */
  it('unregisterAllStudents() does not throw error', async () => {
    await expect(adminService.unregisterAllStudents(ADMIN_REQ))
      .resolves.not.toThrow();
  });

  /**
   * Authenticated Admin
   */
  it('unregisterAllStudents() works correctly', async () => {
    let expected = [];
    const students = await Student.find();
    const tasks = await Task.find();
    const actual = await adminService.unregisterAllStudents(ADMIN_REQ);
    const editedStudents = await Student.find();
    const editedTasks = await Task.find();

    // fill expected array
    for (let i = 0; i < students.length; i++) {
      const studentId = students[i]._id;
      const taskId = tasks[i]._id;
      expected.push({ studentId, taskId });
    }

    // unregisterAllStudents returns correct data
    expect(actual).toEqual(expected);

    // Students and Tasks were unregistered
    for (let i = 0; i < students.length; i++) {
      expect(editedStudents[i].registeredTask).toBeNull();
      expect(editedTasks[i].registeredStudent).toBeNull();
    }
  });

});
