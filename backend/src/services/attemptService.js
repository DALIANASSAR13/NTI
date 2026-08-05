const Attempt = require('../models/Attempt');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const AppError = require('../utils/AppError');

/*
*    shuffle to randomly select a subset from an array.
*    returns {Array} Randomly selected subset.
*/
const selectRandom = (array, count) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

/**
 * Strip correctAnswer from question objects.
 *  correctAnswer must NEVER reach the client.
 *  Array questions - Array of question documents.
 *  returns Array of Questions without correctAnswer.
 */
const stripCorrectAnswers = (questions) => {
  return questions.map((q) => {
    const obj = q.toObject ? q.toObject() : { ...q };
    delete obj.correctAnswer;
    return obj;
  });
};

/**
 * Start or resume an exam attempt.
 *
 * If the student already has an in-progress attempt for this exam,
 * return that attempt (persistent attempts / anti-cheating).
 *
 * Otherwise, randomly select questions and create a new attempt.
 *
 * returns {Object} { attempt, questions }
 */
const startExam = async (studentId, examId) => {
  // 1. Verify exam exists
  const exam = await Exam.findById(examId);
  if (!exam) {
    throw new AppError('Exam not found.', 404);
  }

  // 2. Check availability window
  const now = new Date();
  if (now < exam.availableFrom) {
    throw new AppError('This exam is not available yet.', 400);
  }
  if (now > exam.availableTo) {
    throw new AppError('This exam is no longer available.', 400);
  }

  // 3. Check for existing in-progress attempt (persistent attempts)
  const existingAttempt = await Attempt.findOne({
    studentId,
    examId,
    status: 'in-progress',
  }).populate('assignedQuestions', 'text options');

  if (existingAttempt) {
    // Check if the existing attempt has timed out
    const elapsedMs = now - existingAttempt.startTime;
    const elapsedMinutes = elapsedMs / 60000;

    if (elapsedMinutes > exam.durationInMinutes) {
      // Auto-complete the timed-out attempt with score 0 (no answers submitted)
      existingAttempt.status = 'completed';
      existingAttempt.score = 0;
      await existingAttempt.save();

      // Don't allow restarting — they missed their window
      throw new AppError(
        'Your previous attempt has expired. The exam time limit has passed.',
        400
      );
    }

    // Return existing in-progress attempt with stripped questions
    return {
      attempt: existingAttempt,
      questions: stripCorrectAnswers(existingAttempt.assignedQuestions),
      remainingTimeMs:
        exam.durationInMinutes * 60000 - elapsedMs,
    };
  }

  // 4. Check if student already completed this exam
  const completedAttempt = await Attempt.findOne({
    studentId,
    examId,
    status: 'completed',
  });

  if (completedAttempt) {
    throw new AppError('You have already completed this exam.', 400);
  }

  // 5. Randomly select questions from the pool (shuffle)
  const selectedQuestionIds = selectRandom(
    exam.questionPool,
    exam.questionsToAsk
  );

  // 6. Create new attempt
  const attempt = await Attempt.create({
    studentId,
    examId,
    assignedQuestions: selectedQuestionIds,
    startTime: new Date(),
  });

  // 7. Fetch the selected questions (without correctAnswer)
  const questions = await Question.find({
    _id: { $in: selectedQuestionIds },
  }).select('text options');

  return {
    attempt,
    questions: stripCorrectAnswers(questions),
    remainingTimeMs: exam.durationInMinutes * 60000,
  };
};

/**
 * Submit an exam attempt for server-side grading.
 *
 * Validates:
 * - Attempt ownership
 * - Attempt is still in-progress
 * - Server-side time validation (no trust in client timer)
 *
 * Grades by comparing submitted answers against database correctAnswers.
 *
 * Array answers - [{ questionId, selectedOption }]
 * returns Object { score, totalQuestions, correctCount, status }
 */
const submitExam = async (studentId, attemptId, answers) => {
  // 1. Find the attempt and verify ownership
  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId,
  }).populate('examId');

  if (!attempt) {
    throw new AppError('Attempt not found or access denied.', 404);
  }

  if (attempt.status === 'completed') {
    throw new AppError('This exam has already been submitted.', 400);
  }

  // 2. Server-side time validation
  const exam = attempt.examId;
  const elapsedMs = Date.now() - attempt.startTime.getTime();
  const elapsedMinutes = elapsedMs / 60000;
  const gracePeriodMinutes = 0.5; // 30-second grace period for network latency

  if (elapsedMinutes > exam.durationInMinutes + gracePeriodMinutes) {
    // Auto-grade with whatever was submitted or zero
    attempt.status = 'completed';
    attempt.score = 0;
    attempt.studentAnswers = [];
    await attempt.save();

    throw new AppError(
      'Time is up. Your exam has been auto-submitted with the answers received.',
      400
    );
  }

  // 3. Fetch the assigned questions with their correct answers from the database
  const questions = await Question.find({
    _id: { $in: attempt.assignedQuestions },
  });

  // Build a map of questionId
  const answerMap = new Map();
  questions.forEach((q) => {
    answerMap.set(q._id.toString(), q.correctAnswer);
  });

  // 4. Server-side grading
  let correctCount = 0;
  const totalQuestions = attempt.assignedQuestions.length;

  // Validate and grade each submitted answer
  const validatedAnswers = answers
    .filter((a) => answerMap.has(a.questionId)) // Only grade assigned questions
    .map((a) => {
      const correctAnswer = answerMap.get(a.questionId);
      if (a.selectedOption === correctAnswer) {
        correctCount++;
      }
      return {
        questionId: a.questionId,
        selectedOption: a.selectedOption,
      };
    });

  // Calculate score as percentage
  const score = Math.round((correctCount / totalQuestions) * 100);

  // 5. Update attempt
  attempt.studentAnswers = validatedAnswers;
  attempt.score = score;
  attempt.status = 'completed';
  await attempt.save();

  return {
    score,
    totalQuestions,
    correctCount,
    status: 'completed',
  };
};

/*
*  Get all attempts for a student.
* returns  Array of attempt documents with exam details.
*/
const getStudentAttempts = async (studentId) => {
  return Attempt.find({ studentId })
    .populate('examId', 'title specialization level durationInMinutes')
    .select('-assignedQuestions -studentAnswers')
    .sort({ createdAt: -1 });
};

/*
*  Get detailed result for a completed attempt.
* returns  Attempt with questions and student's answers.
*/
const getAttemptResult = async (studentId, attemptId) => {
  const attempt = await Attempt.findOne({
    _id: attemptId,
    studentId,
  })
    .populate('examId', 'title specialization level durationInMinutes')
    .populate('assignedQuestions', 'text options');

  if (!attempt) {
    throw new AppError('Attempt not found or access denied.', 404);
  }

  if (attempt.status !== 'completed') {
    throw new AppError(
      'Cannot view results for an in-progress attempt.',
      400
    );
  }

  // Strip correctAnswer from assigned questions
  const result = attempt.toObject();
  result.assignedQuestions = stripCorrectAnswers(attempt.assignedQuestions);

  return result;
};

module.exports = { startExam, submitExam, getStudentAttempts, getAttemptResult };
