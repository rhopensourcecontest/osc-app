require('./db-handler');

const mongoose = require('mongoose');
const studentService = require('../graphql/resolvers/students');
const Student = require('../models/student');

const { STUDENTS, EX_ARGS, NEX_ARGS } = require('./test-data/student');

/**
 * Add predefined Students before each test
 */
beforeEach(async () => {
  for (s of STUDENTS) {
    const student = new Student(s);
    await student.save();
  }
});

/**
 * Student test suite.
 */
describe('students', () => {

  /**
   * Environment test
   */
  it('Students were added to db', async () => {
    expect((await Student.find()).length).toBe(STUDENTS.length);
  });

  it('students() does not return null', async () => {
    await expect(studentService.students()).not.toBeNull();
  });

  it('students() returns all Students', async () => {
    expect((await studentService.students()).length)
      .toBe((await Student.find()).length);
  });

  it('students() returns correct data', async () => {
    const response = await studentService.students();
    const students = await Student.find();

    expect(response).not.toEqual(students);
    expect(response.length).toBe(students.length);

    for (let i = 0; i < students.length; i++) {
      expect(response[i]._id).not.toBeNull();
      expect(response[i]._id).toEqual(students[i]._id);
      expect(response[i].email).toBe(students[i].email);
      expect(response[i].uid).toBe('*restricted*');
      // bound function -> not null
      expect(response[i].registeredTask).not.toBeNull();
    }
  });

  /**
   * Creation of non-existing Student
   */
  it('createStudent() does not throw error', async () => {
    await expect(studentService.createStudent(NEX_ARGS))
      .resolves.not.toThrow();
  });

  /**
   * Creation of non-existing Student
   */
  it('createStudent() works correctly', async () => {
    const student = await studentService.createStudent(NEX_ARGS);

    expect(student._id).not.toBeNull();
    expect(student.email).toBe(NEX_ARGS.studentInput.email);
    expect(student.uid).toBe('*restricted*');
    expect(student.registeredTask).toBeNull();
  });

  /**
   * Attempt to create Student who already exists
   */
  it('createStudent() throws error', async () => {
    await expect(studentService.createStudent(EX_ARGS))
      .rejects.toThrow(
        `Student with email ${EX_ARGS.studentInput.email} already exists.`
      );
  });

  /**
   * Creation of non-existing Student
   */
  it('createStudent() increased Student count', async () => {
    expect((await Student.find()).length).toBe(STUDENTS.length);
    await studentService.createStudent(NEX_ARGS);
    expect((await Student.find()).length).toBe(STUDENTS.length + 1);
  });

  it('allStudentEmails() returns correct data', async () => {
    let expected = [];
    for (s of STUDENTS) { expected.push(s.email); }
    const actual = await studentService.allStudentEmails();

    expect(actual).toEqual(expected);
    expect(actual.length).toEqual(expected.length);
  });

});
