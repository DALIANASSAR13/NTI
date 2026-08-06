const examService = require('../services/examService');

/*
* Create a new exam
* POST api/exams
* (Teacher only)
*/
const create = async (req, res) => {
  const exam = await examService.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: exam,
  });
};

/**
 *   List exams (role-aware)
 *          - Teachers: see their own exams
 *          - Students: see exams matching their specialization & level
 *   GET /api/exams
 *   (Both roles)
 */
const list = async (req, res) => {
  let exams;

  if (req.user.role === 'teacher') {
    exams = await examService.getTeacherExams(req.user.id);
  } else {
    // Student filter by specialization + level
    exams = await examService.getStudentExams(
      req.user.specialization,
      req.user.level
    );
  }

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams,
  });
};

/**
 *   Get a single exam by ID
 *   GET /api/exams/:id
 *   (Both roles)
 */
const getById = async (req, res) => {
  const exam = await examService.getById(
    req.params.id,
    req.user.role,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: exam,
  });
};

/**
 *   Update exam details (schedule and question pool)
 *   PATCH /api/exams/:id
 *   (Teacher only)
 */
const update = async (req, res) => {
  const exam = await examService.update(req.params.id, req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Exam updated successfully',
    data: exam,
  });
};

/**
 *   Get exam stats
 *   GET /api/exams/:id/stats
 *   (Teacher only)
 */
const getStats = async (req, res) => {
  const stats = await examService.getStats(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    data: stats,
  });
};

/**
 *   Delete exam
 *   DELETE /api/exams/:id
 *   (Teacher only)
 */
const deleteExam = async (req, res) => {
  await examService.deleteExam(req.params.id, req.user.id);
  res.status(200).json({
    success: true,
    message: 'Exam deleted successfully'
  });
};

module.exports = { create, list, getById, update, getStats, deleteExam };
