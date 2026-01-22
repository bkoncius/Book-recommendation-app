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

  if (loading) return <div className="rating-loading">Loading ratings...</div>;

  return (
    <div className="rating-section">
      <div className="rating-display">
        <div className="rating-stats">
          <div className="average-rating">
            <div className="rating-number">{averageRating.toFixed(1)}</div>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star-display ${star <= Math.round(averageRating) ? "filled" : ""}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="rating-meta">
            <p className="total-ratings">{totalRatings} ratings</p>
          </div>
        </div>
      </div>

      {user && (
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {userRating > 0
              ? `Your rating: ${userRating} stars`
              : "Rate this book"}
          </p>
          <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`text-2xl cursor-pointer transition ${
                  star <= (hoverRating || userRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
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
