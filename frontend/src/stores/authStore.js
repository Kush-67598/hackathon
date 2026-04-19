import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("cs_token") || "",
  user: JSON.parse(localStorage.getItem("cs_user") || "null"),

  setAuth: ({ token, user }) => {
    localStorage.setItem("cs_token", token);
    localStorage.setItem("cs_user", JSON.stringify(user));
    set({ token, user });
  },

  clearAuth: () => {
    localStorage.removeItem("cs_token");
    localStorage.removeItem("cs_user");
    set({ token: "", user: null });
  },

  isAuthenticated: () => {
    return !!get().token;
  },
}));
