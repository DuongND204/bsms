import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8386';

function BuyerDashboard({ currentUser, setCurrentUser, cart, setCart }) {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

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

    const addToCart = (book) => {
        const existingItem = cart.find(item => item.bookId === book.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.bookId === book.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                bookId: book.id,
                title: book.title,
                price: book.price,
                quantity: 1,
                image: book.image
            }]);
        }
        alert('Added to cart!');
    };

    const filteredBooks = books.filter(book => {
        const matchCategory = selectedCategory === 'all' || book.categoryId === Number(selectedCategory);
        const matchSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

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
            <nav className="navbar navbar-dark bg-success shadow-sm">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">
                        <i className="bi bi-book-fill me-2"></i>
                        Book Store - {currentUser.name}
                    </span>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-light position-relative"
                            onClick={() => navigate('/cart')}
                        >
                            <i className="bi bi-cart3"></i>
                            {cart.length > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cart.length}
                                </span>
                            )}
                        </button>
                        <button
                            className="btn btn-outline-light"
                            onClick={() => navigate('/orders')}
                        >
                            <i className="bi bi-receipt me-2"></i>
                            Orders
                        </button>
                        <button className="btn btn-outline-light" onClick={handleLogout}>
                            <i className="bi bi-box-arrow-right me-2"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container py-4">
                <div className="row mb-4">
                    <div className="col-md-8">
                        <input
                            type="text"
                            className="form-control form-control-lg"
                            placeholder="Search for books by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-select form-select-lg"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredBooks.map(book => {
                        const category = categories.find(c => Number(c.id) === Number(book.categoryId));
                        return (
                            <div key={book.id} className="col-md-6 col-lg-4 col-xl-3">
                                <div className="card h-100 shadow-sm" style={{ transition: 'transform 0.2s' }}>
                                    {book.image ? (
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                            style={{ height: '200px' }}
                                        >
                                            <i className="bi bi-book" style={{ fontSize: '80px', color: '#ccc' }}></i>
                                        </div>
                                    )}

                                    <div className="card-body d-flex flex-column">
                                        <span className="badge bg-info mb-2 align-self-start">{category?.name}</span>
                                        <h5 className="card-title">{book.title}</h5>
                                        <p className="text-muted small mb-2">
                                            <i className="bi bi-person me-1"></i>
                                            {book.author}
                                        </p>
                                        <p className="card-text small text-secondary flex-grow-1">
                                            {book.description}
                                        </p>
                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                            <span className="text-danger fw-bold fs-5">
                                                {book.price.toLocaleString('vi-VN')}₫
                                            </span>
                                            <span className="badge bg-secondary">
                                                Stock: {book.stock}
                                            </span>
                                        </div>
                                        <button
                                            className="btn btn-success w-100 mt-3"
                                            onClick={() => addToCart(book)}
                                            disabled={book.stock === 0}
                                        >
                                            <i className="bi bi-cart-plus me-2"></i>
                                            {book.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {filteredBooks.length === 0 && (
                    <div className="text-center py-5">
                        <i className="bi bi-search" style={{ fontSize: '64px', color: '#ccc' }}></i>
                        <p className="text-muted mt-3">No books found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuyerDashboard;
