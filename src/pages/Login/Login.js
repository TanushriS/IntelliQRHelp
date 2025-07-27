// src/pages/Login.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Attempt to sign in the user with the provided email and password.
      await signInWithEmailAndPassword(auth, emailOrPhone, password);
      // Redirect the user to the dashboard after a successful login.
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="background-shape"></div>
      <div className="background-shape-2"></div>
      <div className="login-container">
        <div className="top-bar">
          <div className="brand">IntelliQrHelp</div>
          <Link to="/" className="back-button">
            Back to Home
          </Link>
        </div>
        <div className="login-form">
          <h1>Login</h1>
          <p className="subheading">
            Log in to access your emergency response dashboard securely.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrPhone">Email or Phone number</label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                placeholder="example@example.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="forgot-password">
              <a href="/forgot-password">Forgot password?</a>
            </div>
            <button type="submit" className="sign-in-button">
              Sign in
            </button>
          </form>
          <div className="social-login">
            <img src="/images/google.png" alt="Login with Google" />
            <img src="/images/apple.png" alt="Login with Apple" />
          </div>
          <p className="footer-text">
            New to IntelliQrHelp? Create an account now.
          </p>
          <Link to="/register" className="sign-up-button">
            Sign Up
          </Link>
        </div>
      </div>
      <footer className="login-footer">
        <div className="footer-content">
          <p>&copy; 2025 IntelliQrHelp. All rights reserved.</p>
          <ul className="footer-links">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Login;