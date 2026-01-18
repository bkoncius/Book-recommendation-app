import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/useAuth";

function Navbar() {
  const { user, logout } = useAuth();
  const naviagte = useNavigate();

  const handleLogout = async () => {
    await logout();
    naviagte("/");
  };

  return (
    <nav>
      <Link to="/">Books</Link>

      {user && user.role === "user" && <Link to="/dashboard">Dashoard</Link>}

      {user && user.role === "admin" && <Link to="/admin">Admin</Link>}

      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;
