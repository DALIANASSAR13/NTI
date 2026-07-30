const attemptService = require('../services/attemptService');

/**
 * Start or resume an exam attempt
 * POST /api/attempts/start
 * (Student only)
 */
const startExam = async (req, res) => {
  const { examId } = req.body;

  const result = await attemptService.startExam(req.user.id, examId);

  res.status(200).json({
    success: true,
    message: result.attempt.studentAnswers?.length
      ? 'Resuming existing attempt'
      : 'Exam started successfully',
    data: {
      attemptId: result.attempt._id,
      examId: result.attempt.examId,
      status: result.attempt.status,
      startTime: result.attempt.startTime,
      remainingTimeMs: result.remainingTimeMs,
      questions: result.questions,
    },
  });
};

/*
* Submit exam answers for grading
* POST /api/attempts/submit
* (Student only)
*/
const submitExam = async (req, res) => {
  const { attemptId, answers } = req.body;

  const result = await attemptService.submitExam(
    req.user.id,
    attemptId,
    answers
  );

  res.status(200).json({
    success: true,
    message: 'Exam submitted and graded successfully',
    data: result,
  });
};

/*
* Get all attempts for the authenticated student
* GET /api/attempts/my-attempts
* (Student only)
*/
const getMyAttempts = async (req, res) => {
  const attempts = await attemptService.getStudentAttempts(req.user.id);

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts,
  });
};

/*
* Get detailed result for a completed attempt
* GET /api/attempts/:id/result
* (Student only)
*/
const getResult = async (req, res) => {
  const result = await attemptService.getAttemptResult(
    req.user.id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

module.exports = { startExam, submitExam, getMyAttempts, getResult };
