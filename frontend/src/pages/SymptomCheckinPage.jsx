import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSymptomLog } from "../services/symptomApi";
import { useProfileStore } from "../stores/profileStore";
import { useSymptomStore } from "../stores/symptomStore";

const STEP_CONFIG = [
  {
    key: "physical_symptoms",
    title: "Step 1: Physical Symptoms",
    subtitle: "Primary signal for screening tendency",
    icon: "🩺",
  },
  {
    key: "emotional_symptoms",
    title: "Step 2: Emotional Wellbeing",
    subtitle: "Context modifier for confidence and severity",
    icon: "🧠",
  },
  {
    key: "behavioral_indicators",
    title: "Step 3: Lifestyle & Behavior",
    subtitle: "Daily pattern modifier for interpretation",
    icon: "🌿",
  },
  {
    key: "medical_history",
    title: "Step 4: Medical History",
    subtitle: "Family history and related conditions",
    icon: "📋",
  },
];

const QUESTION_BANK = {
  fatigue: {
    label: "Fatigue",
    icon: "😴",
    question: "How often do you feel unusually tired or low on energy?",
    normalValue: "none",
    options: [
      {
        value: "none",
        label: "Not at all",
        desc: "I feel energetic most days",
      },
      { value: "rarely", label: "Rarely", desc: "Occasional tiredness" },
      { value: "sometimes", label: "Sometimes", desc: "A few days each week" },
      { value: "often", label: "Often", desc: "Most days" },
      { value: "always", label: "Almost always", desc: "Constant fatigue" },
    ],
    durationQ: "How long have you felt this way?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  hair_fall: {
    label: "Hair Fall",
    icon: "💇",
    question: "Have you noticed increased hair shedding or thinning?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No visible change" },
      { value: "mild", label: "Mild", desc: "Slightly increased shedding" },
      { value: "moderate", label: "Moderate", desc: "Visible thinning" },
      { value: "severe", label: "Severe", desc: "Significant hair loss" },
    ],
    durationQ: "How long has this been going on?",
    durationOptions: [
      { value: 4, label: "< 1 month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  weakness: {
    label: "Weakness / Dizziness",
    icon: "🫧",
    question: "Do you feel physically weak, lightheaded, or dizzy?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "I feel steady" },
      { value: "rarely", label: "Rarely", desc: "Occasional episodes" },
      { value: "sometimes", label: "Sometimes", desc: "Frequent episodes" },
      { value: "often", label: "Often", desc: "Most days" },
      { value: "always", label: "Constantly", desc: "Daily weakness" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 1, label: "Just started" },
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "Over a month" },
    ],
  },
  irregular_cycles: {
    label: "Irregular Cycles",
    icon: "📅",
    question: "How regular are your menstrual cycles currently?",
    normalValue: "very_regular",
    options: [
      {
        value: "very_regular",
        label: "Very regular",
        desc: "Predictable cycle",
      },
      { value: "regular", label: "Mostly regular", desc: "Minor variation" },
      { value: "irregular", label: "Irregular", desc: "Unpredictable timing" },
      {
        value: "highly_irregular",
        label: "Highly irregular",
        desc: "Major variation",
      },
      { value: "amenorrhea", label: "No periods", desc: "Periods stopped" },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 6, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6-12 months" },
      { value: 36, label: "1+ year" },
    ],
  },
  weight_gain: {
    label: "Weight Fluctuation",
    icon: "⚖️",
    question: "Have you noticed unexplained weight change?",
    normalValue: "none",
    options: [
      { value: "none", label: "No change", desc: "Weight stable" },
      { value: "slight_gain", label: "Slight gain", desc: "2-4 kg" },
      { value: "moderate_gain", label: "Moderate gain", desc: "4-8 kg" },
      { value: "significant_gain", label: "Significant gain", desc: "8+ kg" },
      {
        value: "weight_loss",
        label: "Unexplained loss",
        desc: "Unexpected loss",
      },
    ],
    durationQ: "When did this start?",
    durationOptions: [
      { value: 4, label: "< 1 month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  mood_fluctuations: {
    label: "Mood Fluctuations",
    icon: "🌊",
    question: "How variable has your mood been recently?",
    normalValue: "none",
    options: [
      { value: "none", label: "Stable", desc: "Mood is steady" },
      { value: "mild", label: "Mild shifts", desc: "Occasional ups/downs" },
      {
        value: "moderate",
        label: "Moderate shifts",
        desc: "Noticeable changes",
      },
      {
        value: "severe",
        label: "Strong swings",
        desc: "Frequent intense changes",
      },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  irritability: {
    label: "Irritability",
    icon: "😤",
    question: "How often do you feel unusually irritable?",
    normalValue: "none",
    options: [
      { value: "none", label: "Rarely", desc: "Not unusual for me" },
      { value: "mild", label: "Sometimes", desc: "Mild increase" },
      { value: "moderate", label: "Frequent", desc: "Notable impact" },
      { value: "severe", label: "Most days", desc: "Affects daily life" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  anxiety: {
    label: "Anxiety / Restlessness",
    icon: "💭",
    question:
      "How often do you feel anxious or restless without a clear trigger?",
    normalValue: "none",
    options: [
      { value: "none", label: "Rarely", desc: "Within normal range" },
      { value: "mild", label: "Sometimes", desc: "Occasional restlessness" },
      { value: "moderate", label: "Often", desc: "Frequent episodes" },
      { value: "severe", label: "Very often", desc: "Persistent anxiety" },
    ],
    durationQ: "How long has this been present?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  poor_sleep: {
    label: "Poor Sleep Quality",
    icon: "🛌",
    question: "How would you rate your sleep quality?",
    normalValue: "none",
    options: [
      { value: "none", label: "Good", desc: "Restful most nights" },
      { value: "mild", label: "Slightly poor", desc: "Occasional poor nights" },
      {
        value: "moderate",
        label: "Moderately poor",
        desc: "Frequent disturbed sleep",
      },
      {
        value: "severe",
        label: "Very poor",
        desc: "Sleep regularly disrupted",
      },
    ],
    durationQ: "How long has your sleep quality been affected?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  low_sunlight_exposure: {
    label: "Low Sunlight Exposure",
    icon: "🌥️",
    question: "How much daylight/sun exposure do you get in a typical day?",
    normalValue: "none",
    options: [
      { value: "none", label: "Good exposure", desc: "Most days outdoors" },
      { value: "mild", label: "Limited", desc: "Brief sunlight" },
      { value: "moderate", label: "Low", desc: "Rarely in daylight" },
      { value: "severe", label: "Very low", desc: "Mostly indoors" },
    ],
    durationQ: "How long has this routine been similar?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  sedentary_lifestyle: {
    label: "Low Physical Activity",
    icon: "🪑",
    question: "How physically active are you currently?",
    normalValue: "none",
    options: [
      { value: "none", label: "Active", desc: "Regular activity" },
      { value: "mild", label: "Slightly low", desc: "Reduced activity" },
      { value: "moderate", label: "Low", desc: "Mostly sedentary" },
      { value: "severe", label: "Very low", desc: "Minimal movement" },
    ],
    durationQ: "How long has this activity pattern continued?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  skin_issues: {
    label: "Skin Changes",
    icon: "🧴",
    question: "Have you noticed any changes in your skin?",
    normalValue: "none",
    options: [
      { value: "none", label: "No significant change", desc: "Skin is normal" },
      { value: "dryness", label: "Dryness", desc: "Dry, flaky skin" },
      { value: "acne", label: "Acne/Breakouts", desc: "Frequent pimples" },
      {
        value: "hyperpigmentation",
        label: "Dark patches",
        desc: "Melasma/spots",
      },
      {
        value: "multiple",
        label: "Multiple issues",
        desc: "Several skin problems",
      },
    ],
    durationQ: "How long have these skin changes persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  heavy_bleeding: {
    label: "Heavy Period Flow",
    icon: "🩸",
    question: "How would you describe your period flow?",
    normalValue: "moderate",
    options: [
      { value: "none", label: "Not applicable", desc: "No periods/menopause" },
      { value: "light", label: "Light", desc: "Minimal flow" },
      { value: "moderate", label: "Moderate", desc: "Normal flow" },
      { value: "heavy", label: "Heavy", desc: "Heavy flow" },
      { value: "very_heavy", label: "Very heavy", desc: "Soaking through" },
    ],
    durationQ: "How long has this flow pattern continued?",
    durationOptions: [
      { value: 6, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6-12 months" },
      { value: 36, label: "1+ year" },
    ],
  },
  menstrual_cramps: {
    label: "Period Cramps",
    icon: "🤸",
    question: "How severe are your menstrual cramps?",
    normalValue: "none",
    options: [
      { value: "none", label: "Minimal", desc: "Little to no pain" },
      { value: "mild", label: "Mild", desc: "Manageable discomfort" },
      { value: "moderate", label: "Moderate", desc: "Needs pain relief" },
      { value: "severe", label: "Severe", desc: "Affects daily life" },
    ],
    durationQ: "How long has this pain pattern continued?",
    durationOptions: [
      { value: 6, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6-12 months" },
      { value: 48, label: "1+ year" },
    ],
  },
  bloating: {
    label: "Bloating",
    icon: "🎈",
    question: "How often do you feel bloated?",
    normalValue: "none",
    options: [
      { value: "none", label: "Rarely", desc: "Not common" },
      { value: "mild", label: "Sometimes", desc: "Occasional bloating" },
      { value: "moderate", label: "Often", desc: "Frequent bloating" },
      { value: "severe", label: "Almost always", desc: "Persistent bloating" },
    ],
    durationQ: "How long have you experienced this?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  hot_flashes: {
    label: "Hot Flashes",
    icon: "🔥",
    question: "Do you experience hot flashes or night sweats?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "Not experiencing" },
      { value: "mild", label: "Occasional", desc: "Rare episodes" },
      { value: "moderate", label: "Frequent", desc: "Several times a week" },
      { value: "severe", label: "Very frequent", desc: "Daily episodes" },
    ],
    durationQ: "How long have you had these?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  cold_intolerance: {
    label: "Cold Intolerance",
    icon: "❄️",
    question: "How do you feel in cold weather?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "Comfortable in cold" },
      { value: "mild", label: "Feel cold easily", desc: "Get cold faster" },
      { value: "moderate", label: "Very sensitive", desc: "Always cold" },
      {
        value: "severe",
        label: "Extreme sensitivity",
        desc: "Hands/feet always cold",
      },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  brain_fog: {
    label: "Brain Fog",
    icon: "🌫️",
    question: "How would you describe your mental clarity?",
    normalValue: "none",
    options: [
      { value: "none", label: "Clear", desc: " Sharp focus" },
      { value: "mild", label: "Slightly foggy", desc: "Occasional brain fog" },
      { value: "moderate", label: "Foggy", desc: "Frequent forgetfulness" },
      {
        value: "severe",
        label: "Very foggy",
        desc: "Difficulty concentrating",
      },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  appetite_changes: {
    label: "Appetite Changes",
    icon: "🍽️",
    question: "How has your appetite changed?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "Same as before" },
      { value: "increased", label: "Increased", desc: "Much hungrier" },
      { value: "decreased", label: "Decreased", desc: "Less hungry" },
      { value: "variable", label: "Variable", desc: "Up and down" },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  food_cravings: {
    label: "Food Cravings",
    icon: "🍫",
    question: "How strong are your food cravings?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "No unusual cravings" },
      { value: "mild", label: "Mild", desc: "Occasional cravings" },
      { value: "moderate", label: "Moderate", desc: "Strong cravings" },
      { value: "severe", label: "Very strong", desc: "Cravings affect diet" },
    ],
    durationQ: "How long have cravings been strong?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  brittle_nails: {
    label: "Brittle Nails",
    icon: "💅",
    question: "How would you describe your nails?",
    normalValue: "none",
    options: [
      { value: "none", label: "Healthy", desc: "Strong nails" },
      { value: "mild", label: "Slightly weak", desc: "Occasional breaking" },
      { value: "moderate", label: "Brittle", desc: "Break easily" },
      { value: "severe", label: "Very brittle", desc: "Peeling/splitting" },
    ],
    durationQ: "How long have nails been weak?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  breast_tenderness: {
    label: "Breast Tenderness",
    icon: "🫧",
    question: "Do you experience breast tenderness or swelling?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No discomfort" },
      { value: "mild", label: "Mild", desc: "Slight tenderness" },
      { value: "moderate", label: "Moderate", desc: "Noticeable pain" },
      { value: "severe", label: "Severe", desc: "Very painful" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  headaches: {
    label: "Headaches",
    icon: "🤕",
    question: "How often do you get headaches?",
    normalValue: "none",
    options: [
      { value: "none", label: "Rarely", desc: "Occasional" },
      { value: "mild", label: "Sometimes", desc: "Few times a month" },
      { value: "moderate", label: "Often", desc: "Weekly" },
      { value: "severe", label: "Very often", desc: "Daily/near daily" },
    ],
    durationQ: "How long has this frequency persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  libido_changes: {
    label: "Libido Changes",
    icon: "💕",
    question: "How has your interest in intimacy changed?",
    normalValue: "none",
    options: [
      { value: "none", label: "Same as before", desc: "No change" },
      { value: "decreased", label: "Decreased", desc: "Less interest" },
      {
        value: "significantly_decreased",
        label: "Much less",
        desc: "Rarely interested",
      },
      { value: "increased", label: "Increased", desc: "More interest" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  palpitations: {
    label: "Heart Palpitations",
    icon: "💓",
    question: "Do you experience heart palpitations or racing heart?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "Heart rate normal" },
      { value: "mild", label: "Occasional", desc: "Rare episodes" },
      { value: "moderate", label: "Frequent", desc: "Often feel racing" },
      { value: "severe", label: "Very frequent", desc: "Daily episodes" },
    ],
    durationQ: "How long have you had these?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  // ==== Hypothyroidism Additional ====
  dry_skin: {
    label: "Dry Skin",
    icon: "🧴",
    question: "Do you have unusually dry or scaly skin?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "Skin is moisturized" },
      { value: "mild", label: "Slightly dry", desc: "Minor dryness" },
      { value: "moderate", label: "Dry", desc: "Noticeably dry" },
      { value: "severe", label: "Very dry", desc: "Cracking/flaking" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  constipation: {
    label: "Constipation",
    icon: "💩",
    question: "How often do you experience constipation?",
    normalValue: "none",
    options: [
      { value: "none", label: "Regular", desc: "Daily bowel movements" },
      { value: "mild", label: "Occasional", desc: "Some days no movement" },
      { value: "moderate", label: "Frequent", desc: "Infrequent" },
      { value: "severe", label: "Severe", desc: "Strain needed" },
    ],
    durationQ: "How long has this pattern continued?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  // ==== PCOS Additional ====
  acne: {
    label: "Acne (Chin/Jaw)",
    icon: "🥴",
    question: "Do you experience acne, especially around chin or jaw?",
    normalValue: "none",
    options: [
      { value: "none", label: "Clear", desc: "No breakouts" },
      { value: "mild", label: "Mild", desc: "Occasional pimples" },
      { value: "moderate", label: "Moderate", desc: "Frequent breakouts" },
      { value: "severe", label: "Severe", desc: "Cystic acne" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  excess_hair: {
    label: "Excess Body Hair",
    icon: "💃",
    question: "Do you have excess facial or body hair growth?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "No excess hair" },
      { value: "mild", label: "Mild", desc: "Slight increase" },
      { value: "moderate", label: "Moderate", desc: "Noticeable hair" },
      { value: "severe", label: "Severe", desc: "Excessive growth" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6-12 months" },
      { value: 36, label: "1+ year" },
    ],
  },
  thinning_hair: {
    label: "Scalp Hair Thinning",
    icon: "👩‍🦱",
    question: "Have you noticed hair thinning on your scalp?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "Normal volume" },
      { value: "mild", label: "Mild", desc: "Slight thinning" },
      { value: "moderate", label: "Moderate", desc: "Visible thinning" },
      { value: "severe", label: "Severe", desc: "Thinning patches" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  abdominal_weight: {
    label: "Abdominal Weight Gain",
    icon: "🍎",
    question: "Have you gained weight around your abdomen?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No central weight gain" },
      { value: "mild", label: "Slight", desc: "Minor gain" },
      { value: "moderate", label: "Moderate", desc: "Noticeable belly" },
      { value: "severe", label: "Significant", desc: "Prominent belly" },
    ],
    durationQ: "When did this weight pattern start?",
    durationOptions: [
      { value: 4, label: "< 1 month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  sugar_cravings: {
    label: "Sugar Cravings / Crashes",
    icon: "🍬",
    question: "Do you experience sugar cravings or energy crashes after meals?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "No unusual cravings" },
      { value: "mild", label: "Occasional", desc: "Sometimes crave sugar" },
      { value: "moderate", label: "Frequent", desc: "Crave often" },
      { value: "severe", label: "Very strong", desc: "Constant cravings" },
    ],
    durationQ: "How long have cravings been strong?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  // ==== Anemia Additional ====
  shortness_breath: {
    label: "Shortness of Breath",
    icon: "😮‍💨",
    question: "Do you feel breathless during mild activities?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "Breathing normal" },
      { value: "mild", label: "Occasional", desc: "Mild breathlessness" },
      { value: "moderate", label: "Frequent", desc: "Often breathless" },
      { value: "severe", label: "Severe", desc: "Even at rest" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 2, label: "1-2 weeks" },
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3+ months" },
    ],
  },
  pale_skin: {
    label: "Pale Skin/Eyes",
    icon: "🤕",
    question: "Have you noticed your skin or inner eyelids looking pale?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "Healthy color" },
      { value: "mild", label: "Slightly pale", desc: "Little paler" },
      { value: "moderate", label: "Pale", desc: "Noticeably pale" },
      { value: "severe", label: "Very pale", desc: "Very pale" },
    ],
    durationQ: "How long have you noticed this?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  pica_cravings: {
    label: "Pica (Non-food Cravings)",
    icon: "🧱",
    question: "Do you crave non-food items like ice, chalk, mud, or raw rice?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No such cravings" },
      { value: "mild", label: "Occasional", desc: "Rarely" },
      { value: "moderate", label: "Sometimes", desc: "A few times" },
      { value: "severe", label: "Frequently", desc: "Often crave these" },
    ],
    durationQ: "How long have you had these cravings?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  // ==== YES/NO History Questions ====
  thyroid_swelling: {
    label: "Neck Swelling",
    icon: "🔴",
    question: "Have you noticed any swelling or fullness in the front of your neck?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "No swelling" },
      { value: "yes", label: "Yes", desc: "Noticeable swelling" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  family_thyroid: {
    label: "Family Thyroid History",
    icon: "👨‍👩‍👧",
    question: "Has anyone in your family been diagnosed with thyroid disease?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "No family history" },
      { value: "yes", label: "Yes", desc: "Family history" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  thyroid_medication: {
    label: "Thyroid Medication",
    icon: "💊",
    question: "Are you currently taking thyroid medication?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "Not taking medication" },
      { value: "yes", label: "Yes", desc: "Currently on medication" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  missed_periods: {
    label: "Missed Periods",
    icon: "⏱️",
    question: "Have you missed periods for more than 2-3 months?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "Regular periods" },
      { value: "yes", label: "Yes", desc: "Missed 2-3+ months" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  family_pcos: {
    label: "Family PCOS/Diabetes",
    icon: "🧬",
    question: "Does anyone in your family have PCOS or diabetes?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "No family history" },
      { value: "yes", label: "Yes", desc: "Family history" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  spoon_nails: {
    label: "Spoon-shaped Nails",
    icon: "💅",
    question: "Do your nails break easily or appear spoon-shaped?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "Healthy nails" },
      { value: "yes", label: "Yes", desc: "Spoon-shaped/fragile" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  tea_coffee_meals: {
    label: "Tea/Coffee with Meals",
    icon: "☕",
    question: "Do you drink tea or coffee with meals?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "Not with meals" },
      { value: "yes", label: "Yes", desc: "Regularly with meals" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  anemia_diagnosed: {
    label: "Previous Anemia",
    icon: "📋",
    question: "Have you been diagnosed with anemia before?",
    normalValue: "no",
    options: [
      { value: "no", label: "No", desc: "No previous diagnosis" },
      { value: "yes", label: "Yes", desc: "Previous diagnosis" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  iron_rich_food: {
    label: "Iron-rich Food",
    icon: "🥩",
    question: "Do you regularly consume iron-rich foods (spinach, lentils, meat, eggs)?",
    normalValue: "yes",
    options: [
      { value: "yes", label: "Yes", desc: "Regularly consume" },
      { value: "no", label: "No", desc: "Rarely consume" },
    ],
    durationQ: null,
    durationOptions: [],
  },
  // ==== NEW CONDITION QUESTIONS ====
  slow_heart_rate: {
    label: "Heart Rate",
    icon: "💓",
    question: "How do you feel your heart rate is usually?",
    normalValue: "none",
    options: [
      { value: "none", label: "Normal", desc: "Regular heart rate" },
      { value: "mild", label: "Slower than usual", desc: "Noticeably slower" },
      { value: "moderate", label: "Much slower", desc: "Fatigue with low HR" },
      { value: "severe", label: "Very slow", desc: "Regularly dizzy" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  temperature_sensitivity: {
    label: "Temperature Sensitivity",
    icon: "🌡️",
    question: "How sensitive are you to temperature changes?",
    normalValue: "none",
    options: [
      { value: "none", label: "Not sensitive", desc: "Normal tolerance" },
      { value: "mild", label: "Sensitive to Cold", desc: "Feel cold easily" },
      { value: "moderate", label: "Very sensitive to Cold", desc: "Always cold" },
      { value: "severe", label: "Extreme cold sensitivity", desc: "Hands/feet always cold" },
    ],
    durationQ: "How long has this persisted?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-2 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  acanthosis_nigricans: {
    label: "Dark Skin Patches",
    icon: "🎨",
    question: "Have you noticed dark, velvety patches of skin (neck, armpits, groin)?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No such patches" },
      { value: "mild", label: "Mild", desc: "Slight darkening" },
      { value: "moderate", label: "Moderate", desc: "Noticeable patches" },
      { value: "severe", label: "Severe", desc: "Extensive dark patches" },
    ],
    durationQ: "How long have you had these?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
  skin_tags: {
    label: "Skin Tags",
    icon: "🏏",
    question: "Have you noticed any new skin tags appearing recently?",
    normalValue: "none",
    options: [
      { value: "none", label: "No", desc: "No new skin tags" },
      { value: "mild", label: "Few", desc: "1-2 skin tags" },
      { value: "moderate", label: "Some", desc: "3-5 skin tags" },
      { value: "severe", label: "Many", desc: "Multiple skin tags" },
    ],
    durationQ: "How long have you noticed these?",
    durationOptions: [
      { value: 4, label: "About a month" },
      { value: 8, label: "1-3 months" },
      { value: 12, label: "3-6 months" },
      { value: 24, label: "6+ months" },
    ],
  },
};

function SymptomCard({ symptom, categoryKey, onChange }) {
  const config = QUESTION_BANK[symptom.name];
  if (!config) return null;

  const currentValue = symptom.severity;
  const currentDuration = symptom.durationWeeks;
  const normalValue = config.normalValue || "none";
  const showDuration = currentValue !== null && currentValue !== normalValue;

  const handleSeverityChange = (value) => {
    const currentCard = document.activeElement?.closest(".card-interactive");
    onChange(categoryKey, symptom.name, "severity", value);

    if (value === normalValue) {
      onChange(categoryKey, symptom.name, "durationWeeks", null);
      setTimeout(() => {
        const cards = Array.from(
          document.querySelectorAll(".card-interactive"),
        );
        const currentIndex = cards.indexOf(currentCard);
        const nextCard = cards[currentIndex + 1];
        if (nextCard)
          nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const handleDurationChange = (value) => {
    const currentCard = document.activeElement?.closest(".card-interactive");
    onChange(categoryKey, symptom.name, "durationWeeks", value);
    setTimeout(() => {
      const cards = Array.from(document.querySelectorAll(".card-interactive"));
      const currentIndex = cards.indexOf(currentCard);
      const nextCard = cards[currentIndex + 1];
      if (nextCard)
        nextCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div
      className="card card-interactive"
      style={{ marginBottom: "var(--space-4)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <span style={{ fontSize: "var(--text-2xl)" }}>{config.icon}</span>
        <h3 style={{ marginBottom: 0 }}>{config.label}</h3>
      </div>

      <div className="mcq-question">
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            marginBottom: "var(--space-3)",
          }}
        >
          {config.question}
        </p>
        <div className="mcq-options">
          {config.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`mcq-option ${currentValue === opt.value ? "selected" : ""}`}
              onClick={() => handleSeverityChange(opt.value)}
            >
              <div className="mcq-option-dot" />
              <div className="mcq-option-text">
                <span className="mcq-option-label">{opt.label}</span>
                <span className="mcq-option-desc">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showDuration && (
        <div className="mcq-question" style={{ marginTop: "var(--space-5)" }}>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              marginBottom: "var(--space-3)",
            }}
          >
            {config.durationQ}
          </p>
          <div className="mcq-options cols-4">
            {config.durationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`mcq-option ${currentDuration === opt.value ? "selected" : ""}`}
                onClick={() => handleDurationChange(opt.value)}
              >
                <div className="mcq-option-dot" />
                <div className="mcq-option-text">
                  <span
                    className="mcq-option-label"
                    style={{ fontSize: "var(--text-xs)" }}
                  >
                    {opt.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SymptomCheckinPage() {
  const navigate = useNavigate();
  const { userId } = useProfileStore();
  const {
    physical_symptoms,
    emotional_symptoms,
    behavioral_indicators,
    medical_history,
    setSymptomField,
  } = useSymptomStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const step = STEP_CONFIG[stepIndex];

  const stepSymptoms = useMemo(() => {
    if (step.key === "physical_symptoms") return physical_symptoms;
    if (step.key === "emotional_symptoms") return emotional_symptoms;
    if (step.key === "medical_history") return medical_history;
    return behavioral_indicators;
  }, [step, physical_symptoms, emotional_symptoms, behavioral_indicators, medical_history]);

  const allSymptoms = useMemo(
    () => [
      ...physical_symptoms,
      ...emotional_symptoms,
      ...behavioral_indicators,
      ...medical_history,
    ],
    [physical_symptoms, emotional_symptoms, behavioral_indicators, medical_history],
  );

  const handleContinue = () => {
    setStepIndex(stepIndex + 1);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const handleBack = () => {
    if (stepIndex === 0) {
      navigate("/onboarding");
    } else {
      setStepIndex(stepIndex - 1);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  async function handleSave() {
    if (!userId) {
      setError("Please complete onboarding first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createSymptomLog({
        userId,
        symptoms: allSymptoms,
        physical_symptoms,
        emotional_symptoms,
        behavioral_indicators,
      });
      navigate("/labs/upload");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to save symptoms. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#FAF5FF', minHeight: '100vh', padding: '40px 20px' }}>
      {/* ── HERO SECTION ── */}
      <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#2A1F4E', marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Symptom Check-in
        </h1>
        <p style={{ color: '#2A1F4E99', fontSize: '16px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
          Complete all 3 steps for a cleaner and more accurate screening signal.
        </p>

        {/* Visual Step Tracker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ 
              width: i === stepIndex ? '40px' : '12px', 
              height: '6px', 
              borderRadius: '10px', 
              background: i <= stepIndex ? 'linear-gradient(135deg, #7C6FCD, #9B8EDF)' : '#C8A7D840',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT PANEL ── */}
      <section style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: '#FFFFFF', 
        borderRadius: '32px', 
        padding: '32px',
        boxShadow: '0 20px 40px rgba(42, 31, 78, 0.04)',
        border: '1px solid #EDE0F5',
        position: 'relative'
      }}>

        {/* Step Header Card - Soft Lavender Variation */}
        <div style={{ 
          background: '#FAF5FF', 
          padding: '24px', 
          borderRadius: '24px', 
          marginBottom: '32px',
          border: '1px solid #EDE0F5'
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                fontSize: '28px', 
                background: '#FFFFFF', 
                width: '56px', 
                height: '56px', 
                borderRadius: '16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #EDE0F5'
              }}>
                {step.icon}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#2A1F4E' }}>{step.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#2A1F4E90', fontWeight: 500 }}>{step.subtitle}</p>
              </div>
            </div>
            <div style={{ 
              background: '#7C6FCD', 
              color: '#FFFFFF', 
              padding: '8px 16px', 
              borderRadius: '12px', 
              fontSize: '13px', 
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(124, 111, 205, 0.2)'
            }}>
              Step {stepIndex + 1} / 4
            </div>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#FFF5F5', 
            border: '1px solid #FED7D7', 
            color: '#C53030', 
            padding: '16px 20px', 
            borderRadius: '16px', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span> {error}
          </div>
        )}

        {/* Symptom List Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {stepSymptoms.map((symptom) => (
            <SymptomCard
              key={symptom.name}
              symptom={symptom}
              categoryKey={step.key}
              onChange={setSymptomField}
              onAllComplete={true}
            />
          ))}
        </div>

        {/* ── BUTTON ROW ── */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginTop: "40px", 
          paddingTop: "32px", 
          borderTop: "1px solid #F1F5F9" 
        }}>
          <button 
            type="button" 
            onClick={handleBack}
            style={{
              background: '#FFFFFF',
              border: '1px solid #EDE0F5',
              color: '#7C6FCD',
              padding: '14px 28px',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ← Back
          </button>

          <div style={{ flex: 1 }} />

          {stepIndex < STEP_CONFIG.length - 1 ? (
            <button 
              type="button" 
              onClick={handleContinue}
              style={{
                background: 'linear-gradient(135deg, #7C6FCD, #9B8EDF)',
                border: 'none',
                color: '#FFFFFF',
                padding: '14px 36px',
                borderRadius: '16px',
                fontWeight: 700,
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(124, 111, 205, 0.2)',
                transition: 'all 0.2s'
              }}
            >
              Continue →
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleSave} 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #C9A44A, #E8C97A)',
                border: 'none',
                color: '#2A1F4E',
                padding: '16px 40px',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 22px rgba(201, 164, 74, 0.3)',
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? "Saving..." : "Save & Continue →"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
