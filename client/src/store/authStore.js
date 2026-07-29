import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // Initialize state from localStorage so refresh doesn't wipe state
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  setAuth: (user, token) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    if (token) localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));
