import { useNavigate } from "react-router-dom";
import Navbar from "./components/NavBar";
import "./UserRecords.css";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRecords, setExpandedRecords] = useState({});
  const [pdfUrls, setPdfUrls] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get("http://localhost:5000/users/records", {
          withCredentials: true,
        });

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to fetch records");
        }

        setRecords(response.data.records);
        setFilteredRecords(response.data.records);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = records.filter((record) =>
      Object.values(record).some(
        (value) => value && value.toString().toLowerCase().includes(query)
      )
    );

    setFilteredRecords(filtered);
  };

  const toggleDetails = (index) => {
    setExpandedRecords((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const convertToPdfUrl = (byteaData, index, type) => {
    if (!byteaData) return;

    const byteArray = new Uint8Array(byteaData.data);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    setPdfUrls((prevUrls) => ({
      ...prevUrls,
      [`${type}-${index}`]: url,
    }));
  };

  useEffect(() => {
    filteredRecords.forEach((record, index) => {
      if (record.prescriptions) {
        convertToPdfUrl(record.prescriptions, index, "prescriptions");
      }
      if (record.lab_results) {
        convertToPdfUrl(record.lab_results, index, "lab_results");
      }
    });

    return () => {
      Object.values(pdfUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filteredRecords]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) return <p>Error: {error}</p>;

  return (
    <div className="records-container">
      <Navbar />
      <div className="header-section">
        <h3 className="records-title">Medical Records</h3>
        <button className="plus-button" onClick={() => navigate("/addUser")}>
          <FaPlus />
        </button>
      </div>
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search records..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      {filteredRecords.length === 0 ? (
        <p>No records found</p>
      ) : (
        <div className="records-list">
          {filteredRecords.map((record, index) => (
            <div key={index} className="record-card">
              <div>
                <p><strong>Physician Name:</strong> {record.physician_name}</p>
                <p><strong>Hospital Name:</strong> {record.hospital_name}</p>
                <p><strong>Appointment Date:</strong> {record.appointment_date}</p>
              </div>
              <button className="view-details" onClick={() => toggleDetails(index)}>
                {expandedRecords[index] ? "Hide Details" : "Show Details"}
              </button>
              {expandedRecords[index] && (
                <div className="details-section">
                  <details>
                    <summary>General Information</summary>
                    <p><strong>Entry Type:</strong> {record.entry_type}</p>
                    <p><strong>Diagnosis Name:</strong> {record.diagnosis_name}</p>
                    <p><strong>History of Present Illness:</strong> {record.history_of_present_illness}</p>
                    <p><strong>Treatment Undergone:</strong> {record.treatment_undergone}</p>
                    <p><strong>Reg No:</strong> {record.reg_no}</p>
                    <p><strong>Alternative System of Medicine:</strong> {record.alternative_system_of_medicine}</p>
                  </details>
                  {record.hospitalized_duration && (
                    <details>
                      <summary>Hospitalization Details</summary>
                      <p><strong>Duration:</strong> {record.hospitalized_duration}</p>
                      <p><strong>Reason:</strong> {record.reason_for_hospitalization}</p>
                      <p><strong>Bed No:</strong> {record.hospitalization_bed_no}</p>
                      <p><strong>Treatment Undergone:</strong> {record.hospitalization_treatment}</p>
                    </details>
                  )}
                  {record.surgery_type && (
                    <details>
                      <summary>Surgery Details</summary>
                      <p><strong>Type:</strong> {record.surgery_type}</p>
                      <p><strong>Duration:</strong> {record.surgery_duration}</p>
                      <p><strong>Outcome:</strong> {record.surgery_outcome}</p>
                      <p><strong>Medical Condition:</strong> {record.medical_condition}</p>
                      <p><strong>Bed No:</strong> {record.surgery_bed_no}</p>
                    </details>
                  )}
                  {record.prescriptions && pdfUrls[`prescriptions-${index}`] && (
                    <details>
                      <summary>Prescriptions</summary>
                      <iframe className="pdf-frame" src={pdfUrls[`prescriptions-${index}`]} />
                      <a className="download-link" href={pdfUrls[`prescriptions-${index}`]} download="Prescription.pdf">
                        Download Prescription
                      </a>
                    </details>
                  )}
                  {record.lab_results && pdfUrls[`lab_results-${index}`] && (
                    <details>
                      <summary>Lab Results</summary>
                      <iframe className="pdf-frame" src={pdfUrls[`lab_results-${index}`]} />
                      <a className="download-link" href={pdfUrls[`lab_results-${index}`]} download="Lab_Results.pdf">
                        Download Lab Results
                      </a>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
