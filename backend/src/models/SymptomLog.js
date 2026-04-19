const mongoose = require("mongoose");

const severityMap = {
  none: 0,
  rarely: 1,
  mild: 1,
  sometimes: 2,
  moderate: 3,
  often: 4,
  severe: 4,
  always: 5,
  // cycle-specific
  very_regular: 0,
  slightly_irregular: 2,
  highly_irregular: 4,
  irregular: 3,
  amenorrhea: 5,
  // weight
  stable: 0,
  slight_gain: 2,
  moderate_gain: 3,
  significant_gain: 4,
  weight_loss: 2,
};

const durationMap = {
  // numeric values passed through
};

function normalizeSeverity(value) {
  if (typeof value === "number") return Math.max(0, Math.min(5, value));
  const mapped = severityMap[String(value).toLowerCase().trim()];
  return typeof mapped === "number" ? mapped : 2;
}

function normalizeDuration(value) {
  if (typeof value === "number") return Math.max(1, Math.min(260, value));
  return 4;
}

const symptomEntrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    severity: { type: String, default: "sometimes" },
    frequency: { type: String, default: "weekly" },
    durationWeeks: { type: Number, min: 1, max: 260, default: 4 },
    worsening: { type: Boolean, default: false },
  },
  { _id: false }
);

const symptomLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loggedAt: { type: Date, default: Date.now, index: true },
    symptoms: {
      type: [symptomEntrySchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one symptom is required",
      },
    },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

symptomLogSchema.statics.normalizeSeverity = normalizeSeverity;
symptomLogSchema.statics.normalizeDuration = normalizeDuration;

module.exports = mongoose.model("SymptomLog", symptomLogSchema);
