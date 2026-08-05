const Question = require('../models/Question');
const Exam = require('../models/Exam');
const AppError = require('../utils/AppError');

/*
 *  Create a new question.
 *  returns  Object The created question document.
*/
const create = async (teacherId, data) => {
  const question = await Question.create({
    ...data,
    teacherId,
  });
  return question;
};

/*
 *  Get all questions belonging to a teacher.
 *  returns  Array of question documents.
*/
const getAll = async (teacherId) => {
  return Question.find({ teacherId }).sort({ createdAt: -1 });
};

/*
 *  Get a single question by ID (with ownership verification).
 *  returns  Object The question document.
*/
const getById = async (teacherId, questionId) => {
  const question = await Question.findOne({
    _id: questionId,
    teacherId,
  });

  if (!question) {
    throw new AppError('Question not found or access denied.', 404);
  }

  return question;
};

/*
 *  Update a question (with ownership verification).
 *  returns  Object The updated question document.
*/
const update = async (teacherId, questionId, data) => {
  const question = await Question.findOne({
    _id: questionId,
    teacherId,
  });

  if (!question) {
    throw new AppError('Question not found or access denied.', 404);
  }

  // Update allowed fields
  const allowedFields = ['text', 'options', 'correctAnswer'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      question[field] = data[field];
    }
  });

  await question.save(); // Triggers validation
  return question;
};

/*
 *  Delete a question (with ownership verification).
 *  Prevents deletion if the question is used in any exam's question pool.
*/
const remove = async (teacherId, questionId) => {
  const question = await Question.findOne({
    _id: questionId,
    teacherId,
  });

  if (!question) {
    throw new AppError('Question not found or access denied.', 404);
  }

  // Check if question is used in any exam
  const examUsingQuestion = await Exam.findOne({
    questionPool: questionId,
  });

  if (examUsingQuestion) {
    throw new AppError(
      `Cannot delete this question. It is used in exam: "${examUsingQuestion.title}". Remove it from the exam first.`,
      400
    );
  }

  await Question.deleteOne({ _id: questionId });
};

module.exports = { create, getAll, getById, update, remove };
