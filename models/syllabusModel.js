const mongoose = require('mongoose');

const syllabusProgressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  subject: {
    type: String,
    enum: ['Chemistry', 'Physics', 'Maths'],
    required: true,
  },
  division: {
    type: Number,
    enum: [11, 12],
    required: true,
  },
  chemistry11:{
    type:Number,
    default:0
  },
  physics11:{
    type:Number,
    default:0
  },
  maths:{
    type:Number,
    default:0
  },
  chemistry12:{
    type:Number,
    default:0
  },
  physics12:{
    type:Number,
    default:0
  },
  maths12:{
    type:Number,
    default:0
  },
  total:{
    type:Number,
    default:0
  },
  progress: [
    {
      unit: { type: String, required: true },
      theory: { type: Boolean, default: false },
      examples: { type: Boolean, default: false },
      questions: { type: Boolean, default: false },
      pyqs: { type: Boolean, default: false },
      test: { type: Boolean, default: false },
      revision1: { type: Boolean, default: false },
      revision2: { type: Boolean, default: false },
      _id:false
    }  ],
});

module.exports = mongoose.model('SyllabusProgress', syllabusProgressSchema);
