import { useState, useEffect } from "react";
import api from "../lib/axios";

function BookManager() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category_id: "",
    isbn: "",
    pages: "",
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/books");
      setBooks(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to load books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Book title is required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, formData);
      } else {
        await api.post("/books", formData);
      }
      await fetchBooks();
      setFormData({
        title: "",
        description: "",
        image_url: "",
        category_id: "",
        isbn: "",
        pages: "",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save book");
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      description: book.description || "",
      image_url: book.image_url || "",
      category_id: book.category_id || "",
      isbn: book.isbn || "",
      pages: book.pages || "",
    });
    setEditingId(book.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await api.delete(`/books/${id}`);
        await fetchBooks();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete book");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category_id: "",
      isbn: "",
      pages: "",
    });
    setFormError(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading books...</div>;
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "-";
  };

  return (
    <div className="bg-white rounded-lg  p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Manage Books</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            + Add Book
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? "Edit Book" : "Add New Book"}
          </h3>

          {formError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="e.g., The Great Gatsby"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Book description"
                rows="4"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value
                        ? parseInt(e.target.value)
                        : "",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ISBN
                </label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) =>
                    setFormData({ ...formData, isbn: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 978-0-7432-7356-5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  value={formData.pages}
                  onChange={(e) =>
                    setFormData({ ...formData, pages: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 180"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {books.length === 0 ? (
        <p className="text-center text-gray-600">No books yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Title
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Category
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-2 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {book.title}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {getCategoryName(book.category_id)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {book.description
                      ? book.description.substring(0, 50) + "..."
                      : "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(book)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BookManager;
