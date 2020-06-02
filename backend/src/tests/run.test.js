require('./db-handler');

const mongoose = require('mongoose');
const runService = require('../graphql/resolvers/runs');
const Mentor = require('../models/mentor');
const Student = require('../models/student');
const Run = require('../models/run');

const { STUDENTS, AUTH_S_REQ } = require('./test-data/student');
const { MENTORS, NAUTH_REQ, NADMIN_REQ, ADMIN_REQ } = require('./test-data/mentor');

/**
 * Add predefined Students and Mentors.
 */
beforeEach(async () => {
  for (let i = 0; i < STUDENTS.length; i++) {
    await new Student(STUDENTS[i]).save();
    await new Mentor(MENTORS[i]).save();
  }
});

/**
 * Admin test suite.
 */
describe('run', () => {

  /**
   * Environment test
   */
  it('Testing data was added to db', async () => {
    expect((await Student.find()).length).toBe(STUDENTS.length);
    expect((await Mentor.find()).length).toBe(MENTORS.length);
  });

  /**
   * Environment test
   */
  it('there are mentors with and without admin rights', async () => {
    const mentors = await Mentor.find();
    let foundAdmin = false, foundNAdmin = false;

    for (let i = 0; i < mentors.length; i++) {
      if (mentors[i].isAdmin) { foundAdmin = true; }
      if (!mentors[i].isAdmin) { foundNAdmin = true; }
    }
    expect(foundAdmin).toBe(true);
    expect(foundNAdmin).toBe(true);
  });

  /**
   * Unauthenticated Admin
   */
  it('setRun() throws error', async () => {
    await expect(runService.setRun({}, NAUTH_REQ))
      .rejects.toThrow('Unauthenticated!');
  });

  /**
   * Authenticated Mentor without Admin rights
   */
  it('setRun() throws error', async () => {
    await expect(runService.setRun({}, NADMIN_REQ))
      .rejects.toThrow('You do not have admin rights!');
  });

  /**
   * Authenticated Student
   */
  it('setRun() throws error', async () => {
    await expect(runService.setRun({}, AUTH_S_REQ))
      .rejects.toThrow('You do not have admin rights!');
  });

  /**
   * Authenticated Admin
   */
  it('setRun() does not throw error', async () => {
    const args = {
      runInput: { title: "Spring 2020", deadline: new Date().toISOString() }
    };
    await expect(runService.setRun(args, ADMIN_REQ))
      .resolves.not.toThrow();
  });

  /**
   * Authenticated Admin
   */
  it('setRun() creates first run correctly', async () => {
    expect((await Run.find()).length).toBe(0);
    const args = {
      runInput: { title: "Spring 2020", deadline: new Date().toISOString() }
    };
    const result = await runService.setRun(args, ADMIN_REQ);

    // check that run count changed
    expect((await Run.find()).length).toBe(1);
    expect(result.title).toEqual(args.runInput.title);
    expect(result.deadline).toEqual(args.runInput.deadline);
  });

  /**
   * Authenticated Admin
   */
  it('setRun() with existing run works correctly', async () => {
    expect((await Run.find()).length).toBe(0);

    // add initial run
    const existingRun = await new Run({
      title: "Autumn 2019", deadline: new Date().toISOString()
    }).save();
    expect((await Run.find()).length).toBe(1);
    const args = {
      runInput: { title: "Spring 2020", deadline: new Date().toISOString() }
    };
    const result = await runService.setRun(args, ADMIN_REQ);

    // updatedAt is changed, therefore have to replace it
    expect(result).toEqual({
      ...existingRun._doc,
      title: args.runInput.title,
      deadline: args.runInput.deadline,
      updatedAt: result.updatedAt
    });

    // check that run count did not change
    expect((await Run.find()).length).toBe(1);
  });

});
