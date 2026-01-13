import { useState, useEffect } from 'react';
import axios from 'axios';
import './Categories.css';

const Categories = ({ user }) => {
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (err) {
            setError('Failed to load categories');
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
            if (editingCategory) {
                await axios.put(
                    `http://localhost:5000/api/categories/${editingCategory.id}`,
                    formData,
                    config
                );
                setMessage('Category updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/categories', formData, config);
                setMessage('Category created successfully!');
            }

            setFormData({ name: '', description: '' });
            setShowForm(false);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setShowForm(true);
        setError('');
        setMessage('');
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        try {
            await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
            setMessage('Category deleted successfully!');
            setDeleteConfirm(null);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete category');
            setDeleteConfirm(null);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '' });
        setError('');
    };

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1>Book Categories</h1>
                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        + Add Category
                    </button>
                )}
            </div>

            {error && <div className="error-msg">{error}</div>}
            {message && <div className="success-msg">{message}</div>}

            {showForm && isAdmin && (
                <div className="modal-overlay" onClick={cancelForm}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="name">Category Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Science Fiction"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional description..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={cancelForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content delete-confirm" onClick={(e) => e.stopPropagation()}>
                        <h2>⚠️ Confirm Delete</h2>
                        <p>Are you sure you want to delete the category <strong>"{deleteConfirm.name}"</strong>?</p>
                        <p className="warning-text">This action cannot be undone.</p>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="categories-grid">
                {categories.length === 0 ? (
                    <p className="no-data">No categories yet. {isAdmin && 'Add your first category!'}</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="category-card">
                            <h3>{category.name}</h3>
                            {category.description && <p>{category.description}</p>}
                            {isAdmin && (
                                <div className="card-actions">
                                    <button className="btn-icon" onClick={() => handleEdit(category)} title="Edit">
                                        ✏️
                                    </button>
                                    <button className="btn-icon" onClick={() => setDeleteConfirm(category)} title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Categories;
