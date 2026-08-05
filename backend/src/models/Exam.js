const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Teacher ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'Level is required'],
      min: [1, 'Level must be between 1 and 4'],
      max: [4, 'Level must be between 1 and 4'],
    },
    availableFrom: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    availableTo: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (val) {
          return val > this.availableFrom;
        },
        message: 'End date must be after the start date',
      },
    },
    durationInMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [300, 'Duration cannot exceed 300 minutes'],
    },
    questionPool: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    questionsToAsk: {
      type: Number,
      required: [true, 'Number of questions to ask is required'],
      min: [1, 'Must ask at least 1 question'],
      validate: {
        validator: function (val) {
          return val <= this.questionPool.length;
        },
        message:
          'Questions to ask cannot exceed the number of questions in the pool',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for student exam discovery queries
examSchema.index({ specialization: 1, level: 1, availableFrom: 1, availableTo: 1 });

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
