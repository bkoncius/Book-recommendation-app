import { useState, useEffect } from "react";
import api from "../lib/axios";

export default function BookCard({ book, onBookClick }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [book.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorites/check/${book.id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.log("Not logged in or error checking favorite status", error);
    }
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${book.id}`);
      } else {
        await api.post(`/favorites`, { bookId: book.id });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      alert("Please login to add books to favorites");
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white hover:shadow" onClick={() => onBookClick(book.id)}>
      <div
        className="w-full bg-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "3/4" }}
      >
        {book.image_url ? (
          <img
            src={book.image_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-4xl text-gray-400">📚</div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">{book.category_name}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-yellow-500">
            ★{" "}
            {book.average_rating
              ? parseFloat(book.average_rating).toFixed(1)
              : "N/A"}
          </span>
          <button
            className="text-lg disabled:opacity-60 disabled:cursor-not-allowed transition-transform hover:scale-125"
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
}
