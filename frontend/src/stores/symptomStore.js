import { create } from "zustand";
import {
  BEHAVIORAL_INDICATORS,
  EMOTIONAL_SYMPTOMS,
  PHYSICAL_SYMPTOMS,
} from "../constants/symptoms";

function buildCategorySymptoms(symptomNames) {
  return symptomNames.map((name) => ({
    name,
    severity: null,
    frequency: "weekly",
    durationWeeks: null,
    worsening: false,
  }));
}

function flattenSymptoms(categories) {
  return [
    ...categories.physical_symptoms,
    ...categories.emotional_symptoms,
    ...categories.behavioral_indicators,
  ];
}

function updateCategoryField(list, name, field, value) {
  return list.map((symptom) => (symptom.name === name ? { ...symptom, [field]: value } : symptom));
}

export const useSymptomStore = create((set) => ({
  physical_symptoms: buildCategorySymptoms(PHYSICAL_SYMPTOMS),
  emotional_symptoms: buildCategorySymptoms(EMOTIONAL_SYMPTOMS),
  behavioral_indicators: buildCategorySymptoms(BEHAVIORAL_INDICATORS),
  setSymptomField: (category, name, field, value) =>
    set((state) => ({
      [category]: updateCategoryField(state[category] || [], name, field, value),
    })),
  resetSymptoms: () =>
    set({
      physical_symptoms: buildCategorySymptoms(PHYSICAL_SYMPTOMS),
      emotional_symptoms: buildCategorySymptoms(EMOTIONAL_SYMPTOMS),
      behavioral_indicators: buildCategorySymptoms(BEHAVIORAL_INDICATORS),
    }),
  getAllSymptoms: () => {
    const state = useSymptomStore.getState();
    return flattenSymptoms(state);
  },
}));
