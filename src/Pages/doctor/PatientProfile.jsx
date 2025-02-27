import { useLocation, Link } from "react-router-dom";

export default function PatientProfile() {
    const location = useLocation();
    const details = location.state?.patient; // Get details from navigation

    if (!details) {
        return <p className="error-text">No patient data available.</p>;
    }

    return (
        <>
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
                            </div>

                            <div className="emergency-details">
                                <h3 className="section-title">Emergency Details</h3>
                                <p className="profile-info">Name: {details.emg_name || "N/A"}</p>
                                <p className="profile-info">Phone: {details.emg_phone || "N/A"}</p>
                                <p className="profile-info">Address: {details.emg_address || "N/A"}</p>
                                <p className="profile-info">Relation: {details.emg_relation || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Link to="/drHome">Back</Link>
        </>
    );
}
