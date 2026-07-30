const Exam = require('../models/Exam');
const Question = require('../models/Question');
const AppError = require('../utils/AppError');

/*
 *  Create a new exam.
 *  Validates that all question pool IDs belong to the teacher.
 *  returns  Object The created exam document.
*/
const create = async (teacherId, data) => {
  // Verify all questions in the pool belong to this teacher
  const questions = await Question.find({
    _id: { $in: data.questionPool },
    teacherId,
  });

  if (questions.length !== data.questionPool.length) {
    throw new AppError(
      'Some questions in the pool were not found or do not belong to you.',
      400
    );
  }

  const exam = await Exam.create({
    ...data,
    teacherId,
  });

  return exam;
};

/*
 *  Get all exams created by a specific teacher.
 *  returns  Array of exam documents.
*/
const getTeacherExams = async (teacherId) => {
  return Exam.find({ teacherId })
    .populate('questionPool', 'text options')
    .sort({ createdAt: -1 });
};

/*
 *  Get available exams for a student based on specialization and level.
 *  Only returns exams within their availability window.
 *  returns  Array of exam documents (without question details).
*/
const getStudentExams = async (specialization, level) => {
  const now = new Date();

  return Exam.find({
    specialization,
    level,
    availableFrom: { $lte: now },
    availableTo: { $gte: now },
  })
    .select('-questionPool') // Don't expose question pool to students
    .sort({ availableFrom: -1 });
};

/*
 *  Get a single exam by ID.
 *  For teachers: includes full question pool.
 *  For students: excludes question pool and correct answers.
 *  returns {Object} The exam document.
*/
const getById = async (examId, role, userId) => {
  let query = Exam.findById(examId);

  if (role === 'teacher') {
    // Teachers see full question details (including correct answers)
    // but only for their own exams
    query = query.populate('questionPool', 'text options correctAnswer');
  } else {
    // Students don't see the question pool at all from this endpoint
    query = query.select('-questionPool');
  }

  const exam = await query;

  if (!exam) {
    throw new AppError('Exam not found.', 404);
  }

  // Teachers can only view their own exams
  if (role === 'teacher' && exam.teacherId.toString() !== userId.toString()) {
    throw new AppError('Access denied. This exam does not belong to you.', 403);
  }

  return exam;
};

module.exports = { create, getTeacherExams, getStudentExams, getById };
