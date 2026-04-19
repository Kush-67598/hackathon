import { create } from "zustand";

export const useScreeningStore = create((set) => ({
  latestSessionId: "",
  latestOutput: null,
  history: [],
  setLatestResult: (sessionId, output) => set({ latestSessionId: sessionId, latestOutput: output }),
  setHistory: (history) => set({ history }),
}));
