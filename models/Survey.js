const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema],
  responses: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      selectedOptionIndex: { type: Number, required: true },
    },
  ],
});

const surveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Survey", surveySchema);
