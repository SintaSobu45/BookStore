import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SessionExpiryHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    // No logged-in user
    if (!token || !tokenExpiry) {
      return;
    }

    const expiryTime = Number(tokenExpiry);
    const timeRemaining = expiryTime - Date.now();

    const logoutUser = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      localStorage.removeItem("userId");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("role");

      // Store message to show after redirect
      localStorage.setItem(
        "sessionExpiredMessage",
        "Your session has expired. Please login again.",
      );

      navigate("/login", { replace: true });
    };

    // Token already expired
    if (timeRemaining <= 0) {
      logoutUser();
      return;
    }

    // Automatically logout when token expires
    const logoutTimer = setTimeout(logoutUser, timeRemaining);

    return () => clearTimeout(logoutTimer);
  }, [navigate]);

  return null;
}