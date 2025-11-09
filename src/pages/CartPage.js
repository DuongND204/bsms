import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8386';

function CartPage({ currentUser, setCurrentUser, cart, setCart }) {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const updateQuantity = (bookId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(bookId);
    } else {
      setCart(cart.map(item =>
        item.bookId === bookId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeItem = (bookId) => {
    setCart(cart.filter(item => item.bookId !== bookId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        userId: currentUser.id,
        items: cart.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalAmount(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const order = await orderResponse.json();

      const billData = {
        orderId: order.id,
        userId: currentUser.id,
        totalAmount: getTotalAmount(),
        paymentMethod: paymentMethod,
        isPaid: false,
        createdAt: new Date().toISOString()
      };

      await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData)
      });

      for (const item of cart) {
        const bookResponse = await fetch(`${API_URL}/books/${item.bookId}`);
        const book = await bookResponse.json();

        await fetch(`${API_URL}/books/${item.bookId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: book.stock - item.quantity })
        });
      }

      alert('Order placed successfully!');
      setCart([]);
      navigate('/orders');
    } catch (err) {
      alert('An error occurred while placing your order!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ background: '#f8f9fa' }}>
      <nav className="navbar navbar-dark bg-success shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-cart3 me-2"></i>
            Shopping Cart
          </span>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/buyer')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Continue Shopping
            </button>
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/orders')}
            >
              <i className="bi bi-receipt"></i>
            </button>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {cart.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-cart-x" style={{ fontSize: '80px', color: '#ccc' }}></i>
            <h3 className="mt-3 text-muted">Your cart is empty</h3>
            <button 
              className="btn btn-success mt-3"
              onClick={() => navigate('/buyer')}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Items in Cart ({cart.length})</h5>
                </div>
                <div className="card-body p-0">
                  {cart.map(item => (
                    <div key={item.bookId} className="border-bottom p-3">
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          <h6 className="mb-1">{item.title}</h6>
                          <p className="text-danger fw-bold mb-0">
                            {item.price.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <div className="col-md-4">
                          <div className="input-group">
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                            >
                              <i className="bi bi-dash"></i>
                            </button>
                            <input 
                              type="number" 
                              className="form-control text-center"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.bookId, parseInt(e.target.value) || 0)}
                              min="1"
                            />
                            <button 
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                            >
                              <i className="bi bi-plus"></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(item.bookId)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Checkout</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Payment Method</label>
                    <select 
                      className="form-select"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit Card</option>
                      <option value="transfer">Bank Transfer</option>
                    </select>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{getTotalAmount().toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Shipping Fee:</span>
                    <span className="text-success">Free</span>
                  </div>
                  
                  <hr />
                  
                  <div className="d-flex justify-content-between mb-3">
                    <h5>Total:</h5>
                    <h5 className="text-danger">{getTotalAmount().toLocaleString('vi-VN')}₫</h5>
                  </div>
                  
                  <button 
                    className="btn btn-success w-100 btn-lg"
                    onClick={handleCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
