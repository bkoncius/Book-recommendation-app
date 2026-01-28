import { useState, useEffect } from "react";
import api from "../lib/axios";
import { useAuth } from "../context/useAuth";

export default function CommentsSection({ bookId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [bookId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${bookId}`);
      setComments(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch comments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/comments/${bookId}`, { content: newComment });
      setNewComment("");
      await fetchComments();
    } catch (error) {
      alert("Failed to add comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, currentContent) => {
    setEditingId(commentId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/comments/${commentId}`, { content: editContent });
      setEditingId(null);
      await fetchComments();
    } catch (error) {
      alert("Failed to update comment");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);
      await fetchComments();
    } catch (error) {
      alert("Failed to delete comment");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Comments ({comments.length})
      </h2>

      {user && (
        <form
          className="mb-8 p-4 bg-gray-50 rounded-lg"
          onSubmit={handleAddComment}
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows="4"
            disabled={submitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}

      {!user && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6 text-sm text-yellow-800">
          Please log in to comment on this book
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-600">
          Loading comments...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{comment.email}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                    disabled={submitting}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-3 leading-relaxed">
                    {comment.comment}
                  </p>
                  {user && user.id === comment.user_id && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <button
                        onClick={() =>
                          handleEditComment(comment.id, comment.comment)
                        }
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
