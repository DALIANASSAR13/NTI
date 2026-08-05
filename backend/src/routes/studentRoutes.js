const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/overview', dashboardController.getStudentOverview);
router.get('/exams', dashboardController.getStudentExams);
router.get('/progress', dashboardController.getStudentProgress);

module.exports = router;
