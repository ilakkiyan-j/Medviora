import { Link } from "react-router-dom";
import "./Navbar.css";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Navbar() {
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    axios.get("/session")
      .then(response => {
        if (response.data.user && response.data.user.photo) {
          setProfilePic(response.user.photo);
        } else {
          setProfilePic("./u1.png"); // Default profile picture
        }
      })
      .catch(error => {
        console.error("Error fetching profile picture:", error);
        setProfilePic("./u1.png"); // Fallback on error
      });
  }, []);

  return (
    <div className="outer-div">
      <nav className="nav-bar">
        <ul>
          {/* Logo Section */}
          <li className="logo">
            <Link to="/userHome">
              <img className="med" src="/Medviora.png" alt="Logo" />
            </Link>
          </li>

          {/* Navigation Links */}
          <li><Link to="/userHome">HOME</Link></li>
          <li><Link to="/userRecords">RECORDS</Link></li>
          <li><Link to="/userLogs">LOGS</Link></li>

          {/* Profile Picture */}
          <li className="dp">
            <Link to="/userProfile">
              <img className="profile" src={profilePic} alt="Profile" />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
