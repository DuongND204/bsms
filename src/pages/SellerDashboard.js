import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8386';

function SellerDashboard({ currentUser, setCurrentUser }) {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        categoryId: 1,
        price: '',
        stock: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch(`${API_URL}/books`);
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            alert('Unable to load book list!');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_URL}/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Unable to load categories');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        navigate('/');
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const bookData = {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            categoryId: Number(formData.categoryId)
        };

        try {
            if (editingBook) {
                await fetch(`${API_URL}/books/${editingBook.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...bookData, id: editingBook.id })
                });
                alert('Book updated successfully!');
            } else {
                await fetch(`${API_URL}/books`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });
                alert('New book added successfully!');
            }
            fetchBooks();
            resetForm();
        } catch (err) {
            alert('An error occurred!');
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            categoryId: book.categoryId,
            price: book.price,
            stock: book.stock,
            description: book.description,
            image: book.image
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await fetch(`${API_URL}/books/${id}`, {
                    method: 'DELETE'
                });
                alert('Book deleted successfully!');
                fetchBooks();
            } catch (err) {
                alert('An error occurred!');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            categoryId: 1,
            price: '',
            stock: '',
            description: '',
            image: ''
        });
        setEditingBook(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="vh-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ background: '#f8f9fa' }}>
            <nav className="navbar navbar-dark bg-primary shadow-sm">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">
                        <i className="bi bi-shop me-2"></i>
                        Book Management - {currentUser.name}
                    </span>
                    <button className="btn btn-outline-light" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Book List</h2>
                    <button
                        className="btn btn-success btn-lg"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add New Book
                    </button>
                </div>

                {showForm && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <h4 className="card-title mb-3">
                                {editingBook ? 'Update Book' : 'Add New Book'}
                            </h4>
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Book Title</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Author</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Category</label>
                                        <select
                                            className="form-select"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Price (VND)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label">Stock</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="2"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Image Path</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="assets/book.png"
                                    />
                                </div>
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-primary">
                                        {editingBook ? 'Update' : 'Add Book'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <table className="table table-hover bg-white shadow-sm">
                        <thead className="table">
                            <tr>
                                <th>ID</th>
                                <th>Book Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => {
                                const category = categories.find(c => Number(c.id) === Number(book.categoryId));
                                return (
                                    <tr key={book.id}>
                                        <td>{book.id}</td>
                                        <td className="fw-semibold">{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>
                                            <span className="badge bg-info">{category.name}</span>
                                        </td>
                                        <td className="text-danger fw-bold">
                                            {book.price.toLocaleString('vi-VN')}đ
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${book.stock > 10 ? 'bg-success' : 'bg-warning'
                                                    }`}
                                            >
                                                {book.stock}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(book)}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(book.id)}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
