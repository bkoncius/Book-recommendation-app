import { useState, useEffect } from 'react';
import axios from 'axios';
import './Books.css';

const Books = ({ user }) => {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [filters, setFilters] = useState({ categoryId: '', search: '' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        description: '',
        category_id: '',
        cover_image_url: '',
        published_date: ''
    });

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchCategories();
        fetchBooks();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchBooks();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const { categoryId, search } = filters;
            let url = 'http://localhost:5000/api/books?';
            if (categoryId) url += `category=${categoryId}&`;
            if (search) url += `search=${search}`;

            const response = await axios.get(url);
            setBooks(response.data);
        } catch (err) {
            setError('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            if (editingBook) {
                await axios.put(
                    `http://localhost:5000/api/books/${editingBook.id}`,
                    formData,
                    config
                );
                setMessage('Book updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/books', formData, config);
                setMessage('Book added successfully!');
            }

            resetForm();
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            description: book.description || '',
            category_id: book.category_id || '',
            cover_image_url: book.cover_image_url || '',
            published_date: book.published_date ? book.published_date.split('T')[0] : ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            await axios.delete(`http://localhost:5000/api/books/${id}`, config);
            setMessage('Book deleted successfully!');
            setDeleteConfirm(null);
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete book');
            setDeleteConfirm(null);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingBook(null);
        setFormData({
            title: '',
            author: '',
            description: '',
            category_id: '',
            cover_image_url: '',
            published_date: ''
        });
        setError('');
    };

    return (
        <div className="books-container">
            <div className="books-header">
                <h1>Explore Books</h1>

                <div className="search-filter-bar">
                    <input
                        type="text"
                        placeholder="Search by title, author, or description..."
                        className="search-input"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                    <select
                        className="filter-select"
                        value={filters.categoryId}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        + Add Book
                    </button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            {loading ? (
                <div className="no-data">Loading books...</div>
            ) : (
                <div className="books-grid">
                    {books.length === 0 ? (
                        <div className="no-data">No books found matching your criteria.</div>
                    ) : (
                        books.map(book => (
                            <div key={book.id} className="book-card">
                                <div className="book-cover">
                                    {book.cover_image_url ? (
                                        <img src={book.cover_image_url} alt={book.title} />
                                    ) : (
                                        <div className="no-cover">
                                            <span>📖</span>
                                            <p>No Cover</p>
                                        </div>
                                    )}
                                </div>
                                <div className="book-info">
                                    <span className="book-category">{book.category_name || 'Uncategorized'}</span>
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-author">by {book.author}</p>
                                    <p className="book-description">{book.description}</p>

                                    <div className="book-footer">
                                        <button className="btn btn-logout" style={{ marginTop: 0, padding: '0.4rem 0.8rem' }}>
                                            View Details
                                        </button>
                                        {isAdmin && (
                                            <div className="admin-actions">
                                                <button className="btn-icon" onClick={() => handleEdit(book)}>✏️</button>
                                                <button className="btn-icon delete" onClick={() => setDeleteConfirm(book)}>🗑️</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={resetForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Book Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Author *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.author}
                                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Cover Image URL</label>
                                <input
                                    type="text"
                                    value={formData.cover_image_url}
                                    onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingBook ? 'Update' : 'Add Book'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Confirm Delete</h2>
                        <p>Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?</p>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent)' }} onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Books;
