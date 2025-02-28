import express from "express";
import pool from "./db.js";

const router = express.Router();

// ✅ Doctor Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            `SELECT doctor_id, email, password, photo, full_name FROM doctors WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0 || result.rows[0].password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        req.session.doctor = {
            name: result.rows[0].full_name,
            email: result.rows[0].email,
            photo: result.rows[0].photo,
            doctor_id: result.rows[0].doctor_id,
        };
        res.json({ message: "Login successful" });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get("/patient", async (req, res) => {
    console.log("Incoming Request to /dr/patient:", req.query); // Debugging
    try {
        const { sdc_code, qr_code } = req.query;
        console.log("Received sdc_code:", sdc_code, "qr_code:", qr_code);

        if (!sdc_code && !qr_code) {
            return res.status(400).json({ message: "Invalid request. Missing parameters." });
        }

        const query = `SELECT * FROM users WHERE sdc_code = $1 OR qr_code = $2;`;
        const result = await pool.query(query, [sdc_code || null, qr_code || null]);

        if (result.rows.length === 0) {
            console.log("Patient not found for:", req.query);
            return res.status(404).json({ message: "Patient not found" });
        }

        console.log("Patient found:", result.rows[0]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching patient:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Get Patient Details
router.get("/details", async (req, res) => {
    try {
        console.log("Incoming Request:", req.query); // Debug log

        const { sdc_code, qr_code } = req.query;
        if (!sdc_code && !qr_code) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        let query = `
            SELECT u.*, e.emg_name, e.emg_phone, e.emg_address, e.emg_relation, 
                   p.sdc_code, p.qr_code, p.visibility, p.phone_no, p.email
            FROM user_info u 
            JOIN users p ON u.user_id = p.user_id
            LEFT JOIN user_emergency_contacts e ON u.user_id = e.user_id
            WHERE 1 = 1
        `;

        let queryParams = [];
        
        if (sdc_code) {
            query += ` AND p.sdc_code = $${queryParams.length + 1}`;
            queryParams.push(sdc_code);
        }
        if (qr_code) {
            query += ` AND p.qr_code = $${queryParams.length + 1}`;
            queryParams.push(qr_code);
        }

        console.log("Final Query:", query);
        console.log("Query Params:", queryParams);

        const details = await pool.query(query, queryParams);

        if (details.rows.length === 0) {
            console.log("No user details found");
            return res.status(404).json({ message: "User details not found" });
        }

        console.log("Fetched Data:", details.rows[0]); // Log the response data
        res.json(details.rows[0]); // Return the details directly
    } catch (error) {
        console.error("Error fetching details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/records", async (req, res) => {
    try {
        const { sdc_code, qr_code } = req.query;
  
      let query = `SELECT 
      u.sdc_code, u.qr_code,
    umr.record_id, umr.user_id, umr.entry_type, umr.diagnosis_name, 
    umr.history_of_present_illness, umr.treatment_undergone, 
    umr.physician_name, umr.hospital_name, umr.appointment_date, 
    umr.reg_no, umr.alternative_system_of_medicine,

    -- Hospitalization Details
    h.hospitalized_duration, h.reason_for_hospitalization, 
    h.bed_no AS hospitalization_bed_no, h.treatment_undergone AS hospitalization_treatment,

    -- Surgery Details
    s.surgery_type, s.surgery_duration, s.surgery_outcome, 
    s.medical_condition, s.surgery_bed_no,

    -- Prescriptions & Lab Results
    d.prescriptions, d.lab_results

FROM user_medical_records umr
LEFT JOIN user_hospitalization_details h ON umr.record_id = h.record_id
LEFT JOIN user_surgery_details s ON umr.record_id = s.record_id
LEFT JOIN user_documents d ON umr.record_id = d.record_id
LEFT JOIN users u ON umr.user_id = u.user_id
WHERE 1 = 1`;

let queryParams = [];
        
if (sdc_code) {
    query += ` AND u.sdc_code = $${queryParams.length + 1}`;
    queryParams.push(sdc_code);
}
if (qr_code) {
    query += ` AND u.qr_code = $${queryParams.length + 1}`;
    queryParams.push(qr_code);
}

console.log("Final Query:", query);
console.log("Query Params:", queryParams);

const records = await pool.query(query, queryParams);
  
      return res.json({ success: true, records: records.rows });
  
    } catch (err) {
      console.error("Error getting records:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });


export default router;
