import React from "react";
import { Navigate } from "react-router-dom";

// Dummy authentication check (replace with real logic)
const isAuthenticated = () => {
  // For now, always return true. Replace with real auth logic.
  return true;
};

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
