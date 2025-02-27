import Navbar from "./components/NavBar";
import "./UserLogs.css";
import { FaClock, FaUserShield, FaIdBadge, FaUser, FaInfoCircle, FaSearch, FaEye, FaFileDownload, FaTrash, FaFileMedical, FaFileSignature } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function UserLogs() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await axios.get("http://localhost:5000/users/getlogs", {
          withCredentials: true,
        });

        setData(response.data.logs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        if (error.response?.status === 400) navigate("/");
      }
    }

    fetchLogs();
  }, [navigate]);

  // Function to get an icon based on action type
  const getActionIcon = (action) => {
    if (action.includes("Viewed Profile")) return <FaEye className="icon action-icon view-icon" />;
    if (action.includes("Downloaded Report")) return <FaFileDownload className="icon action-icon download-icon" />;
    if (action.includes("Deleted Record")) return <FaTrash className="icon action-icon delete-icon" />;
    if (action.includes("Created Record")) return <FaFileMedical className="icon action-icon create-icon" />;
    if (action.includes("Updated Record")) return <FaFileSignature className="icon action-icon update-icon" />;
    return <FaInfoCircle className="icon action-icon" />;
  };

  // Filter logs based on search term
  const filteredLogs = data.filter((log) =>
    log.toLowerCase().includes(searchTerm.toLowerCase())
  );
   
  const formatText = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  
  return (
    <>
      <Navbar />
      <div className="logs-container">
        <h2 className="logs-title">Your Data Logs</h2>

        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Log Entries in Row Format */}
        {filteredLogs.length > 0 ? (
          <table className="logs-table">
            <thead>
              <tr>
                <th><FaClock className="icon" /> Time</th>
                <th><FaInfoCircle className="icon" /> Action</th>
                <th><FaUserShield className="icon" /> Role</th>
                <th><FaIdBadge className="icon" /> UUID</th>
                <th><FaUser className="icon" /> Name</th>
                <th><FaInfoCircle className="icon" /> Details</th>
                <th>Report</th>
              </tr>
            </thead>
            <tbody>
            {filteredLogs.map((log, idx) => {
  const [timestamp, action, role, uuid, name, details] = log.split(" | ");
  return (
    <tr key={idx}>
      <td><FaClock className="icon" /> {timestamp}</td>
      <td>{getActionIcon(action)} {formatText(action)}</td>
      <td><FaUserShield className="icon" /> {formatText(role)}</td>
      <td><FaIdBadge className="icon" /> {uuid}</td>
      <td><FaUser className="icon" /> {name}</td>
      <td><FaInfoCircle className="icon" /> {details}</td>
      <td>
        <button className="report-button">Report</button>
      </td>
    </tr>
  );
})}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No logs available.</p>
        )}
      </div>
    </>
  );
}
