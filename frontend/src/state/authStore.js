// frontend/src/state/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("sms_token") || null,
  user: JSON.parse(localStorage.getItem("sms_user") || "null"),

  setAuth: ({ token, user }) =>
    set(() => {
      localStorage.setItem("sms_token", token);
      localStorage.setItem("sms_user", JSON.stringify(user));
      return { token, user };
    }),

  logout: () =>
    set(() => {
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_user");
      return { token: null, user: null };
    }),
}));

export default useAuthStore;
