const express = require('express');
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  validateCreateExam,
  validateExamId,
} = require('../middleware/validators/examValidator');

const router = express.Router();

router.use(auth);

// Teacher only 
router.post(
  '/',
  authorize('teacher'),
  validateCreateExam,
  examController.create
);

// List exams
router.get(
  '/',
  authorize('teacher', 'student'),
  examController.list
);

// Get single exam
router.get(
  '/:id',
  authorize('teacher', 'student'),
  validateExamId,
  examController.getById
);

module.exports = router;
