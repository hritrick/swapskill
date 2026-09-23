import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";

// Wraps any route that requires a signed-in user. Reads `user` straight
// from AppContext (the single source of truth for auth state) — if
// nobody's logged in, bounce to /login and remember where we came from
// so LoginPage can send the user back after a successful sign-in.
export default function ProtectedRoute({ children }) {
  const { user } = useContext(AppContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
