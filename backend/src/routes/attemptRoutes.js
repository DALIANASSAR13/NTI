const express = require('express');
const attemptController = require('../controllers/attemptController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const {
  validateStartAttempt,
  validateSubmitAttempt,
  validateAttemptId,
} = require('../middleware/validators/attemptValidator');

const router = express.Router();


router.use(auth, authorize('student'));

// Start or resume an exam
router.post('/start', validateStartAttempt, attemptController.startExam);

// Submit answers for grading
router.post('/submit', validateSubmitAttempt, attemptController.submitExam);

// List student's attempt history
router.get('/my-attempts', attemptController.getMyAttempts);

// Get result for a completed attempt
router.get('/:id/result', validateAttemptId, attemptController.getResult);

module.exports = router;
