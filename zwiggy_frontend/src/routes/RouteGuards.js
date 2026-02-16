import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { EmptyState } from "../components/ui";

/**
 * PUBLIC_INTERFACE
 * Require authentication for a route.
 */
export function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <EmptyState title="Loading…" description="Checking your session." />;
  }

  if (!auth.isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

/**
 * PUBLIC_INTERFACE
 * Require owner role for a route.
 */
export function RequireOwner({ children }) {
  const auth = useAuth();

  if (auth.loading) {
    return <EmptyState title="Loading…" description="Checking your session." />;
  }

  if (!auth.isAuthed) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role !== "owner") {
    return <Navigate to="/restaurants" replace />;
  }

  return children;
}
