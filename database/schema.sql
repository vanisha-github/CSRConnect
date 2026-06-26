-- CSR & ESG Impact Intelligence Platform - PostgreSQL Schema

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ngos (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  ngo_name VARCHAR(255) NOT NULL,
  registration_number VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  verified SMALLINT DEFAULT 0,
  trust_score NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  ngo_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  budget NUMERIC(12,2) DEFAULT 0.00,
  location VARCHAR(255),
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
);

CREATE TABLE project_updates (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  beneficiaries_reached INT DEFAULT 0,
  budget_utilized NUMERIC(12,2) DEFAULT 0.00,
  progress_percentage NUMERIC(5,2) DEFAULT 0.00,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE impact_scores (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  score NUMERIC(5,2) DEFAULT 0.00,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE sdg_mapping (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL,
  sdg_code VARCHAR(50) NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_company ON projects(company_id);
CREATE INDEX idx_projects_ngo ON projects(ngo_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_updates_project ON project_updates(project_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_impact_scores_project ON impact_scores(project_id);
CREATE INDEX idx_sdg_mapping_project ON sdg_mapping(project_id);

-- Migration: add file support to project_updates
ALTER TABLE project_updates ADD file_name VARCHAR(255);
ALTER TABLE project_updates ADD file_path VARCHAR(500);

-- Migration: add profile images to ngos and companies
ALTER TABLE ngos ADD profile_image VARCHAR(500);
ALTER TABLE companies ADD profile_image VARCHAR(500);

-- Profile galleries
CREATE TABLE ngo_gallery (
  id SERIAL PRIMARY KEY,
  ngo_id INT NOT NULL REFERENCES ngos(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_gallery (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
