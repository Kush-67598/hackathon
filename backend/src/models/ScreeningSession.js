const mongoose = require("mongoose");

const screeningSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    inputSnapshot: {
      profile: { type: Object, required: true },
      symptoms: { type: Array, default: [] },
      physical_symptoms: { type: Array, default: [] },
      emotional_symptoms: { type: Array, default: [] },
      behavioral_indicators: { type: Array, default: [] },
      labValues: { type: Object, default: {} },
    },
    output: {
      primary_tendency: { type: String, required: true },
      confidence: { type: Number, required: true },
      secondary_tendency: { type: String, required: true },
      secondary_confidence: { type: Number, required: true },
      minor_tendencies: { type: Array, default: [] },
      symptom_contributions: { type: Array, default: [] },
      confounding_flags: { type: Array, default: [] },
      lab_impact: { type: Array, default: [] },
      recommendations: { type: Array, default: [] },
      actionable_recommendations: { type: Array, default: [] },
      disclaimer: { type: String, required: true },
    },
    engineVersion: { type: String, default: "1.0.0" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ScreeningSession", screeningSessionSchema);
