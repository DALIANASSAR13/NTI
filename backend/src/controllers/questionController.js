const questionService = require('../services/questionService');

/*
*    Create a new question
*    POST /api/questions
*    (Teacher only)
*/
const create = async (req, res) => {
  const question = await questionService.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: question,
  });
};

/*
*    Get all questions for the authenticated teacher
*    GET /api/questions
*    (Teacher only)
*/
const getAll = async (req, res) => {
  const questions = await questionService.getAll(req.user.id);

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
};

/*
*    Get a single question by ID
*    GET /api/questions/:id
*    (Teacher only)
*/
const getById = async (req, res) => {
  const question = await questionService.getById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: question,
  });
};

/*
*    Update a question
*    PUT /api/questions/:id
*    (Teacher only)
*/
const update = async (req, res) => {
  const question = await questionService.update(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Question updated successfully',
    data: question,
  });
};

/*
*    Delete a question
*    DELETE /api/questions/:id
*    (Teacher only)
*/
const remove = async (req, res) => {
  await questionService.remove(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: 'Question deleted successfully',
  });
};

module.exports = { create, getAll, getById, update, remove };
