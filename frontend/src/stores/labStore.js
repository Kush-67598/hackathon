import { create } from "zustand";

const EMPTY_LABS = {
  hemoglobin: "",
  tsh: "",
  ferritin: "",
  t3: "",
  t4: "",
  lh: "",
  fsh: "",
};

export const useLabStore = create((set) => ({
  extracted: { ...EMPTY_LABS },
  confidence: {},
  snippets: [],
  warnings: [],
  confirmedLabs: { ...EMPTY_LABS },
  setExtractionResult: (result) =>
    set({
      extracted: { ...EMPTY_LABS, ...(result.extracted || {}) },
      confidence: result.confidence || {},
      snippets: result.raw_text_snippets || [],
      warnings: result.warnings || [],
      confirmedLabs: { ...EMPTY_LABS, ...(result.extracted || {}) },
    }),
  setConfirmedField: (field, value) =>
    set((state) => ({
      confirmedLabs: {
        ...state.confirmedLabs,
        [field]: value,
      },
    })),
  clearLabs: () =>
    set({
      extracted: { ...EMPTY_LABS },
      confidence: {},
      snippets: [],
      warnings: [],
      confirmedLabs: { ...EMPTY_LABS },
    }),
}));
