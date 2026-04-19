import { create } from "zustand";

const savedUserId = localStorage.getItem("cs_userId") || "";

export const useProfileStore = create((set, get) => ({
  userId: savedUserId,
  profile: {
    age: 26,
    cycleRegularity: "regular",
    flow: "moderate",
    averageCycleLength: 28,
    lifestyle: {
      sleepHours: 7,
      stressLevel: 3,
      exerciseFrequency: "moderate",
    },
    dietType: "omnivore",
    weightChange: "stable",
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
