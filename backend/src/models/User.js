const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    age: { type: Number, min: 13, max: 70 },
    cycleRegularity: {
      type: String,
      enum: ["very_regular", "regular", "slightly_irregular", "highly_irregular", "no_cycles"],
    },
    flow: {
      type: String,
      enum: ["light", "moderate", "heavy", "very_heavy"],
    },
    averageCycleLength: { type: Number, min: 15, max: 90 },
    lifestyle: {
      sleepHours: { type: Number, min: 0, max: 24 },
      stressLevel: { type: Number, min: 1, max: 5 },
      exerciseFrequency: {
        type: String,
        enum: ["none", "light", "moderate", "active"],
      },
    },
    dietType: {
      type: String,
      enum: ["omnivore", "vegetarian", "vegan", "other"],
    },
    weightChange: {
      type: String,
      enum: ["stable", "gained", "lost"],
    },
    recentEvents: {
      pregnancy: { type: Boolean, default: false },
      medicationChange: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
