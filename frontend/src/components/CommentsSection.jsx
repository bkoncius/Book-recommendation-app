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
    <div className="bg-white rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>

      {user && (
        <form className="mb-8 pb-8 border-b" onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows="4"
            disabled={submitting}
            className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-60 text-sm font-medium transition"
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}

      {!user && (
        <div className="mb-8 pb-8 border-b bg-gray-50 p-4 rounded-md text-center text-gray-600 text-sm">
          Please log in to comment on this book
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500 text-sm">Loading comments...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 text-sm">{error}</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between mb-2">
                <p className="font-semibold text-sm text-gray-800">{comment.email}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {editingId === comment.id ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                    disabled={submitting}
                    className="w-full p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 disabled:opacity-60"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-60 text-sm transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-60 text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 text-sm mb-3">{comment.comment}</p>
                  {user && user.id === comment.user_id && (
                    <div className="flex gap-2 text-xs">
                      <button
                        onClick={() => handleEditComment(comment.id, comment.comment)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
