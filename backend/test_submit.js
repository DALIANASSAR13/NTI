const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./src/models/User.js');
const Exam = require('./src/models/Exam.js');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/nti-exam-platform');
  const user = await User.findOne({ role: 'student' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
  
  const exam = await Exam.findOne();
  
  const startRes = await fetch('http://localhost:5000/api/attempts/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ examId: exam._id })
  });
  const startData = await startRes.json();
  
  const attemptId = startData.data.attemptId;
  const questions = startData.data.questions;
  
  const answers = questions.map((q, i) => ({
    questionId: q._id || q.question,
    selectedOption: (i).toString()
  }));
  
  const submitRes = await fetch('http://localhost:5000/api/attempts/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ attemptId, answers })
  });
  const submitData = await submitRes.json();
  console.log("Submit Response:", submitData);
  process.exit();
}
run();
