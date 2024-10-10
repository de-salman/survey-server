const express = require("express");
const Survey = require("../models/Survey");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Create Survey
router.post("/create", async (req, res) => {
  const { title, questions, createdBy } = req.body;
  const newSurvey = new Survey({ title, questions, createdBy });
  await newSurvey.save();
  res.json({ message: "Survey created" });
});

// Endpoint to get all surveys
router.get("/all", async (req, res) => {
  try {
    const surveys = await Survey.find(); // Fetch all surveys
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: "Error fetching surveys", error });
  }
});

// Submit Response
router.post("/:id/response", async (req, res) => {
  const { answers } = req.body;
  const surveyId = req.params.id;

  // Get the user ID from the token stored in local storage (make sure to extract it correctly)
  const token = req.headers.authorization?.split(" ")[1]; // Assuming the token is passed in the Authorization header

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, "JWT_SECRET"); // Use your secret key heredecoded
    userId = decoded.id; // Assuming the user ID is stored in the token
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }

  const survey = await Survey.findById(surveyId);
  if (!survey) {
    return res.status(404).json({ message: "Survey not found" });
  }

  // Check if the user has already submitted a response
  const existingResponse =
    survey.responses && Array.isArray(survey.responses)
      ? survey.responses.find(
          (response) => response.userId.toString() === userId
        )
      : null;
  if (existingResponse) {
    return res
      .status(400)
      .json({ message: "You have already submitted a response." });
  }

  // If not, push the new response
  survey.questions.forEach((question, index) => {
    question.responses.push({
      userId: userId,
      selectedOptionIndex: answers[index], // Store the selected option index
    });
  });
  await survey.save();
  res.json({ message: "Response submitted" });
});

// Get Survey Results
router.get("/:id/results", async (req, res) => {
  const survey = await Survey.findById(req.params.id);

  if (!survey) {
    return res.status(404).json({ message: "Survey not found" });
  }

  res.json(survey);
});

// Get Survey Questions (for filling out the survey)
router.get("/:id", async (req, res) => {
  const survey = await Survey.findById(req.params.id, {
    title: 1,
    questions: 1,
  });

  if (!survey) {
    return res.status(404).json({ message: "Survey not found" });
  }

  res.json(survey);
});

module.exports = router;
