SELECT 
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

WHERE umr.user_id = '7812403d-ecf1-4322-8c66-26d618460acd';