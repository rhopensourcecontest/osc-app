require('./db-handler');

const mongoose = require('mongoose');
const adminService = require('../graphql/resolvers/admins');
const Task = require('../models/task');
const Student = require('../models/student');
const Mentor = require('../models/mentor');

const { STUDENTS } = require('./test-data/student');
const { TASKS } = require('./test-data/task');
const { MENTORS, NAUTH_REQ, NADMIN_REQ, ADMIN_REQ } = require('./test-data/mentor');

/**
 * Add predefined Students, Tasks and Mentors.
 * Register Students to Tasks.
 */
beforeEach(async () => {
  for (let i = 0; i < STUDENTS.length; i++) {
    let task = new Task(TASKS[i]);
    let student = new Student(STUDENTS[i]);
    await new Mentor(MENTORS[i]).save();
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
    await expect(adminService.unregisterAllStudents({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Mentor without Admin rights
   */
  it('unregisterAllStudents() throws error', async () => {
    await expect(adminService.unregisterAllStudents({}, NADMIN_REQ))
      .rejects.toThrow('You do not have admin rights!');
  });

  /**
   * Authenticated Admin
   */
  it('unregisterAllStudents() does not throw error', async () => {
    await expect(adminService.unregisterAllStudents({}, ADMIN_REQ))
      .resolves.not.toThrow();
  });

  /**
   * Authenticated Admin
   */
  it('unregisterAllStudents() works correctly', async () => {
    let expected = [];
    const students = await Student.find();
    const tasks = await Task.find();
    const actual = await adminService.unregisterAllStudents({}, ADMIN_REQ);
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

  // ------------------------------------------------------------------------ \\

  const CHANGE_RIGHTS_ARGS = {
    mentorId: mongoose.Types.ObjectId(),
    isVerified: true,
    isAdmin: true
  };

  /**
   * Authenticated Admin changing rights
   */
  it('changeMentorRights() does not throw error', async () => {
    const mentor = await Mentor.findOne({ isVerified: false, isAdmin: false });
    const args = { ...CHANGE_RIGHTS_ARGS, mentorId: mentor._id };
    await expect(adminService.changeMentorRights(args, ADMIN_REQ))
      .resolves.not.toThrow();
  });

  /**
   * Authenticated Mentor without Admin rights attempting to change rights
   */
  it('changeMentorRights() throws error', async () => {
    const mentor = await Mentor.findOne({ isVerified: false, isAdmin: false });
    await expect(adminService.changeMentorRights(CHANGE_RIGHTS_ARGS, NADMIN_REQ))
      .rejects.toThrow('You do not have Admin rights!');
  });

  /**
   * Unathenticated
   */
  it('changeMentorRights() throws error', async () => {
    const mentor = await Mentor.findOne({ isVerified: false, isAdmin: false });
    await expect(adminService.changeMentorRights(CHANGE_RIGHTS_ARGS, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Admin
   */
  it('changeMentorRights() works correctly', async () => {
    const filter = { isVerified: false, isAdmin: false };
    const mentor = await Mentor.findOne(filter);
    expect(mentor.isVerified).toBe(filter.isVerified);
    expect(mentor.isAdmin).toBe(filter.isAdmin);
    const args = {
      mentorId: mentor._id,
      isVerified: true,
      isAdmin: mentor.isAdmin
    }
    const resultMentor = await adminService.changeMentorRights(args, ADMIN_REQ);

    // changeMentorRights returns correct data
    expect(resultMentor.isAdmin).toBe(args.isAdmin);
    expect(resultMentor.isVerified).toBe(args.isVerified);
    expect(resultMentor._id).toEqual(args.mentorId);
    expect(resultMentor.uid).toBe('*restricted*');
  });

});
