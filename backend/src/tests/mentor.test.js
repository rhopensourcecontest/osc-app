require('./db-handler');

const mongoose = require('mongoose');
const mentorService = require('../graphql/resolvers/mentors');
const Mentor = require('../models/mentor');
const Task = require('../models/task');
const Student = require('../models/student');

const { MENTORS, NEX_ARGS, EX_ARGS } = require('./test-data/mentor');
const { STUDENTS } = require('./test-data/student');
const { TASKS } = require('./test-data/task');

/**
 * Add predefined Mentors before each test
 */
beforeEach(async () => {
  for (m of MENTORS) {
    const mentor = new Mentor(m);
    await mentor.save();
  }
});

/**
 * Mentor test suite.
 */
describe('mentor', () => {

  /**
   * Environment test
   */
  it('Mentors were added to db', async () => {
    expect((await Mentor.find()).length).toBe(MENTORS.length);
  });

  it('mentors() does not return null', async () => {
    await expect(mentorService.mentors()).not.toBeNull();
  });

  it('mentors() returns all Mentors', async () => {
    expect((await mentorService.mentors()).length)
      .toBe((await Mentor.find()).length);
  });

  it('mentors() returns correct data', async () => {
    const response = await mentorService.mentors();
    const expected = await Mentor.find();

    expect(response).not.toEqual(expected);
    expect(response.length).toBe(expected.length);

    for (let i = 0; i < expected.length; i++) {
      expect(response[i]._id).not.toBeNull();
      expect(response[i].email).toBe(expected[i].email);
      expect(response[i].uid).toBe('*restricted*');
      expect(response[i].isVerified).toBe(expected[i].isVerified);
      expect(response[i].isAdmin).toBe(expected[i].isAdmin);
      // array of bound tasks
      expect(response[i].createdTasks).not.toBeNull();
    }
  });

  /**
   * Creation of non-existing Mentor
   */
  it('createMentor() does not throw error', async () => {
    await expect(mentorService.createMentor(NEX_ARGS))
      .resolves.not.toThrow();
  });

  /**
   * Creation of non-existing Mentor
   */
  it('Mentor is created correctly', async () => {
    const mentor = await mentorService.createMentor(NEX_ARGS);

    expect(mentor._id).not.toBeNull();
    expect(mentor.email).toBe(NEX_ARGS.mentorInput.email);
    expect(mentor.uid).toBe('*restricted*');
    expect(mentor.isVerified).toBe(false);
    expect(mentor.isAdmin).toBe(false);
    expect(mentor.createdTasks).not.toBeNull();
    expect(mentor.createdTasks.length).toBe(0);
  });

  /**
   * Attempt to create Mentor who already exists
   */
  it('createMentor() throws error', async () => {
    await expect(mentorService.createMentor(EX_ARGS))
      .rejects.toThrow(
        `Mentor with email ${EX_ARGS.mentorInput.email} already exists.`
      );
  });

  /**
   * Creation of non-existing Mentor
   */
  it('createMentor() increased Mentor count', async () => {
    expect((await Mentor.find()).length).toBe(MENTORS.length);
    await mentorService.createMentor(NEX_ARGS);
    expect((await Mentor.find()).length).toBe(MENTORS.length + 1);
  });

  it('studentEmails() are empty', async () => {
    const id = (await Mentor.findOne())._id;
    expect(await mentorService.studentEmails({ mentorId: id })).not.toBeNull();
    expect(await mentorService.studentEmails({ mentorId: id })).toEqual([]);
  });

  it('studentEmails() works correctly', async () => {
    const mentors = await Mentor.find();
    const targetMentor = await Mentor.findOne();
    var expectedEmails = [];

    for (let i = 0; i < STUDENTS.length; i++) {
      let task = new Task(TASKS[i]);
      let student = new Student(STUDENTS[i]);
      let mentor = await Mentor.findById(mentors[i]._id);
      // fill expectedEmails
      if (mentor._id.toString() === targetMentor._id.toString()) {
        expectedEmails.push(student.email);
      }
      mentor.createdTasks.push(task._id);
      student.registeredTask = task._id;
      task.registeredStudent = student._id;
      task.creator = mentor._id;

      await mentor.save();
      await student.save();
      await task.save();
    }

    const response = await mentorService.studentEmails({
      mentorId: targetMentor._id
    });

    expect(response.length).toBe(1);
    expect(expectedEmails.length).toBe(1);
    expect(response).toEqual(expectedEmails);
  });

  it('allMentorEmails() works correctly', async () => {
    let expectedEmails = [];
    for (s of MENTORS) { expectedEmails.push(s.email); }
    const response = await mentorService.allMentorEmails();

    expect(response).toEqual(expectedEmails);
    expect(response.length).toEqual(expectedEmails.length);
  });

});
