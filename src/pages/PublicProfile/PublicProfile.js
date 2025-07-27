// src/pages/PublicProfile/PublicProfile.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

// Helper hook to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PublicProfile = () => {
  const query = useQuery();
  const uid = query.get("uid"); // URL should include ?uid=USER_ID
  const queryName = query.get("name"); // Name passed via QR code link
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uid) {
      const docRef = doc(db, "users", uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          } else {
            setProfileData(null);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching public profile:", error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [uid]);

  // Derive display name:
  // 1. If Firestore has a "name" field, use it.
  // 2. Else if a name was passed in the query parameter, use that.
  // 3. Else, if profileData.email exists, use the email prefix.
  // 4. Otherwise, default to "Unknown".
  const displayName =
    profileData && profileData.name
      ? profileData.name
      : queryName
      ? queryName
      : profileData && profileData.email
      ? profileData.email.split("@")[0]
      : "Unknown";

  if (loading) {
    return (
      <div className="app-container">
        <header>
          <div className="header-text">IntelliQrHelp</div>
        </header>
        <main className="main-content">
          <div className="details-card">
            <h1>Loading Profile...</h1>
          </div>
        </main>
        <footer>
          <div className="footer-logo">IntelliQrHelp</div>
          <div className="footer-text">
            Providing smart emergency healthcare solutions for enhanced safety and quick response.
          </div>
        </footer>
      </div>
    );
  }

  if (!uid || !profileData) {
    return (
      <div className="app-container">
        <header>
          <div className="header-text">IntelliQrHelp</div>
        </header>
        <main className="main-content">
          <div className="details-card">
            <h1>Profile Not Found</h1>
          </div>
        </main>
        <footer>
          <div className="footer-logo">IntelliQrHelp</div>
          <div className="footer-text">
            Providing smart emergency healthcare solutions for enhanced safety and quick response.
          </div>
        </footer>
      </div>
    );
  }

  // Derive other details
  const blood = profileData.bloodGroup || "N/A";
  const allergy =
    profileData.allergies && profileData.allergies.length > 0
      ? profileData.allergies.join(", ")
      : "None";
  const emergency =
    profileData.emergencyContacts && profileData.emergencyContacts.length > 0
      ? `${profileData.emergencyContacts[0].name}: ${profileData.emergencyContacts[0].number}`
      : "None";
  const previous =
    profileData.previousDiseases && profileData.previousDiseases.length > 0
      ? profileData.previousDiseases.join(", ")
      : "None";
  const current =
    profileData.currentMeds && profileData.currentMeds.length > 0
      ? profileData.currentMeds.join(", ")
      : "None";

  return (
    <div className="app-container">
      <style>{`
        /* Reset & Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        :root {
          --container-max-width: 430px;
          --title-size: 1.55rem;
          --heading-size: 1.95rem;
          --label-size: 1.35rem;
          --value-size: 1.35rem;
          --header-padding: 1.25rem;
          --card-padding: 1.5rem;
          --item-spacing: 1.75rem;
          --footer-padding: 1.5rem;
        }
        @media (max-width: 359px) {
          :root {
            --title-size: 1.45rem;
            --heading-size: 1.85rem;
            --label-size: 1.25rem;
            --value-size: 1.25rem;
            --header-padding: 1rem;
            --card-padding: 1.25rem;
            --item-spacing: 1.5rem;
            --footer-padding: 1.25rem;
          }
        }
        @media (min-width: 414px) {
          :root {
            --title-size: 1.65rem;
            --heading-size: 2.05rem;
            --label-size: 1.45rem;
            --value-size: 1.45rem;
            --header-padding: 1.5rem;
            --card-padding: 1.75rem;
            --item-spacing: 1.9rem;
            --footer-padding: 1.75rem;
          }
        }
        body {
          background-color: #F7F8FC;
          min-height: 100vh;
        }
        .app-container {
          width: 100%;
          max-width: var(--container-max-width);
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F7F8FC;
          position: relative;
          overflow: hidden;
        }
        header {
          background: #fff;
          padding: var(--header-padding);
          text-align: center;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          z-index: 2;
        }
        .header-text {
          font-size: var(--title-size);
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: 0.5px;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          padding: 1rem;
          min-height: calc(100vh - 130px);
        }
        .background-circle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: #E1E5FF;
          border-radius: 50%;
          z-index: 0;
        }
        .top-circle {
          top: -150px;
          left: -150px;
        }
        .bottom-circle {
          bottom: -150px;
          right: -150px;
        }
        .details-card {
          background: #fff;
          border-radius: 1.5rem;
          padding: var(--card-padding);
          position: relative;
          z-index: 1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin: 1rem 0;
          width: 100%;
        }
        .details-card h1 {
          font-size: var(--heading-size);
          margin-bottom: var(--item-spacing);
          border-bottom: 2px solid #E1E5FF;
          padding-bottom: 0.75rem;
          color: #000;
          font-weight: 700;
        }
        .detail-item {
          margin-bottom: var(--item-spacing);
        }
        .detail-item:last-child {
          margin-bottom: 0;
        }
        .detail-label {
          font-weight: 700;
          color: #000;
          margin-bottom: 0.5rem;
          font-size: var(--label-size);
        }
        .detail-value {
          color: #1F2937;
          font-size: var(--value-size);
          font-weight: 500;
        }
        footer {
          background: #E5E7EB;
          padding: var(--footer-padding) 1.25rem;
          text-align: center;
          color: #4B5563;
          line-height: 1.6;
          z-index: 2;
        }
        .footer-logo {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.75rem;
          font-size: var(--title-size);
        }
        .footer-text {
          opacity: 0.9;
          font-size: var(--value-size);
        }
      `}</style>
      <header>
        <div className="header-text">IntelliQrHelp</div>
      </header>
      <main className="main-content">
        <div className="background-circle top-circle"></div>
        <div className="background-circle bottom-circle"></div>
        <div className="details-card">
          <h1>Details:</h1>
          <div className="detail-item">
            <div className="detail-label">Name:</div>
            <div className="detail-value">{displayName}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Blood Group:</div>
            <div className="detail-value">{profileData.bloodGroup || "N/A"}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Allergy:</div>
            <div className="detail-value">
              {profileData.allergies && profileData.allergies.length > 0
                ? profileData.allergies.join(", ")
                : "None"}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Emergency Contact:</div>
            <div className="detail-value">
              {profileData.emergencyContacts && profileData.emergencyContacts.length > 0
                ? `${profileData.emergencyContacts[0].name}: ${profileData.emergencyContacts[0].number}`
                : "None"}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Previous Diseases:</div>
            <div className="detail-value">
              {profileData.previousDiseases && profileData.previousDiseases.length > 0
                ? profileData.previousDiseases.join(", ")
                : "None"}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Current Medications:</div>
            <div className="detail-value">
              {profileData.currentMeds && profileData.currentMeds.length > 0
                ? profileData.currentMeds.join(", ")
                : "None"}
            </div>
          </div>
        </div>
      </main>
      <footer>
        <div className="footer-logo">IntelliQrHelp</div>
        <div className="footer-text">
          Providing smart emergency healthcare solutions for enhanced safety and quick response.
        </div>
      </footer>
    </div>
  );
};

export default PublicProfile;
