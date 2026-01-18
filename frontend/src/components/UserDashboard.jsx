import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import BookCard from "./BookCard";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get("/favorites");
      setFavorites(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch favorites");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">My Favorites</h1>
        <p className="text-lg mt-2">Books you've saved for later</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            Loading your favorites...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">No favorite books yet</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              You have {favorites.length} favorite book(s)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onBookClick={handleBookClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
