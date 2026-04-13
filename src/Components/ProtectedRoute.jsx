import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Simple protected route that checks for a stored token.
// Customize to use Redux state if desired.
const ProtectedRoute = ({ redirectTo = "/login" }) => {
  const token = localStorage.getItem("Token");
  if (!token) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
