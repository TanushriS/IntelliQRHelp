// src/pages/Register/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [passwordField, setPasswordField] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        emailAddress,
        passwordField
      );
      // Update user profile with the full name
      await updateProfile(userCredential.user, { displayName: fullname });
      alert("Registration successful! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error.message);
    }
  };

  return (
    <div className="register-page">
      {/* Background shapes (only appear on mobile) */}
      <div className="background-shape"></div>
      <div className="background-shape-2"></div>

      {/* Your original container for desktop */}
      <div className="container">
        <div className="form-section">
          <div className="top-nav">
            <Link to="/login">Back to Login</Link>
          </div>
          <div className="brand">IntelliQrHelp</div>
          <h1>Registration Form</h1>
          <p className="form-desc">
            Fill out the form below to create your account. Ensure all information is accurate.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullname">Full Name</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="e.g. John Doe"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="emailAddress">Email Address</label>
              <input
                type="email"
                id="emailAddress"
                name="emailAddress"
                placeholder="e.g. sample@domain.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="passwordField">Password</label>
              <input
                type="password"
                id="passwordField"
                name="passwordField"
                placeholder="••••••••"
                value={passwordField}
                onChange={(e) => setPasswordField(e.target.value)}
                required
              />
            </div>
            <button className="btn-register" type="submit">
              Register Now
            </button>
            <p className="disclaimer">
              By registering, you agree to our terms, conditions, and policies.
              Please review them carefully before submitting your information.
            </p>
          </form>
        </div>

        <div className="image-section">
          <img
            src="/images/doctor.png"
            alt="Doctor illustration"
            className="doctor-illustration"
          />
        </div>
      </div>

      {/* Mobile-only footer with the same style as your login page */}
      <footer className="register-mobile-footer">
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

export default Register;