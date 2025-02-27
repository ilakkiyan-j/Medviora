import pool from "./db.js";
import express from "express";

const router = express.Router();


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query(`SELECT u.email, u.photo , u.sdc_code, u.password, i.full_name AS name FROM users u JOIN user_info i ON u.user_id = i.user_id WHERE u.email = $1`, [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.rows[0].password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }
   
    if(user.rows[0].photo)
    user.rows[0].photo = `data:image/jpeg;base64,${user.rows[0].photo.toString("base64")}`;

    req.session.user = { name: user.rows[0].name, email: user.rows[0].email , photo: user.rows[0].photo, sdc :user.rows[0].sdc_code};
    res.json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/recent", async (req, res) => {
    try {
        if (!req.session?.user?.sdc) {
            return res.status(400).json({ message: "User not authenticated" });
        }
       console.log("SDC: "+req.session.user.sdc);
        const queryText = `
            SELECT * FROM user_medical_records 
            WHERE user_id = (SELECT user_id FROM users WHERE sdc_code = $1) 
            ORDER BY appointment_date DESC 
            LIMIT 1;
        `;

        const recent = await pool.query(queryText, [req.session.user.sdc]);

        if (recent.rows.length === 0) {
            return res.status(404).json({ message: "No records found" });
        }

        res.json({ recent: recent.rows[0] });

    } catch (error) {
        console.error("Error fetching recent record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/records", async (req, res) => {
    try {
      console.log("Current SDC Code:", req.session?.user?.sdc);
      if (!req.session?.user?.sdc) {
        return res.status(400).json({ success: false, message: "User not authenticated" });
      }
  
      const queryText = `SELECT 
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

WHERE umr.user_id = (SELECT user_id FROM users WHERE sdc_code = $1)`;

      const records = await pool.query(queryText, [req.session.user.sdc]);
  
      return res.json({ success: true, records: records.rows });
  
    } catch (err) {
      console.error("Error getting records:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

 router.get("/getlogs", async (req, res) => {
    try {
      if (!req.session?.user?.email) {
        return res.status(400).json({ message: "User not authenticated" });
      }
  
      const queryText = `
        SELECT data_logs FROM user_info
        WHERE user_id = (SELECT user_id FROM users WHERE sdc_code = $1)
      `;
  
      const recent = await pool.query(queryText, [req.session.user.sdc]);
  
      if (recent.rows.length === 0) {
        return res.status(404).json({ message: "No records found" });
      }
  
      const logsArray = recent.rows[0].data_logs || [];
  
      res.json({ logs: logsArray });
  
    } catch (error) {
      console.error("Error fetching recent records:", error);
      res.status(500).json({ message: "Internal server error" });
    }
    
  });
  
router.post("/update-visibility", async (req, res) => {
    try {
      if (!req.session?.user?.sdc) {
        return res.status(400).json({ message: "User not authenticated" });
      }
  
      const { visibility } = req.body;
  
      const queryText = `
        UPDATE users
        SET visibility = $1
        WHERE sdc_code = $2
        RETURNING visibility, sdc_code;
      `;
  
      const updatedUser = await pool.query(queryText, [visibility, req.session.user.sdc]);
  
      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update session with new SDC code from the trigger
      req.session.user.sdc = updatedUser.rows[0].sdc_code;
  
      res.json({
        success: true,
        visibility: updatedUser.rows[0].visibility,
        sdc_code: updatedUser.rows[0].sdc_code,
      });
  
    } catch (error) {
      console.error("Error updating visibility:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  router.get("/details", async (req, res) => {
    try {
      if (!req.session?.user?.sdc) {
        return res.status(400).json({ message: "User not authenticated" });
      }
  
      const queryText = `
     SELECT 
      u.*, 
      e.emg_name,
      e.emg_phone,
      e.emg_address,
      e.emg_relation,  -- Fixed typo
      p.sdc_code, 
      p.qr_code, 
      p.visibility, 
      p.photo, 
      p.phone_no, 
      p.email 
  FROM user_info u 
  JOIN users p ON u.user_id = p.user_id
  LEFT JOIN user_emergency_contacts e ON u.user_id = e.user_id  -- Changed to LEFT JOIN
  WHERE p.sdc_code = $1;
      `;
  
      const details = await pool.query(queryText, [req.session.user.sdc]);
  
      // Check if the user exists
      if (details.rows.length === 0) {
        return res.status(404).json({ message: "User details not found" });
      }
  
      // Extract the first row
      const userDetails = details.rows[0];
  
      // Convert BYTEA image to Base64 if photo exists
      if (userDetails.photo) {
        userDetails.photo = `data:image/jpeg;base64,${userDetails.photo.toString("base64")}`;
      }
  
      res.json({ details: userDetails });
    } catch (error) {
      console.error("Error fetching Details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

export default router;

  