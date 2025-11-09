import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import LoginPage from './pages/LoginPage';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedCart = localStorage.getItem('cart');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            currentUser ? (
              currentUser.role === 'seller' ? 
              <Navigate to="/seller" /> : 
              <Navigate to="/buyer" />
            ) : (
              <LoginPage setCurrentUser={setCurrentUser} />
            )
          } 
        />
        <Route 
          path="/seller" 
          element={
            currentUser?.role === 'seller' ? 
            <SellerDashboard currentUser={currentUser} setCurrentUser={setCurrentUser} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/buyer" 
          element={
            currentUser?.role === 'buyer' ? 
            <BuyerDashboard currentUser={currentUser} setCurrentUser={setCurrentUser} cart={cart} setCart={setCart} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/cart" 
          element={
            currentUser?.role === 'buyer' ? 
            <CartPage currentUser={currentUser} setCurrentUser={setCurrentUser} cart={cart} setCart={setCart} /> : 
            <Navigate to="/" />
          } 
        />
        <Route 
          path="/orders" 
          element={
            currentUser ? 
            <OrdersPage currentUser={currentUser} setCurrentUser={setCurrentUser} /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;