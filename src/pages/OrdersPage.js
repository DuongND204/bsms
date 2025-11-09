import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8386';

function OrdersPage({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const fetchData = async () => {
    try {
      const [ordersRes, billsRes, booksRes] = await Promise.all([
        fetch(`${API_URL}/orders?userId=${currentUser.id}`),
        fetch(`${API_URL}/bills?userId=${currentUser.id}`),
        fetch(`${API_URL}/books`)
      ]);

      const ordersData = await ordersRes.json();
      const billsData = await billsRes.json();
      const booksData = await booksRes.json();

      setOrders(ordersData);
      setBills(billsData);
      setBooks(booksData);
    } catch (err) {
      alert('Unable to load orders list!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  const getOrderDetails = (order) => {
    const bill = bills.find(b => b.orderId === order.id);
    return { ...order, bill };
  };

  const getBookTitle = (bookId) => {
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'N/A';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'warning', text: 'Pending' },
      completed: { bg: 'success', text: 'Completed' },
      cancelled: { bg: 'danger', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge bg-${badge.bg}`}>{badge.text}</span>;
  };

  const getPaymentMethod = (method) => {
    const methods = {
      cash: 'Cash',
      card: 'Credit Card',
      transfer: 'Bank Transfer'
    };
    return methods[method] || method;
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
            <i className="bi bi-receipt me-2"></i>
            My Orders
          </span>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate(currentUser.role === 'seller' ? '/seller' : '/buyer')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <h3 className="mb-4">Order History</h3>

        {orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '80px', color: '#ccc' }}></i>
            <h4 className="mt-3 text-muted">No orders yet</h4>
            <button 
              className="btn btn-success mt-3"
              onClick={() => navigate('/buyer')}
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map(order => {
              const orderDetails = getOrderDetails(order);
              return (
                <div key={order.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Order #{order.id}</h6>
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleString('en-GB')}
                        </small>
                      </div>
                      <div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-borderless mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Product</th>
                              <th className="text-center">Quantity</th>
                              <th className="text-end">Price</th>
                              <th className="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={index}>
                                <td>{getBookTitle(item.bookId)}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end">{item.price.toLocaleString('vi-VN')}₫</td>
                                <td className="text-end fw-bold">
                                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <hr />

                      <div className="row">
                        <div className="col-md-6">
                          {orderDetails.bill && (
                            <div>
                              <p className="mb-1">
                                <strong>Payment Method:</strong> {getPaymentMethod(orderDetails.bill.paymentMethod)}
                              </p>
                              <p className="mb-1">
                                <strong>Payment Status:</strong>{' '}
                                {orderDetails.bill.isPaid ? (
                                  <span className="badge bg-success">Paid</span>
                                ) : (
                                  <span className="badge bg-warning">Unpaid</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="col-md-6 text-md-end">
                          <h5 className="mb-0">
                            Total: <span className="text-danger">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
