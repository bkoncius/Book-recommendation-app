import { useAuth } from "../context/useAuth.js";

function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return children;
}

export default AuthGate;
