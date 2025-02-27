CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sdc_code TEXT NOT NULL UNIQUE DEFAULT substring(MD5(random()::text) from 1 for 16),
    qr_code TEXT NOT NULL UNIQUE DEFAULT substring(MD5(random()::text) from 1 for 16),
    visibility BOOLEAN DEFAULT FALSE,
    photo BYTEA,  -- Storing image as binary data
    phone_no VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL  -- Store hashed password
);

INSERT INTO users (photo, phone_no, email, password) VALUES
(pg_read_binary_file('"D:\Medviora\samples\arun_kumar.jpg"')::bytea, '+919876543210', 'arunkumar.pt@mv.in', 'Password123'),
(pg_read_binary_file('D:\Medviora\samples\devi_lakshmi.jpg')::bytea, '+919876543211', 'devilakshmi.pt@mv.in', 'Tamilnadu@123'),
(pg_read_binary_file('D:\Medviora\samples\venkat_raman.jpg')::bytea, '+919876543212', 'venkatraman.pt@mv.in', 'Venkat@321'),
(pg_read_binary_file('D:\Medviora\samples\saranya_mahesh.jpg')::bytea, '+919876543213', 'saranyamahesh.pt@mv.in', 'Sara@456'),
(pg_read_binary_file('D:\Medviora\samples\prakash_veeran.jpg')::bytea, '+919876543214', 'prakashveeran.pt@mv.in', 'Prakash789');

CREATE OR REPLACE FUNCTION update_sdc_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if visibility is changing
    IF NEW.visibility <> OLD.visibility THEN
        NEW.sdc_code = LEFT(MD5(CURRENT_TIMESTAMP::TEXT || NEW.user_id::TEXT), 16);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sdc_code
BEFORE UPDATE OF visibility ON users
FOR EACH ROW
EXECUTE FUNCTION update_sdc_code();


CREATE TABLE user_info (
    user_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(50) NOT NULL,
    age INT CHECK (age > 0),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    date_of_birth DATE,
    address VARCHAR(125) DEFAULT '',
    smoking BOOLEAN DEFAULT FALSE,
    alcoholism BOOLEAN DEFAULT FALSE,
    tobacco BOOLEAN DEFAULT FALSE,
    others VARCHAR(255) DEFAULT '',
    pregnancy BOOLEAN DEFAULT NULL, 
    exercise VARCHAR(10) CHECK (exercise IN ('None', 'Light', 'Moderate', 'Intense')) DEFAULT 'None',
    allergy VARCHAR(255) DEFAULT '',
    data_logs TEXT[] 
);

INSERT INTO user_info (
    user_id, full_name, age, gender, date_of_birth, address, smoking, alcoholism, tobacco, others, pregnancy, exercise, allergy, data_logs
) VALUES
    ('7812403d-ecf1-4322-8c66-26d618460acd', 'Arun Kumar', 32, 'Male', '1992-05-14', 'Chennai, Tamil Nadu', FALSE, TRUE, FALSE, '', NULL, 'Moderate', 'Peanuts', ARRAY[
        '2025-02-25 14:30:00 | CREATED_RECORD | USER | - | - | Added new allergy: Peanuts',
        '2025-02-25 15:10:00 | VIEWED_RECORD | DOCTOR | 12a4b678-cdef-4321-abcd-567890ef1234 | Dr. Rajesh Kumar | Viewed patient history'
    ]),

    ('8d9e035a-9e5d-4619-93cd-7f63ee65cb70', 'Devi Lakshmi', 28, 'Female', '1996-07-22', 'Bangalore, Karnataka', FALSE, FALSE, FALSE, '', FALSE, 'Light', 'Dust Allergy', ARRAY[
        '2025-02-21 10:45:00 | CREATED_RECORD | USER | - | - | Updated address details',
        '2025-02-21 11:15:00 | VIEWED_RECORD | HOSPITAL_ADMIN | 89fgh123-ijkl-4567-mnop-qrstuv987654 | Priya Sharma | Reviewed allergy test results'
    ]),

    ('97845dcb-5b0f-4e18-a670-de91ab2b02a8', 'Saranya Mahesh', 30, 'Female', '1994-03-10', 'Hyderabad, Telangana', FALSE, FALSE, FALSE, '', TRUE, 'Moderate', 'Lactose Intolerance', ARRAY[
        '2025-02-18 09:00:00 | CREATED_RECORD | USER | - | - | Logged pregnancy details',
        '2025-02-18 09:45:00 | VIEWED_RECORD | DOCTOR | 34mnop567-qrs-8901-tuvw-xyzabcd654321 | Dr. Anjali Mehta | Reviewed prenatal test results'
    ]),

    ('ebe9c7c9-76d9-4165-80ee-36c81d87507e', 'Venkat Raman', 45, 'Male', '1979-11-05', 'Coimbatore, Tamil Nadu', TRUE, TRUE, TRUE, 'Occasional Pan Masala', NULL, 'None', 'Pollen Allergy', ARRAY[
        '2025-02-23 18:15:00 | CREATED_RECORD | USER | - | - | Added complaint about chest pain',
        '2025-02-23 18:30:00 | VIEWED_RECORD | EXAMINER | 56xyz123-abc-7890-defg-hijkl98765432 | Dr. Suresh Nair | Checked ECG report'
    ]),

    ('f41ffa8f-f719-46a7-96f4-73060daa5c6f', 'Prakash Veeran', 37, 'Male', '1987-09-18', 'Mumbai, Maharashtra', FALSE, FALSE, TRUE, '', NULL, 'Intense', '', ARRAY[
        '2025-02-19 06:45:00 | CREATED_RECORD | USER | - | - | Logged fitness progress after marathon',
        '2025-02-19 07:00:00 | VIEWED_RECORD | DOCTOR | 78abc456-def-1234-ghi5-jklmno6789012 | Dr. Manish Gupta | Reviewed muscle recovery report'
    ]);

CREATE TABLE user_emergency_contacts (
    emg_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    emg_name VARCHAR(50) NOT NULL,
    emg_phone VARCHAR(15) NOT NULL CHECK (emg_phone ~ '^\+?[0-9]{7,15}$'),
    emg_address VARCHAR(255) DEFAULT '',
    emg_relation VARCHAR(50) NOT NULL
);

INSERT INTO user_emergency_contacts (user_id, emg_name, emg_phone, emg_address, emg_relation) VALUES
('7812403d-ecf1-4322-8c66-26d618460acd', 'Ravi Kumar', '+919876543210', '123, MG Road, Chennai', 'Father'),
('8d9e035a-9e5d-4619-93cd-7f63ee65cb70', 'Lakshmi Devi', '+919865432109', '456, Anna Nagar, Coimbatore', 'Mother'),
('97845dcb-5b0f-4e18-a670-de91ab2b02a8', 'Mahesh Kumar', '+917654321098', '789, Gandhi Street, Bangalore', 'Brother'),
('ebe9c7c9-76d9-4165-80ee-36c81d87507e', 'Ramya Venkat', '+916543210987', '159, Park Avenue, Hyderabad', 'Spouse'),
('f41ffa8f-f719-46a7-96f4-73060daa5c6f', 'Veeran Prakash', '+915432109876', '753, Patel Road, Mumbai', 'Sister');

-- Medical Records Table
CREATE TABLE user_medical_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    entry_type VARCHAR(25)  NOT NULL,
    diagnosis_name VARCHAR(255) NOT NULL,
    history_of_present_illness TEXT DEFAULT '',
    treatment_undergone TEXT DEFAULT '',
    physician_name VARCHAR(100) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    reg_no VARCHAR(50) NOT NULL,
    alternative_system_of_medicine VARCHAR(50) CHECK (alternative_system_of_medicine IN ('Ayurveda', 'Homeopathy', 'Unani', 'Siddha', 'None')) DEFAULT 'None'
);

-- Hospitalization Details Table (One-to-One Relation with user_medical_records)
CREATE TABLE user_hospitalization_details (
    record_id UUID PRIMARY KEY REFERENCES user_medical_records(record_id) ON DELETE CASCADE,
    hospitalized_duration VARCHAR(50) NOT NULL,
    reason_for_hospitalization TEXT NOT NULL,
    bed_no VARCHAR(50) NOT NULL,
    treatment_undergone TEXT NOT NULL
);

-- Surgery Details Table (One-to-One Relation with user_medical_records)
CREATE TABLE user_surgery_details (
    record_id UUID PRIMARY KEY REFERENCES user_medical_records(record_id) ON DELETE CASCADE,
    surgery_type VARCHAR(100) NOT NULL,
    surgery_duration VARCHAR(50) NOT NULL,
    surgery_outcome TEXT NOT NULL,
    medical_condition TEXT NOT NULL,
    surgery_bed_no VARCHAR(50) NOT NULL
);

-- Medicines Table (One-to-Many Relation with user_medical_records)
CREATE TABLE user_medicines (
    medicine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES user_medical_records(record_id) ON DELETE CASCADE,
    name_of_the_medicines VARCHAR(255) NOT NULL,
    intake_per_day INT CHECK (intake_per_day > 0) NOT NULL
);

-- Documents Table (One-to-One Relation with user_medical_records)
CREATE TABLE user_documents (
    record_id UUID PRIMARY KEY REFERENCES user_medical_records(record_id) ON DELETE CASCADE,
    prescriptions BYTEA DEFAULT NULL,
    lab_results BYTEA DEFAULT NULL
);

INSERT INTO user_medical_records (
    record_id, user_id, entry_type, diagnosis_name, history_of_present_illness, 
    treatment_undergone, physician_name, hospital_name, appointment_date, reg_no, 
    alternative_system_of_medicine
) VALUES 
-- User self-reported records (Now with physician validation)
('7812a001-ecf1-4322-8c66-26d618460a01', '7812403d-ecf1-4322-8c66-26d618460acd', 'User', 
 'Common Cold', 'Mild cough and runny nose.', 
 'Drank warm fluids.', 'Dr. Sneha Kapoor', 'Teleconsultation', '2025-02-01', 'REG2025001', 'None'),

('7812a002-ecf1-4322-8c66-26d618460a02', '7812403d-ecf1-4322-8c66-26d618460acd', 'User', 
 'Seasonal Allergy', 'Sneezing and itchy eyes.', 
 'Used antihistamines.', 'Dr. Rajiv Menon', 'Online Consultation', '2025-03-05', 'REG2025003', 'Homeopathy'),

-- Doctor-diagnosed conditions
('7812a003-ecf1-4322-8c66-26d618460a03', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Type 2 Diabetes', 'Fatigue and increased thirst.', 
 'Started on metformin.', 'Dr. Anita Sharma', 'Fortis Hospital', '2025-02-10', 'REG2025002', 'Ayurveda'),

('7812a004-ecf1-4322-8c66-26d618460a04', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Hypertension', 'Frequent headaches and high BP.', 
 'Prescribed Amlodipine.', 'Dr. Rajesh Verma', 'AIIMS', '2025-04-12', 'REG2025010', 'None'),

-- Hospitalization cases (Physician from admitting hospital)
('7812a005-ecf1-4322-8c66-26d618460a05', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Pneumonia (Hospitalized)', 'Breathing difficulties and fever.', 
 'IV antibiotics and oxygen therapy.', 'Dr. Priya Menon', 'CMC Hospital', '2025-02-18', 'REG2025005', 'None'),

('7812a006-ecf1-4322-8c66-26d618460a06', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Severe Food Poisoning', 'Vomiting, nausea, and dehydration.', 
 'IV fluids and anti-nausea medication.', 'Dr. Maya Iyer', 'Apollo Hospital', '2025-03-01', 'REG2025008', 'None'),

('7812a007-ecf1-4322-8c66-26d618460a07', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Dengue Fever', 'High fever and low platelet count.', 
 'Supportive IV fluids and platelet transfusion.', 'Dr. Ravi Kumar', 'Government Hospital', '2025-03-10', 'REG2025012', 'Unani'),

-- Surgery cases
('7812a008-ecf1-4322-8c66-26d618460a08', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Appendicitis (Surgery)', 'Severe abdominal pain and nausea.', 
 'Appendectomy performed.', 'Dr. Ramesh Gupta', 'MIOT Hospital', '2025-02-24', 'REG2025006', 'None'),

('7812a009-ecf1-4322-8c66-26d618460a09', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Gallbladder Stones (Surgery)', 'Severe abdominal pain.', 
 'Laparoscopic cholecystectomy.', 'Dr. Neeta Rao', 'Apollo Hospital', '2025-04-20', 'REG2025015', 'None'),

('7812a010-ecf1-4322-8c66-26d618460a10', '7812403d-ecf1-4322-8c66-26d618460acd', 'Hospital Admin', 
 'Fractured Arm (Surgery)', 'Broken radius bone due to fall.', 
 'Surgical plating of bone.', 'Dr. Ajay Khanna', 'Max Hospital', '2025-05-10', 'REG2025020', 'None'),

-- Routine checkups (Self-reported but verified by a physician)
('7812a011-ecf1-4322-8c66-26d618460a11', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'General Checkup', 'Routine blood tests and vitals.', 
 'No concerns found.', 'Dr. Manish Patel', 'Apollo Clinic', '2025-06-01', 'REG2025030', 'None'),

('7812a012-ecf1-4322-8c66-26d618460a12', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Eye Checkup', 'Blurry vision in left eye.', 
 'Glasses prescribed.', 'Dr. Swati Agarwal', 'Narayana Nethralaya', '2025-07-10', 'REG2025040', 'None'),

('7812a013-ecf1-4322-8c66-26d618460a13', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Dental Cavity', 'Tooth pain and sensitivity.', 
 'Cavity filling done.', 'Dr. Kiran Rao', 'Clove Dental', '2025-07-22', 'REG2025045', 'None'),

('7812a014-ecf1-4322-8c66-26d618460a14', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Migraine', 'Recurring severe headaches.', 
 'Prescribed sumatriptan.', 'Dr. Amrita Das', 'Fortis Neurology', '2025-08-05', 'REG2025050', 'None'),

('7812a015-ecf1-4322-8c66-26d618460a15', '7812403d-ecf1-4322-8c66-26d618460acd', 'Doctor', 
 'Acid Reflux', 'Heartburn and indigestion.', 
 'Prescribed omeprazole.', 'Dr. Suresh Menon', 'KIMS Hospital', '2025-09-10', 'REG2025060', 'Ayurveda');

INSERT INTO user_hospitalization_details (
    record_id,  hospitalized_duration, reason_for_hospitalization, bed_no, treatment_undergone
) VALUES 
('7812a005-ecf1-4322-8c66-26d618460a05', '5 days', 'Severe pneumonia requiring oxygen support.', 'ICU-12','Inclination given'),
('7812a006-ecf1-4322-8c66-26d618460a06', '3 days', 'Severe dehydration due to food poisoning.', 'Ward-5', 'Bed rest'),
('7812a007-ecf1-4322-8c66-26d618460a07', '4 days', 'Low platelet count due to Dengue.', 'ICU-8', 'Blood given');

INSERT INTO user_surgery_details (
    record_id, surgery_type, surgery_duration, surgery_outcome, medical_condition, surgery_bed_no
) VALUES 
('7812a008-ecf1-4322-8c66-26d618460a08', 'Appendectomy', '2 hours', 'Successful, no complications.', 'Appendicitis', 'OT-3'),
('7812a009-ecf1-4322-8c66-26d618460a09', 'Gallbladder Removal', '3 hours', 'Successful, discharged after 2 days.', 'Gallstones', 'OT-5'),
('7812a010-ecf1-4322-8c66-26d618460a10', 'Fracture Surgery', '2.5 hours', 'Plates inserted, recovery ongoing.', 'Fractured Leg', 'OT-7');

INSERT INTO user_documents (record_id, prescriptions, lab_results) VALUES 
('7812a001-ecf1-4322-8c66-26d618460a01', pg_read_binary_file('D:\Medivision\sample pdf\s1.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s2.pdf')),
('7812a002-ecf1-4322-8c66-26d618460a02', pg_read_binary_file('D:\Medivision\sample pdf\s3.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s4.pdf')),
('7812a003-ecf1-4322-8c66-26d618460a03', pg_read_binary_file('D:\Medivision\sample pdf\s5.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s6.pdf')),
('7812a004-ecf1-4322-8c66-26d618460a04', pg_read_binary_file('D:\Medivision\sample pdf\s7.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s8.pdf')),
('7812a005-ecf1-4322-8c66-26d618460a05', pg_read_binary_file('D:\Medivision\sample pdf\s1.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s2.pdf')),
('7812a006-ecf1-4322-8c66-26d618460a06', pg_read_binary_file('D:\Medivision\sample pdf\s5.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s6.pdf')),
('7812a007-ecf1-4322-8c66-26d618460a07', pg_read_binary_file('D:\Medivision\sample pdf\s7.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s2.pdf')),
('7812a008-ecf1-4322-8c66-26d618460a08', pg_read_binary_file('D:\Medivision\sample pdf\s4.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s8.pdf')),
('7812a009-ecf1-4322-8c66-26d618460a09', pg_read_binary_file('D:\Medivision\sample pdf\s5.pdf'), pg_read_binary_file('D:\Medivision\sample pdf\s6.pdf'));

CREATE INDEX idx_users_sdc_code ON users (sdc_code);
CREATE INDEX idx_medical_records_user_id ON user_medical_records (user_id);
CREATE INDEX idx_hospitalization_record_id ON user_hospitalization_details (record_id);
CREATE INDEX idx_surgery_record_id ON user_surgery_details (record_id);
CREATE INDEX idx_documents_record_id ON user_documents (record_id);

CREATE TABLE Doctors (
    doctor_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,  -- Added full name column
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone_no VARCHAR(15) UNIQUE NOT NULL,
    photo BYTEA,  -- Stores profile picture as binary data
    specialization VARCHAR(255),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    years_of_experience INT CHECK (years_of_experience >= 0),
    status VARCHAR(20),  -- No CHECK constraint or default value
    hospital_affiliation VARCHAR(255),
    verification_documents BYTEA, -- Stores verification documents as binary data
    patients_history TEXT[] DEFAULT '{}' -- Stores an array of patient identifiers
);

INSERT INTO Doctors (
    full_name, email, password, phone_no, photo, specialization, license_number, 
    years_of_experience, status, hospital_affiliation, verification_documents, patients_history
) VALUES 
    ('Dr. John Smith', 'john.dr@mv.in', 'hashed_password_1', '9876543210', NULL, 'Cardiologist', 'LIC123456', 10, 'Active', 'City Hospital', NULL, ARRAY['P001', 'P002']),
    ('Dr. Emma Johnson', 'emma.dr@mv.in', 'hashed_password_2', '9876543211', NULL, 'Neurologist', 'LIC654321', 8, 'Active', 'Metro Medical Center', NULL, ARRAY['P003']),
    ('Dr. William Brown', 'william.dr@mv.in', 'hashed_password_3', '9876543212', NULL, 'Orthopedic Surgeon', 'LIC789012', 15, 'Inactive', 'General Hospital', NULL, ARRAY['P004', 'P005', 'P006']),
    ('Dr. Olivia Davis', 'olivia.dr@mv.in', 'hashed_password_4', '9876543213', NULL, 'Pediatrician', 'LIC567890', 5, 'Active', 'Children’s Hospital', NULL, ARRAY['P007']),
    ('Dr. Noah Wilson', 'noah.dr@mv.in', 'hashed_password_5', '9876543214', NULL, 'Dermatologist', 'LIC345678', 7, 'Pending', 'Skin Care Clinic', NULL, ARRAY['P008', 'P009']);
