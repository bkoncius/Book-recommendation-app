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
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition"
          >
            Books
          </Link>

          <div className="hidden md:flex gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition text-sm font-medium"
            >
              Browse
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition text-sm font-medium flex items-center gap-2"
                >
                  My Favorites
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
