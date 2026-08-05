const Exam = require('../models/Exam');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const gradeStatus = (score) => (score >= 50 ? 'passed' : 'failed');

const getDefaultTeacher = async () => {
  const teacher = await User.findOne({ role: 'teacher' });
  if (!teacher) {
    throw new AppError('No teacher account exists in the backend.', 404);
  }
  return teacher;
};

const getDefaultStudent = async () => {
  const student = await User.findOne({ role: 'student' });
  if (!student) {
    throw new AppError('No student account exists in the backend.', 404);
  }
  return student;
};

const getTeacherOverview = async (req, res) => {
  const teacher = await getDefaultTeacher();

  const teacherExamIds = (await Exam.find({ teacherId: teacher._id }).select('_id')).map((exam) => exam._id);

  const attempts = await Attempt.find({ examId: { $in: teacherExamIds }, status: 'completed' });

  const uniqueStudents = new Set(attempts.map((a) => a.studentId.toString()));
  const totalStudentsAttempted = uniqueStudents.size;
  const averageScorePercentage = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length)
    : 0;

  res.status(200).json({
    totalExamsCreated: teacherExamIds.length,
    totalStudentsAttempted,
    averageScorePercentage,
  });
};

const getTeacherExams = async (req, res) => {
  const teacher = await getDefaultTeacher();
  const exams = await Exam.find({ teacherId: teacher._id }).select('title');

  res.status(200).json(exams.map((exam) => ({ id: exam._id.toString(), title: exam.title })));
};

const getTeacherPassFail = async (req, res) => {
  const teacher = await getDefaultTeacher();
  const examId = req.params.examId;

  const exam = await Exam.findOne({ _id: examId, teacherId: teacher._id });
  if (!exam) {
    throw new AppError('Exam not found for this teacher.', 404);
  }

  const attempts = await Attempt.find({ examId: exam._id, status: 'completed' });
  const passedCount = attempts.filter((attempt) => gradeStatus(attempt.score) === 'passed').length;
  const failedCount = attempts.filter((attempt) => gradeStatus(attempt.score) === 'failed').length;

  res.status(200).json({ passedCount, failedCount });
};

const getTeacherScoreDistribution = async (req, res) => {
  const teacher = await getDefaultTeacher();
  const examId = req.params.examId;

  const exam = await Exam.findOne({ _id: examId, teacherId: teacher._id });
  if (!exam) {
    throw new AppError('Exam not found for this teacher.', 404);
  }

  const attempts = await Attempt.find({ examId: exam._id, status: 'completed' });

  const buckets = [
    { label: '0-20', studentCount: 0 },
    { label: '21-40', studentCount: 0 },
    { label: '41-60', studentCount: 0 },
    { label: '61-80', studentCount: 0 },
    { label: '81-100', studentCount: 0 },
  ];

  attempts.forEach((attempt) => {
    const score = attempt.score ?? 0;
    if (score <= 20) buckets[0].studentCount += 1;
    else if (score <= 40) buckets[1].studentCount += 1;
    else if (score <= 60) buckets[2].studentCount += 1;
    else if (score <= 80) buckets[3].studentCount += 1;
    else buckets[4].studentCount += 1;
  });

  res.status(200).json(buckets);
};

const getTeacherAttempts = async (req, res) => {
  const teacher = await getDefaultTeacher();
  const examId = req.params.examId;
  const { search = '', sortBy = 'studentName', sortDir = 'asc' } = req.query;

  const exam = await Exam.findOne({ _id: examId, teacherId: teacher._id });
  if (!exam) {
    throw new AppError('Exam not found for this teacher.', 404);
  }

  const attempts = await Attempt.find({ examId: exam._id, status: 'completed' });
  const studentIds = attempts.map((attempt) => attempt.studentId);
  const students = await User.find({ _id: { $in: studentIds } }).select('name');
  const studentMap = new Map(students.map((student) => [student._id.toString(), student.name]));

  let rows = attempts.map((attempt) => {
    const studentName = studentMap.get(attempt.studentId.toString()) || 'Unknown Student';
    const grade = attempt.score >= 90 ? 'A' : attempt.score >= 80 ? 'B' : attempt.score >= 70 ? 'C' : attempt.score >= 60 ? 'D' : 'F';
    return {
      id: attempt._id.toString(),
      studentName,
      scorePercentage: attempt.score ?? 0,
      grade,
      submittedAt: attempt.updatedAt ? attempt.updatedAt.toISOString() : attempt.createdAt.toISOString(),
      status: gradeStatus(attempt.score),
    };
  });

  if (search) {
    const term = search.toLowerCase();
    rows = rows.filter((row) => row.studentName.toLowerCase().includes(term));
  }

  rows.sort((a, b) => {
    const direction = sortDir === 'desc' ? -1 : 1;
    const aValue = a[sortBy] ?? '';
    const bValue = b[sortBy] ?? '';
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * direction;
    }
    return String(aValue).localeCompare(String(bValue)) * direction;
  });

  res.status(200).json(rows);
};

const getStudentOverview = async (req, res) => {
  const student = await getDefaultStudent();

  const completedAttempts = await Attempt.find({ studentId: student._id, status: 'completed' });
  const total = completedAttempts.length;
  const averageScorePercentage = total
    ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / total)
    : 0;

  res.status(200).json({
    averageScorePercentage,
    completedExamsCount: total,
  });
};

const getStudentExams = async (req, res) => {
  const student = await getDefaultStudent();

  const completedAttempts = await Attempt.find({ studentId: student._id, status: 'completed' }).populate('examId', 'title durationInMinutes');
  const completedExamIds = completedAttempts.map((attempt) => attempt.examId._id.toString());

  const upcomingExams = await Exam.find({
    specialization: student.specialization,
    level: student.level,
    availableFrom: { $gt: new Date() },
  })
    .select('title availableFrom durationInMinutes')
    .sort({ availableFrom: 1 });

  const completed = completedAttempts.map((attempt) => ({
    id: attempt.examId._id.toString(),
    title: attempt.examId.title,
    status: 'completed',
    scorePercentage: attempt.score ?? 0,
    durationMinutes: attempt.examId.durationInMinutes,
    scheduledAt: attempt.updatedAt ? attempt.updatedAt.toISOString() : undefined,
  }));

  const upcoming = upcomingExams
    .filter((exam) => !completedExamIds.includes(exam._id.toString()))
    .map((exam) => ({
      id: exam._id.toString(),
      title: exam.title,
      status: 'upcoming',
      scheduledAt: exam.availableFrom.toISOString(),
      durationMinutes: exam.durationInMinutes,
    }));

  res.status(200).json([...completed, ...upcoming]);
};

const getStudentProgress = async (req, res) => {
  const student = await getDefaultStudent();

  const completedAttempts = await Attempt.find({ studentId: student._id, status: 'completed' }).populate('examId', 'title');

  const progress = completedAttempts.map((attempt) => ({
    examTitle: attempt.examId?.title || 'Unknown Exam',
    scorePercentage: attempt.score ?? 0,
    date: attempt.updatedAt ? attempt.updatedAt.toISOString().split('T')[0] : attempt.createdAt.toISOString().split('T')[0],
  }));

  res.status(200).json(progress);
};

module.exports = {
  getTeacherOverview,
  getTeacherExams,
  getTeacherPassFail,
  getTeacherScoreDistribution,
  getTeacherAttempts,
  getStudentOverview,
  getStudentExams,
  getStudentProgress,
};
