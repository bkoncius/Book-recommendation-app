import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router";

function RequireAdmin({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role_id !== 2) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default RequireAdmin;
