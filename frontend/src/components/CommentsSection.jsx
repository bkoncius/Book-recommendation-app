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
    <div className="comments-section">
      <h2>Comments ({comments.length})</h2>

      {user && (
        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows="4"
            disabled={submitting}
          />
          <button type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}

      {!user && (
        <div className="login-prompt">
          <p>Please log in to comment on this book</p>
        </div>
      )}

      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : error ? (
        <div className="comments-error">{error}</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <p className="comment-author">{comment.username}</p>
                <p className="comment-date">
                  {new Date(comment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {editingId === comment.id ? (
                <div className="comment-edit">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                    disabled={submitting}
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={submitting}
                      className="save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-content">{comment.content}</p>
                  {user && user.id === comment.user_id && (
                    <div className="comment-actions">
                      <button
                        onClick={() =>
                          handleEditComment(comment.id, comment.content)
                        }
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="delete-btn"
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
