const express = require('express');
const questionController = require('../controllers/questionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionId,
} = require('../middleware/validators/questionValidator');

const router = express.Router();

router.use(auth, authorize('teacher'));

// Create a question
router.post('/', validateCreateQuestion, questionController.create);

// List teacher's questions
router.get('/', questionController.getAll);

// Get single question
router.get('/:id', validateQuestionId, questionController.getById);

// Update a question
router.put('/:id', validateUpdateQuestion, questionController.update);

// Delete a question
router.delete('/:id', validateQuestionId, questionController.remove);

module.exports = router;
