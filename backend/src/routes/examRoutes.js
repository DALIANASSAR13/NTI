const express = require('express');
const examController = require('../controllers/examController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  validateCreateExam,
  validateExamId,
  validateUpdateExam,
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

// Get exam stats
router.get(
  '/:id/stats',
  authorize('teacher'),
  validateExamId,
  examController.getStats
);

// Update exam
router.patch(
  '/:id',
  authorize('teacher'),
  validateUpdateExam,
  examController.update
);

// Delete exam
router.delete(
  '/:id',
  authorize('teacher'),
  validateExamId,
  examController.deleteExam
);

module.exports = router;
