import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),

  // Sets user + token on login/registration
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  // Clears user + token on logout
  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Setter for updating current user details (e.g., session verification)
  setUser: (user) => set({ user }),
}));
