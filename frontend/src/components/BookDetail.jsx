import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../lib/axios";
import { useAuth } from "../context/useAuth";
import CommentsSection from "./CommentsSection";
import RatingSection from "./RatingSection";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id, user, authLoading]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/books/${id}`);
      setBook(response.data.data);

      // Check favorite status only if user is logged in and auth is loaded
      if (user && !authLoading) {
        try {
          console.log(
            "Fetching favorite status for user:",
            user.id,
            "book:",
            id,
          );
          const favResponse = await api.get(`/favorites/check/${id}`);
          console.log("Favorite response:", favResponse.data);
          setIsFavorite(favResponse.data.isFavorite);
        } catch (err) {
          console.error(
            "Error fetching favorite status:",
            err.response?.data || err.message,
          );
          setIsFavorite(false);
        }
      } else {
        console.log("User not loaded yet or not authenticated");
        setIsFavorite(false);
      }
    } catch (err) {
      setError("Failed to fetch book details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites`, { bookId: parseInt(id) });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Refetch favorite status to sync with server
      try {
        const favResponse = await api.get(`/favorites/check/${id}`);
        setIsFavorite(favResponse.data.isFavorite);
      } catch (err) {
        console.error("Error refetching favorite status:", err);
      }
    }
  };

  if (loading || authLoading)
    return <div className="text-center py-12 text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!book)
    return (
      <div className="text-center py-12 text-gray-600">Book not found</div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <button
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        <div className="bg-white rounded-lg p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl text-gray-400">📚</div>
                )}
              </div>
              <button
                className={`w-full px-4 py-2 rounded-md text-white font-medium transition text-sm ${
                  isFavorite
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } ${!user ? "bg-gray-400 cursor-not-allowed" : ""}`}
                onClick={handleFavoriteToggle}
                disabled={!user}
              >
                {isFavorite
                  ? "❤️ Remove from Favorites"
                  : "🤍 Add to Favorites"}
              </button>
            </div>

            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm mb-6">
                {book.category_name}
              </span>

              {book.isbn && (
                <p className="text-sm text-gray-600 mb-2">ISBN: {book.isbn}</p>
              )}
              {book.pages && (
                <p className="text-sm text-gray-600 mb-2">
                  Pages: {book.pages}
                </p>
              )}
              {book.published_date && (
                <p className="text-sm text-gray-600 mb-6">
                  Published: {new Date(book.published_date).getFullYear()}
                </p>
              )}

              <RatingSection bookId={id} />

              <div className="mt-8">
                <h2 className="text-xl font-bold mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {book.description || "No description available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {user && <CommentsSection bookId={id} />}
      </div>
    </div>
  );
}
