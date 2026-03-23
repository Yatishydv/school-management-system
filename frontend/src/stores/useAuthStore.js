// frontend/src/stores/useAuthStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  setAuth: ({ token, user }) =>
    set(() => {
      try {
        if (token) localStorage.setItem("sms_token", token);
        if (user) localStorage.setItem("sms_user", JSON.stringify(user));
      } catch {}
      return { token, user };
    }),
  clearAuth: () =>
    set(() => {
      try {
        localStorage.removeItem("sms_token");
        localStorage.removeItem("sms_user");
      } catch {}
      return { token: null, user: null };
    }),
  hydrateFromLocal: () =>
    set(() => {
      try {
        const token = localStorage.getItem("sms_token");
        const user = JSON.parse(localStorage.getItem("sms_user") || "null");
        return { token, user };
      } catch {
        return { token: null, user: null };
      }
    }),
}));

export default useAuthStore;
