import { useEffect, useRef } from "react";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useAutoLogout = (timeoutInMinutes = 5) => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();
  const timeoutMs = timeoutInMinutes * 60 * 1000;
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (token) {
      timerRef.current = setTimeout(() => {
        logout();
        navigate("/login");
        toast.info("Session expired due to inactivity for security.", {
            toastId: "session-expired", // Prevent multiple toasts
        });
      }, timeoutMs);
    }
  };

  useEffect(() => {
    // Events that consider the user "active"
    const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart"];

    if (token) {
      // Initialize timer
      resetTimer();

      // Add event listeners
      events.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      // Cleanup
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token]);

  return null;
};

export default useAutoLogout;
