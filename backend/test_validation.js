const { body, validationResult } = require('express-validator');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/test', [
  body('answers.*.selectedOption')
    .notEmpty().withMessage('not empty')
    .isString().withMessage('must be a string')
], (req, res) => {
  res.json(validationResult(req));
});

const request = require('supertest');

async function run() {
  const res4 = await request(app).post('/test').send({
    answers: [{ questionId: "123" }]
  });
  console.log("Undefined result:", JSON.stringify(res4.body, null, 2));
}

run();
