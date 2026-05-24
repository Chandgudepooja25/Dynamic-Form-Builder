-- FormCraft backend — MySQL / MariaDB (e.g. XAMPP)
-- Run once in phpMyAdmin (SQL tab) or: mysql -u root dynamic_form_builder < schema.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS forms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL DEFAULT (''),
  questions JSON NOT NULL,
  start_question_id VARCHAR(64) NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_forms_created_by (created_by),
  KEY idx_forms_published (is_published),
  CONSTRAINT fk_forms_user FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS form_responses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  form_id BIGINT UNSIGNED NOT NULL,
  respondent_user_id BIGINT UNSIGNED NULL,
  session_id VARCHAR(128) NULL,
  respondent_name VARCHAR(255) NULL,
  respondent_email VARCHAR(255) NULL,
  answers JSON NOT NULL,
  status ENUM('draft', 'submitted') NOT NULL DEFAULT 'draft',
  submitted_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_resp_form (form_id),
  KEY idx_resp_status (status),
  KEY idx_resp_session (session_id),
  CONSTRAINT fk_resp_form FOREIGN KEY (form_id) REFERENCES forms (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_resp_user FOREIGN KEY (respondent_user_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
