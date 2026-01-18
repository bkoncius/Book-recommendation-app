import { useState, useEffect } from "react";
import api from "../lib/axios";
import { useAuth } from "../context/useAuth";

export default function RatingSection({ bookId }) {
  const { user } = useAuth();
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [bookId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ratings/${bookId}/stats`);
      setAverageRating(response.data.data.average_rating);
      setTotalRatings(response.data.data.total_ratings);

      if (user) {
        const userResponse = await api.get(`/ratings/${bookId}`);
        setUserRating(userResponse.data.data?.rating || 0);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating) => {
    if (!user) {
      alert("Please login to rate this book");
      return;
    }

    try {
      await api.post(`/ratings/${bookId}`, { rating });
      setUserRating(rating);
      await fetchRatings();
    } catch (error) {
      alert("Failed to submit rating");
      console.error(error);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading ratings...</div>;

  return (
    <div className="my-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-6 mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
          <div className="flex gap-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-xl ${star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}>
                ★
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{totalRatings} ratings</p>
        </div>
      </div>

      {user && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {userRating > 0 ? `Your rating: ${userRating} stars` : "Rate this book"}
          </p>
          <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`text-2xl cursor-pointer transition ${
                  star <= (hoverRating || userRating) ? "text-yellow-400" : "text-gray-300"
                }`}
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => handleRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
