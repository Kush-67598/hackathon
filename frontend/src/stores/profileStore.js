import { create } from "zustand";

const savedUserId = localStorage.getItem("cs_userId") || "";

export const useProfileStore = create((set, get) => ({
  userId: savedUserId,
  profile: {
    age: null,
    cycleRegularity: null,
    flow: null,
    averageCycleLength: null,
    lifestyle: {
      sleepHours: null,
      stressLevel: null,
      exerciseFrequency: null,
    },
    dietType: null,
    weightChange: null,
    recentEvents: {
      pregnancy: false,
      medicationChange: false,
    },
  },

  setProfileField: (field, value) =>
    set((state) => ({ profile: { ...state.profile, [field]: value } })),

  setLifestyleField: (field, value) =>
    set((state) => ({
      profile: {
        ...state.profile,
        lifestyle: { ...state.profile.lifestyle, [field]: value },
      },
    })),

  setRecentEvent: (field, value) =>
    set((state) => ({
      profile: {
        ...state.profile,
        recentEvents: { ...state.profile.recentEvents, [field]: value },
      },
    })),

  setUserId: (userId) => {
    localStorage.setItem("cs_userId", userId);
    set({ userId });
  },
}));
