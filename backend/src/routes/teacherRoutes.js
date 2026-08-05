const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/overview', dashboardController.getTeacherOverview);
router.get('/exams', dashboardController.getTeacherExams);
router.get('/exams/:examId/pass-fail', dashboardController.getTeacherPassFail);
router.get('/exams/:examId/score-distribution', dashboardController.getTeacherScoreDistribution);
router.get('/exams/:examId/attempts', dashboardController.getTeacherAttempts);

module.exports = router;
