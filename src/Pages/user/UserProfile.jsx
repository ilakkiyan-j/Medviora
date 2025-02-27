import Navbar from "./components/NavBar";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import ToggleButton from "./components/ToggleButton";
import { AiOutlineCustomerService } from "react-icons/ai";
import { BiDownload } from "react-icons/bi";

import "./UserProfile.css";

export default function Profile() {
    const navigate = useNavigate();
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("darkMode") === "true");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }, [darkMode]);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5000/logout", {
                method: "POST",
                credentials: "include",
            });
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const newMode = !prev;
            localStorage.setItem("darkMode", newMode);
            return newMode;
        });
    };

    const handleToggleVisibility = async () => {
        try {
            console.log("Toggling visibility...");
            setShowPopup(true);
            setTimeout(() => {
                console.log("Hiding popup and logging out...");
                setShowPopup(false);
                handleLogout();
            }, 2000);
        } catch (error) {
            console.error("Error updating visibility:", error);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await axios.get("http://localhost:5000/users/details", {
                    withCredentials: true,
                });
                setDetails(response.data.details || {});
            } catch (error) {
                console.error("Error fetching details:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    if (loading) return <p className="loading-text">Loading profile...</p>;
    if (error) return <p className="error-text">Error loading profile. <button onClick={() => window.location.reload()}>Retry</button></p>;

    return (
        <>
            <Navbar />
            <div className="profile-container">
                <div className="profile-content">
                    <div className="grid-1">
                        <div className="grid-2">
                            <div className="profile-card">
                                <h2 className="profile-name">{details.full_name || "N/A"}</h2>
                                <p className="profile-info">Date of Birth: {details.date_of_birth ? new Date(details.date_of_birth).toLocaleDateString("en-GB") : "N/A"}</p>
                                <p className="profile-info">Gender: {details.gender || "N/A"}</p>
                                <p className="profile-info">Age: {details.age || "N/A"}</p>
                                <p className="profile-info">Phone: {details.phone_no || "N/A"}</p>
                                <p className="profile-info">Mail: {details.email || "N/A"}</p>
                                <p className="profile-info">Address: {details.address || "N/A"}</p>
                                <button className="edit-btn">Edit Details</button>
                                <button className="logout-btn" onClick={handleLogout}>Logout</button>
                            </div>

                            <div className="emergency-details">
                                <h3 className="section-title">Emergency Details</h3>
                                <p className="profile-info">Name: {details.emg_name || "N/A"}</p>
                                <p className="profile-info">Phone: {details.emg_phone || "N/A"}</p>
                                <p className="profile-info">Address: {details.emg_address || "N/A"}</p>
                                <p className="profile-info">Relation: {details.emg_relation || "N/A"}</p>
                                <button className="edit-btn">Edit Details</button>
                            </div>
                        </div>
                        <div className="account-details">
                            <div className={`about-container ${darkMode ? "dark" : ""}`}>
                                <div className="setting">
                                    <img src="/settings.png" alt="Settings" onClick={() => setShowSettings(!showSettings)} />
                                </div>
                                {showSettings && (
                                    <div className="settings-dropdown">
                                        <button className="settings-btn">🌍 Translate</button>
                                        <button className="settings-btn" onClick={toggleDarkMode}>
                                            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
                                        </button>
                                    </div>
                                )}
                                <div className="profile-img">
                                    <img src={ details?.photo|| "/user.png"} alt="User Profile" />
                                </div>

                                <QRCodeCanvas
                                    value={details.qr_code || "default-value"}
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                    className="qr-code"
                                />
                                <p className="profile-info">SDC Code: {details.sdc_code || "Not Assigned"}</p>
                                <div className="visibility-toggle">
                                    <p className="profile-info">SDC Card Visibility:</p>
                                    <ToggleButton details={details} setDetails={setDetails} onToggle={handleToggleVisibility} />
                                </div>

                                {/* Customer Care & Download Guide */}
                                <button className="customer-care-btn">
                                    <AiOutlineCustomerService className="customer-care-icon" />
                                    Customer Care
                                </button>
                                <button className="download-guide">
                                    <BiDownload className="download-icon" />
                                    Download Guide
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about-section">
                    <h1 className="about-title">About Us</h1>
                    <p className="about-text">
                        At Medviora, we are dedicated to creating a platform that caters to all your needs.
                        Our mission is to simplify and enhance your experience by providing innovative solutions.
                    </p>
                </div>
            </div>

            {showPopup && (
                <div className="popup">
                    <p>SDC Card visibility updated. Logging out...</p>
                </div>
            )}
        </>
    );
}
