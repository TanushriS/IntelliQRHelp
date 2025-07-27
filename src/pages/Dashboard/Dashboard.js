// src/pages/Dashboard/Dashboard.js

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- Import Link and useNavigate
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Telegram Bot details for Virtual SOS
const TEST_TELEGRAM_CHAT_ID = process.env.REACT_APP_TELEGRAM_CHAT_ID;
const TELEGRAM_BOT_TOKEN = process.env.REACT_APP_TELEGRAM_BOT_TOKEN;

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  // Mobile menu slider state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User profile state
  const [name, setName] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [previousDiseases, setPreviousDiseases] = useState([]);
  const [currentMeds, setCurrentMeds] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [qrCode, setQrCode] = useState("");

  // For emergency contacts (Card 1)
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactNumber, setNewContactNumber] = useState("");
  const [newContactPhoto, setNewContactPhoto] = useState("");
  const [editingContactIndex, setEditingContactIndex] = useState(null);

  // For Medical Profile (Card 2)
  const [selectedMedicalField, setSelectedMedicalField] = useState(null);
  const [newMedicalEntry, setNewMedicalEntry] = useState("");

  // For QR Code (Cards 5 & 6)
  const [qrCodeSrc, setQrCodeSrc] = useState("https://via.placeholder.com/200?text=No+QR+Generated");
  const [downloadDisabled, setDownloadDisabled] = useState(true);

  // Load user data from Firestore
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.displayName || "");
            setUserDescription(data.userDescription || "");
            setBloodGroup(data.bloodGroup || "");
            setAllergies(data.allergies || []);
            setPreviousDiseases(data.previousDiseases || []);
            setCurrentMeds(data.currentMeds || []);
            setEmergencyContacts(data.emergencyContacts || []);
            setProfilePhoto(data.profilePhoto || "");
            setQrCode(data.qrCode || "");
            if (data.qrCode) {
              setQrCodeSrc(data.qrCode);
              setDownloadDisabled(false);
            }
          } else {
            const defaultData = {
              name: user.displayName || "",
              userDescription: "",
              bloodGroup: "",
              allergies: [],
              previousDiseases: [],
              currentMeds: [],
              emergencyContacts: [],
              profilePhoto: "",
              qrCode: ""
            };
            setDoc(userDocRef, defaultData);
          }
        })
        .catch((error) => {
          console.error("Error loading user data:", error);
        });
    }
  }, [user]);

  // Auto-update QR code when key fields change
  useEffect(() => {
    if (user) {
      handleGenerateQR();
    }
    // eslint-disable-next-line
  }, [bloodGroup, allergies, previousDiseases, currentMeds, emergencyContacts, name]);

  // Helper function to update a field in Firestore
  const updateUserField = async (field, value) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, { [field]: value });
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert(error.message);
    }
  };

  // Handle Profile Image Upload (Card 4)
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result;
        setProfilePhoto(dataUrl);
        await updateUserField("profilePhoto", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Contact Photo Upload
  const handleContactPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewContactPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Card 1: Toggle Add/Edit Contact Form
  const handleToggleAddContactForm = () => {
    setShowAddContactForm((prev) => {
      setEditingContactIndex(null);
      return !prev;
    });
  };

  // Card 1: Save new or edited contact
  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (emergencyContacts.length < 3 || editingContactIndex !== null) {
      let updatedContacts;
      if (editingContactIndex === null) {
        const newContact = {
          name: newContactName,
          number: newContactNumber,
          photo: newContactPhoto || "https://via.placeholder.com/45"
        };
        updatedContacts = [...emergencyContacts, newContact];
      } else {
        updatedContacts = emergencyContacts.map((contact, index) =>
          index === editingContactIndex
            ? { name: newContactName, number: newContactNumber, photo: newContactPhoto || "https://via.placeholder.com/45" }
            : contact
        );
      }
      setEmergencyContacts(updatedContacts);
      await updateUserField("emergencyContacts", updatedContacts);
      setNewContactName("");
      setNewContactNumber("");
      setNewContactPhoto("");
      setEditingContactIndex(null);
      setShowAddContactForm(false);
    } else {
      alert("Maximum 3 contacts allowed.");
    }
  };

  // Card 1: Delete a contact
  const handleDeleteContact = async (index) => {
    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updatedContacts);
    await updateUserField("emergencyContacts", updatedContacts);
  };

  // Card 1: Edit an existing contact
  const handleEditExistingContact = (index) => {
    const contact = emergencyContacts[index];
    setEditingContactIndex(index);
    setNewContactName(contact.name);
    setNewContactNumber(contact.number);
    setNewContactPhoto(contact.photo);
    setShowAddContactForm(true);
  };

  // Card 2: Select a Medical Profile Field
  const handleSelectMedicalField = (field) => {
    setSelectedMedicalField(field);
    if (field === "defaultEmergencyContact") {
      setNewMedicalEntry(emergencyContacts.length > 0 ? emergencyContacts[0].number : "None");
    } else {
      setNewMedicalEntry("");
    }
  };

  // Card 2: Add new entry for the selected field
  const handleAddMedicalEntry = async () => {
    if (selectedMedicalField === "bloodGroup") return;
    if (selectedMedicalField === "allergies") {
      const updatedList = Array.isArray(allergies) ? [...allergies, newMedicalEntry] : [newMedicalEntry];
      setAllergies(updatedList);
      await updateUserField("allergies", updatedList);
    } else if (selectedMedicalField === "previousDiseases") {
      const updatedList = Array.isArray(previousDiseases) ? [...previousDiseases, newMedicalEntry] : [newMedicalEntry];
      setPreviousDiseases(updatedList);
      await updateUserField("previousDiseases", updatedList);
    } else if (selectedMedicalField === "currentMeds") {
      const updatedList = Array.isArray(currentMeds) ? [...currentMeds, newMedicalEntry] : [newMedicalEntry];
      setCurrentMeds(updatedList);
      await updateUserField("currentMeds", updatedList);
    }
    setNewMedicalEntry("");
  };

  // Card 2: Remove an entry from the selected field
  const handleRemoveMedicalEntry = async (index) => {
    let updatedList;
    if (selectedMedicalField === "allergies") {
      updatedList = Array.isArray(allergies) ? allergies.filter((_, i) => i !== index) : [];
      setAllergies(updatedList);
      await updateUserField("allergies", updatedList);
    } else if (selectedMedicalField === "previousDiseases") {
      updatedList = Array.isArray(previousDiseases)
        ? previousDiseases.filter((_, i) => i !== index)
        : [];
      setPreviousDiseases(updatedList);
      await updateUserField("previousDiseases", updatedList);
    } else if (selectedMedicalField === "currentMeds") {
      updatedList = Array.isArray(currentMeds)
        ? currentMeds.filter((_, i) => i !== index)
        : [];
      setCurrentMeds(updatedList);
      await updateUserField("currentMeds", updatedList);
    }
  };

  // Card 3: Virtual SOS Button – sends a fixed Telegram message
  const sendTestSosNotification = async () => {
    const token = TELEGRAM_BOT_TOKEN;
    const chatId = TEST_TELEGRAM_CHAT_ID;
    const message = encodeURIComponent("SOS! Help me, I am in danger!");
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;
    console.log("Sending SOS to URL:", url);
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Telegram API response:", data);
      if (data.ok) {
        // Successfully sent
      } else {
        alert("Failed to send notification: " + data.description);
      }
    } catch (error) {
      console.error("Error sending SOS:", error);
      alert("Error sending SOS notification.");
    }
  };

  // Cards 5 & 6: QR Code Generation and Download
  const handleGenerateQR = async () => {
    if (!user) return;
    const publicProfileUrl = `${process.env.REACT_APP_PUBLIC_URL}/public-profile?uid=${user.uid}&name=${encodeURIComponent(name || user.displayName || "")}`;
    const newQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      publicProfileUrl
    )}`;
    console.log("Public Profile URL:", publicProfileUrl);
    console.log("QR Code URL:", newQrUrl);
    setQrCodeSrc(newQrUrl);
    setQrCode(newQrUrl);
    await updateUserField("qrCode", newQrUrl);
    setDownloadDisabled(false);
  };

  const handleDownloadQR = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(qrCodeSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my_qr_code.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  // Card 4: Edit Details – update description, blood group, and name
  const handleEditDetailsSubmit = async (e) => {
    e.preventDefault();
    const newDesc = e.target.userDescription.value;
    const newBG = e.target.bloodGroup.value;
    const newName = e.target.fullName.value;
    setUserDescription(newDesc);
    setBloodGroup(newBG);
    setName(newName);
    await updateUserField("userDescription", newDesc);
    await updateUserField("bloodGroup", newBG);
    await updateUserField("name", newName);
    alert("Details updated.");
    handleGenerateQR();
  };

  // Inline styles, including the left-side mobile slider with centered items
  const inlineStyles = `
    /* RESET & BASE */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background-color: #E5EAEF; color: #333; }
    a { text-decoration: none; color: inherit; }

    /* HEADER */
    header {
      width: 100%;
      padding: 0.75rem 2rem;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #ddd;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: 700;
    }
    .header-right {
      display: flex;
      align-items: center;
    }
    .logout-btn {
      background-color: #5865F2;
      color: #fff;
      border: none;
      padding: 0.5rem 1.2rem;
      border-radius: 20px;
      font-size: 0.9rem;
      cursor: pointer;
    }
    .logout-btn:hover { opacity: 0.9; }

    /* HAMBURGER MENU ICON */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 25px;
      height: 20px;
      cursor: pointer;
    }
    .hamburger span {
      display: block;
      height: 3px;
      background: #333;
      border-radius: 3px;
    }

    /* MOBILE NAVIGATION SLIDER (LEFT) */
    .mobile-nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 250px;
      height: 100vh;
      background-color: #fff;
      box-shadow: 2px 0 6px rgba(0,0,0,0.2);
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      z-index: 1000;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .mobile-nav.open {
      transform: translateX(0);
    }
    .mobile-nav .close-btn {
      font-size: 1.5rem;
      cursor: pointer;
      margin-bottom: 1rem;
      align-self: flex-end;
    }
    .mobile-nav ul {
      list-style: none;
      padding: 0;
      width: 100%;
      text-align: center;
    }
    .mobile-nav li {
      margin: 1rem 0;
      font-size: 1.1rem;
    }

    /* CONTAINER GRID */
    .container {
      width: 95%;
      max-width: 1200px;
      margin: 2rem auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      background: #E4E9ED;
    }
    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
      }
    }

    /* CARD BASE */
    .card {
      background-color: #fff;
      border-radius: 8px;
      padding: 1rem 1.2rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .card h2 {
      margin-bottom: 0.8rem;
      font-weight: 600;
    }

    /* CARD 1: USER PROFILE */
    #card1 {
      display: flex;
      flex-direction: column;
    }
    #card1-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }
    #card1-header img {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 0.8rem;
    }
    #card1-desc {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 1rem;
      color: #666;
    }
    #card1-separator {
      width: 100%;
      height: 1px;
      background-color: #ccc;
      margin: 0.8rem 0;
    }
    .emergency-contact {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    .contact-info {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .contact-info img {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      margin-right: 1rem;
    }
    .contact-text {
      display: flex;
      flex-direction: column;
      font-size: 0.9rem;
      line-height: 1.3;
    }
    .chevron {
      font-size: 1rem;
      color: #999;
      margin-left: 0.5rem;
      cursor: pointer;
    }
    .add-contact-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .add-contact-btn:hover {
      opacity: 0.9;
    }
    .contact-form {
      margin-top: 1rem;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .contact-form input {
      width: 100%;
      padding: 0.4rem;
      margin-bottom: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .contact-form button {
      padding: 0.4rem 0.8rem;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .contact-form button:hover {
      opacity: 0.9;
    }

    /* CARD 2: MEDICAL PROFILE */
    #card2 {
      display: flex;
      flex-direction: column;
    }
    .medical-boxes {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .medical-box-btn {
      background-color: #fefefe;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 0.8rem;
      cursor: pointer;
      font-size: 0.9rem;
      color: #333;
      text-align: center;
      font-weight: 600;
    }
    .medical-box-btn:hover {
      background-color: #f3f3f3;
    }
    .medical-list {
      margin-top: 1rem;
    }
    .medical-list h4 {
      margin-bottom: 0.5rem;
    }
    .medical-list ul {
      list-style: none;
      padding-left: 0;
    }
    .medical-list li {
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .medical-list button {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
    }
    .default-contact-view {
      font-size: 0.9rem;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
    }

    /* CARD 3: VIRTUAL SOS BUTTON */
    #card3 {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #ff4d4d, #ff1a1a);
      border-radius: 8px;
      color: #fff;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    #card3 h2 {
      color: #fff;
      margin-bottom: 1rem;
    }
    .sos-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sos-section button {
      background-color: #fff;
      color: #ff1a1a;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .sos-section button:hover {
      transform: scale(1.05);
    }

    /* CARD 4: EDIT DETAILS */
    #card4 form {
      display: flex;
      flex-direction: column;
    }
    #card4 label {
      font-weight: 600;
      margin-top: 0.8rem;
      display: block;
    }
    #card4 input, #card4 textarea {
      margin-top: 0.3rem;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 100%;
    }
    #card4 input[type="file"] {
      border: none;
    }
    #card4 input:focus, #card4 textarea:focus {
      outline: none;
      border-color: #007bff;
    }
    #card4 button {
      margin-top: 1rem;
      background-color: #007bff;
      color: #fff;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      align-self: flex-start;
    }
    #card4 button:hover {
      opacity: 0.9;
    }

    /* CARD 5: DOWNLOAD QR CODE */
    #card5 {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #d1e7dd, #bcd0c7);
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    #card5 h2 {
      margin-bottom: 1rem;
    }
    #card5 p.download-instructions {
      font-size: 1rem;
      margin-bottom: 1rem;
      text-align: center;
      color: #333;
    }
    #card5 button {
      background-color: #0d6efd;
      color: #fff;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s, transform 0.2s;
    }
    #card5 button:hover {
      background-color: #0b5ed7;
      transform: scale(1.05);
    }

    /* CARD 6: DISPLAY GENERATED QR */
    #card6 {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    #card6 h3 {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 10px;
    }
    #card6 img {
      max-width: 80%;
      height: auto;
      display: block;
      border: 2px solid #ccc;
      border-radius: 8px;
    }

    /* FOOTER */
    footer {
      background-color: #F5F8FD;
      padding: 2rem 2rem;
      margin-top: 2rem;
    }
    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .footer-container {
        grid-template-columns: 1fr;
      }
    }

    /* Show hamburger icon on small screens */
    @media (max-width: 600px) {
      .hamburger {
        display: flex;
      }
    }
  `;

  return (
    <div className="dashboard">
      <style>{inlineStyles}</style>

      {/* HEADER */}
      <header className="header">
        {/* Left side: Hamburger + Brand */}
        <div className="header-left">
          <div className="hamburger" onClick={() => setMobileMenuOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="logo">IntelliQrHelp</div>
        </div>

        {/* Right side: Log out button */}
        <div className="header-right">
          <button className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {/* Mobile Navigation Slider (slides in from LEFT) */}
      <div className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}>
        <div className="close-btn" onClick={() => setMobileMenuOpen(false)}>
          &times;
        </div>
        <ul>
          {/* HOME now navigates to /home */}
          <li>
            <Link to="/home" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
          </li>
          <li>
            <a href="#" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
          </li>
        </ul>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="container">
        {/* CARD 1: USER PROFILE */}
        <div className="card" id="card1">
          <h2>User Profile</h2>
          <div id="card1-header">
            <img
              src={
                profilePhoto ||
                (user && user.photoURL ? user.photoURL : "https://via.placeholder.com/50")
              }
              alt="User DP"
            />
            <div>
              <strong>{name || "User"}</strong>
            </div>
          </div>
          <div id="card1-desc">
            {userDescription || "No description provided."}
          </div>
          <div id="card1-separator"></div>
          <h3>Emergency Contacts</h3>
          {emergencyContacts.length === 0 ? (
            <p>No contacts added yet.</p>
          ) : (
            emergencyContacts.map((contact, index) => (
              <div className="emergency-contact" key={index}>
                <div className="contact-info">
                  <img src={contact.photo} alt={`Contact ${index + 1}`} />
                  <div className="contact-text">
                    <strong>{contact.name}</strong>
                    <span>{contact.number}</span>
                  </div>
                </div>
                <div>
                  <span
                    className="chevron"
                    onClick={() => handleEditExistingContact(index)}
                  >
                    &#10095;
                  </span>
                  <button
                    onClick={() => handleDeleteContact(index)}
                    style={{
                      marginLeft: "5px",
                      fontSize: "0.8rem",
                      background: "none",
                      border: "none",
                      color: "#dc3545",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
          {emergencyContacts.length < 3 && (
            <button className="add-contact-btn" onClick={handleToggleAddContactForm}>
              {showAddContactForm ? "Cancel" : "Add Contact"}
            </button>
          )}
          {showAddContactForm && (
            <div className="contact-form">
              <input
                type="text"
                placeholder="Contact Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={newContactNumber}
                onChange={(e) => setNewContactNumber(e.target.value)}
              />
              <input type="file" accept="image/*" onChange={handleContactPhotoChange} />
              <button onClick={handleSaveContact}>Save Contact</button>
            </div>
          )}
        </div>

        {/* CARD 2: MEDICAL PROFILE (Editable Lists) */}
        <div className="card" id="card2">
          <h2>Medical Profile</h2>
          <div className="medical-boxes">
            <button
              className="medical-box-btn"
              onClick={() => handleSelectMedicalField("allergies")}
            >
              Allergies
            </button>
            <button
              className="medical-box-btn"
              onClick={() => handleSelectMedicalField("defaultEmergencyContact")}
            >
              Default Contact
            </button>
            <button
              className="medical-box-btn"
              onClick={() => handleSelectMedicalField("previousDiseases")}
            >
              Previous Diseases
            </button>
            <button
              className="medical-box-btn"
              onClick={() => handleSelectMedicalField("currentMeds")}
            >
              Current Medications
            </button>
          </div>
          {selectedMedicalField && (
            <div className="medical-list">
              <h4>
                {selectedMedicalField.charAt(0).toUpperCase() +
                  selectedMedicalField.slice(1)}
              </h4>
              {selectedMedicalField === "defaultEmergencyContact" ? (
                <div className="default-contact-view">
                  Default Contact:{" "}
                  {emergencyContacts.length > 0 ? emergencyContacts[0].number : "None"}
                </div>
              ) : (
                <>
                  <ul>
                    {(
                      selectedMedicalField === "allergies"
                        ? Array.isArray(allergies)
                          ? allergies
                          : []
                        : selectedMedicalField === "previousDiseases"
                        ? Array.isArray(previousDiseases)
                          ? previousDiseases
                          : []
                        : selectedMedicalField === "currentMeds"
                        ? Array.isArray(currentMeds)
                          ? currentMeds
                          : []
                        : []
                    ).map((item, idx) => (
                      <li key={idx}>
                        {item}
                        <button onClick={() => handleRemoveMedicalEntry(idx)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="contact-form">
                    <input
                      type="text"
                      placeholder={`Add new ${selectedMedicalField}`}
                      value={newMedicalEntry}
                      onChange={(e) => setNewMedicalEntry(e.target.value)}
                    />
                    <button onClick={handleAddMedicalEntry}>Add</button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* CARD 3: VIRTUAL SOS BUTTON */}
        <div className="card" id="card3">
          <h2>Virtual SOS Button</h2>
          <div className="sos-section">
            <button id="testSosBtn" onClick={sendTestSosNotification}>
              SOS
            </button>
          </div>
        </div>

        {/* CARD 4: EDIT DETAILS */}
        <div className="card" id="card4">
          <h2>Edit Details</h2>
          <form id="editForm" onSubmit={handleEditDetailsSubmit}>
            <label htmlFor="fullName">Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter full name"
              defaultValue={name}
            />
            <label htmlFor="profileImage">Profile Image</label>
            <input type="file" id="profileImage" accept="image/*" onChange={handleProfileImageChange} />
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input type="tel" id="mobileNumber" placeholder="Enter mobile number" />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter email"
              defaultValue={user && user.email ? user.email : ""}
              readOnly
            />
            <label htmlFor="bloodGroup">Blood Group</label>
            <input
              type="text"
              id="bloodGroup"
              placeholder="Enter your blood group"
              defaultValue={bloodGroup}
            />
            <label htmlFor="userDescription">Description</label>
            <textarea
              id="userDescription"
              defaultValue={userDescription}
              placeholder="Enter your description"
            ></textarea>
            <button type="submit">Update Details</button>
          </form>
        </div>

        {/* CARD 5: DOWNLOAD QR CODE */}
        <div className="card" id="card5">
          <h2>Download Your QR Code</h2>
          <p className="download-instructions">
            Your personalized emergency QR code is generated from your medical profile.
            Click below to download it.
          </p>
          <button
            type="button"
            id="downloadBtn"
            onClick={
              qrCodeSrc.includes("No+QR+Generated") ? handleGenerateQR : handleDownloadQR
            }
          >
            {qrCodeSrc.includes("No+QR+Generated") ? "Generate QR Code" : "Download QR Code"}
          </button>
        </div>

        {/* CARD 6: DISPLAY GENERATED QR */}
        <div className="card" id="card6">
          <h3>Your QR</h3>
          {qrCodeSrc.includes("No+QR+Generated") ? (
            <p>QR Code not generated yet.</p>
          ) : (
            <img id="qrDisplay" src={qrCodeSrc} alt="Generated QR" />
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-container">
          <div className="footer-column">
            <h3>IntelliQrHelp</h3>
            <p>
              Providing smart emergency healthcare solutions for enhanced safety
              and quick response.
            </p>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-list">
              <li>
                <a href="#">Home</a>
              </li>
              <li>
                <a href="#">Features</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <ul className="footer-list">
              <li>
                <a href="#">Resources</a>
              </li>
              <li>
                <a href="#">User Guide</a>
              </li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-list">
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

// email ?
// harshita6097@gmail.com