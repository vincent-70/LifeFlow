-- ─────────────────────────────────────────────
--  LifeFlow — Blood Donation Database Schema
--  Database : blood
--  Table    : donor_blood
--  Run this in MySQL Workbench
-- ─────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS blood;
USE blood;

CREATE TABLE IF NOT EXISTS donor_blood (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)                  NOT NULL,
  age           INT                           NOT NULL,
  gender        ENUM('Male','Female','Other') NOT NULL,
  blood_group   VARCHAR(5)                    NOT NULL,
  mobile        VARCHAR(15)                   NOT NULL UNIQUE,
  email         VARCHAR(100),
  state         VARCHAR(100)                  NOT NULL,
  city          VARCHAR(100)                  NOT NULL,
  address       TEXT,
  last_donation DATE,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO donor_blood (name,age,gender,blood_group,mobile,email,state,city,address,last_donation) VALUES
('Arjun Sharma',    28,'Male',  'O+', '9876543210','arjun@email.com',  'Karnataka',   'Bengaluru','12 MG Road',          '2024-01-15'),
('Priya Mehta',     24,'Female','A+', '9123456780','priya@email.com',  'Maharashtra', 'Mumbai',   '45 Andheri West',     '2024-02-20'),
('Ravi Kumar',      35,'Male',  'B+', '9988776655','ravi@email.com',   'Tamil Nadu',  'Chennai',  '7 Anna Nagar',        '2023-12-10'),
('Sneha Reddy',     29,'Female','AB+','9871234560','sneha@email.com',  'Telangana',   'Hyderabad','22 Banjara Hills',    '2024-03-01'),
('Vikram Singh',    42,'Male',  'O-', '9765432100','vikram@email.com', 'Delhi',       'New Delhi','5 Connaught Place',   '2024-01-28'),
('Ananya Das',      31,'Female','B-', '9654321098','ananya@email.com', 'West Bengal', 'Kolkata',  '18 Park Street',      '2023-11-15'),
('Mohammed Irfan',  26,'Male',  'A-', '9543210987','irfan@email.com',  'Kerala',      'Kochi',    '33 MG Road',          '2024-02-14'),
('Kavya Nair',      22,'Female','O+', '9432109876','kavya@email.com',  'Kerala',      'Thiruvananthapuram','9 Statue Road', NULL);

SELECT * FROM donor_blood;
