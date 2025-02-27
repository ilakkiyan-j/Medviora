import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DrHome() {
    const [inputCode, setInputCode] = useState(""); // Stores manual input
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });

        scanner.render(
            async (decodedText) => {
                await verifyAndCreateSession(decodedText, true); // true -> QR scan
                scanner.clear(); // Stop scanning after success
            },
            (error) => {
                console.error("QR Scan Error:", error);
            }
        );

        return () => scanner.clear(); // Cleanup on unmount
    }, []);

    // Verify patient access and create session
    const verifyAndCreateSession = async (code, isQR) => {
        try {
            console.log("Verifying Code:", code, "Is QR:", isQR);

            const response = await axios.get(`http://localhost:5000/dr/patient`, {
                params: isQR ? { qr_code: code } : { sdc_code: code }
            });

            const patientDetails = response.data;
            console.log("Patient Details:", patientDetails);


            // Fetch patient details again after session creation
            const detailsResponse = await axios.get(`http://localhost:5000/dr/details`, {
                params: isQR ? { qr_code: code } : { sdc_code: code }
            });

            console.log("Fetched Patient Details:", detailsResponse.data);

            if (patientDetails.visibility) {
                navigate("/patientRecords", { state: detailsResponse.data });
            } else {
                navigate("/patientProfile", { state: { patient: detailsResponse.data } });
            }
        } catch (error) {
            console.error("Error fetching patient:", error);
            setMessage("Invalid code or patient not found.");
        }
    };

    // Handle manual entry
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputCode) {
            await verifyAndCreateSession(inputCode, false);
        }
    };

    return (
        <div className="dr-home">
            <h2>Doctor's Portal</h2>

            {/* QR Code Scanner */}
            <div id="qr-reader" style={{ width: "300px" }}></div>

            {/* Manual Entry */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter SDC Code"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>

            {message && <p>{message}</p>}
        </div>
    );
}
