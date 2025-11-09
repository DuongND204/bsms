import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8386';

function LoginPage({ setCurrentUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length > 0) {
        const user = users[0];
        setCurrentUser(user);
        if (user.role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/buyer');
        }
      } else {
        setError('Incorrect email or password!');
      }
    } catch (err) {
      setError('Cannot connect to the server! Please make sure json-server is running on port 8386.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div className="card shadow-lg" style={{ width: '450px', borderRadius: '15px' }}>
        <div className="card-body p-5">
          <h2 className="text-center mb-4 fw-bold text-primary">
            <i className="bi bi-book-fill me-2"></i>
            Book Store
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <button type="submit" className="btn btn-primary w-100 btn-lg mt-3" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
          <div className="mt-4 p-3 bg-light rounded">
            <p className="mb-2 fw-semibold">Demo accounts:</p>
            <small className="d-block">Seller: KhongMinh@book.com / 123456</small>
            <small className="d-block">Customer: TuMaY@book.com / 123456</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
