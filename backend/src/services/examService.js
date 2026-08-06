const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
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
    .sort({ createdAt: -1 })
    .lean();
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
    .sort({ availableFrom: -1 })
    .lean();
};

/*
 *  Get a single exam by ID.
 *  For teachers: includes full question pool.
 *  For students: excludes question pool and correct answers.
 *  returns {Object} The exam document.
*/
const getById = async (examId, role, userId) => {
  let query = Exam.findById(examId).lean();

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

/*
 *  Update exam details (schedule and question pool)
 *  Validates if students have started it and runs mongoose validations on save.
 *  returns {Object} The updated exam document.
*/
const update = async (examId, teacherId, data) => {
  const exam = await Exam.findById(examId);

  if (!exam) {
    throw new AppError('Exam not found.', 404);
  }

  if (exam.teacherId.toString() !== teacherId.toString()) {
    throw new AppError('Access denied. This exam does not belong to you.', 403);
  }

  // Submissions Lock Check
  const attemptExists = await Attempt.exists({ examId });
  if (attemptExists) {
    // If students have started, only allow extending time (availableTo)
    if (
      data.questionPool !== undefined ||
      data.questionsToAsk !== undefined ||
      data.availableFrom !== undefined ||
      data.durationInMinutes !== undefined
    ) {
      throw new AppError(
        'Cannot update question pool or schedule because students have already started this exam. Only extending the end date (availableTo) is allowed.',
        400
      );
    }
  }

  // Update question pool if provided
  if (data.questionPool) {
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
    exam.questionPool = data.questionPool;
  }

  // Update scalar fields
  if (data.availableFrom !== undefined) exam.availableFrom = data.availableFrom;
  if (data.availableTo !== undefined) exam.availableTo = data.availableTo;
  if (data.durationInMinutes !== undefined) exam.durationInMinutes = data.durationInMinutes;
  if (data.questionsToAsk !== undefined) exam.questionsToAsk = data.questionsToAsk;

  // Pool Size Validation check before save
  if (exam.questionsToAsk > exam.questionPool.length) {
    throw new AppError(
      'Questions to ask cannot exceed the number of questions in the pool',
      400
    );
  }

  await exam.save();
  return exam;
};

/*
 *  Get exam participation stats.
 *  returns {Object} taken and notTaken lists.
*/
const getStats = async (examId, teacherId) => {
  const exam = await Exam.findById(examId);
  if (!exam) throw new AppError('Exam not found', 404);
  if (exam.teacherId.toString() !== teacherId.toString()) throw new AppError('Access denied', 403);

  const attempts = await Attempt.find({ examId }).populate('studentId', 'name email');
  const eligibleStudents = await User.find({ role: 'student', specialization: exam.specialization, level: exam.level }, 'name email');

  const takenStudentIds = attempts.map(a => (a.studentId ? a.studentId._id.toString() : ''));
  const notTaken = eligibleStudents.filter(s => !takenStudentIds.includes(s._id.toString()));

  const taken = attempts.filter(a => a.studentId).map(a => ({
    student: a.studentId,
    status: a.status,
    score: a.score,
    startTime: a.startTime
  }));

  return { taken, notTaken, totalEligible: eligibleStudents.length };
};

/*
 *  Delete an exam.
 */
const deleteExam = async (examId, teacherId) => {
  const exam = await Exam.findById(examId);
  if (!exam) throw new AppError('Exam not found', 404);
  if (exam.teacherId.toString() !== teacherId.toString()) throw new AppError('Access denied', 403);

  const attemptExists = await Attempt.exists({ examId });
  if (attemptExists) {
    throw new AppError('Cannot delete exam because students have already started it.', 400);
  }

  await Exam.deleteOne({ _id: examId });
};

module.exports = { create, getTeacherExams, getStudentExams, getById, update, getStats, deleteExam };

