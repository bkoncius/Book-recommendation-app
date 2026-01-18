import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import BookCard from "./BookCard";

export default function BooksGrid() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 12;

  useEffect(() => {
    fetchCategories();
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [selectedCategory, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/books", { params });
      setBooks(response.data.data);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/books/categories");
      setCategories(response.data.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
  };

  const totalPages = Math.ceil(books.length / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const paginatedBooks = books.slice(startIndex, startIndex + booksPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white py-10 text-center">
        <h1 className="text-4xl font-bold">Discover Books</h1>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="bg-white rounded-lg p-5 h-fit">
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Search</h3>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategory === category.id}
                    onChange={() => handleCategoryChange(category.id)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {(searchTerm || selectedCategory) && (
            <button
              className="w-full px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          )}
        </aside>

        <main className="md:col-span-3 bg-white rounded-lg p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-600">
              Loading books...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No books found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 mb-4">
                Showing {startIndex + 1}-
                {Math.min(startIndex + booksPerPage, books.length)} of{" "}
                {books.length} books
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {paginatedBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onBookClick={handleBookClick}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 pt-6 border-t">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
