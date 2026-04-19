import { create } from "zustand";

export const useScreeningStore = create((set) => ({
  latestSessionId: "",
  latestOutput: null,
  conditionDetails: null,
  history: [],
  setLatestResult: (sessionId, output, conditionDetails = null) => set({ latestSessionId: sessionId, latestOutput: output, conditionDetails }),
  setHistory: (history) => set({ history }),
}));
