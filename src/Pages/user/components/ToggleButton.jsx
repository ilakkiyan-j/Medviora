import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ToggleButton.css";

export default function ToggleButton({ details, setDetails }) {
    const [isOn, setIsOn] = useState(details?.visibility || false);
    const [showPopup, setShowPopup] = useState(false); 
    const navigate = useNavigate();  

    useEffect(() => {
        setIsOn(details?.visibility || false);
    }, [details]);

    const toggle = async () => {
        const newVisibility = !isOn;

        try {
            const response = await axios.post("http://localhost:5000/users/update-visibility", {
                visibility: newVisibility,
            }, { withCredentials: true });

            if (response.data.success) {
                setDetails(prev => ({
                    ...prev,
                    visibility: response.data.visibility,
                    sdc_code: response.data.sdc_code, 
                }));

                if (response.data.sdc_code && response.data.sdc_code !== details?.sdc_code) {
                    setShowPopup(true);

                    setTimeout(async () => {
                        await axios.post("http://localhost:5000/logout", {}, { withCredentials: true });
                        navigate("/");
                    }, 5000); 
                }
            } else {
                console.error("Failed to update visibility.");
            }
        } catch (error) {
            console.error("Error updating visibility:", error);
        }

        setIsOn(newVisibility);
    };

    return (
        <div style={{ position: "relative" }}>
            <div className={`toggle-container ${isOn ? "on" : "off"}`} onClick={toggle}>
                <div className="toggle-circle"></div>
            </div>

            {showPopup && (
                <div className="popup-message">
                    Your visibility is updated. Logging out...
                </div>
            )}
        </div>
    );
}
