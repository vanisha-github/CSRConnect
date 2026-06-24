# CSR & ESG Impact Intelligence Platform

A full-stack platform for managing and tracking Corporate Social Responsibility (CSR) projects with ESG impact metrics.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios, Recharts, React Leaflet
- **Backend:** Node.js, Express.js, JWT Authentication, Multer
- **Database:** PostgreSQL

## Project Structure

```
├── backend/
│   ├── config/            # Database connection & seed
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth, upload, error handling
│   ├── routes/            # Express routes
│   ├── services/          # Impact score engine
│   ├── uploads/           # File uploads
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # Auth context
│   │   ├── layouts/       # Dashboard & public layouts
│   │   ├── pages/         # All page components
│   │   └── services/      # API integration
│   └── index.html
├── database/
│   └── schema.sql         # PostgreSQL schema
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- npm

### 1. Database Setup

Create a PostgreSQL database named `csr_esg_platform`:

```bash
psql -U postgres -c "CREATE DATABASE csr_esg_platform;"

# Run the schema
psql -U postgres -d csr_esg_platform -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure .env with your PostgreSQL credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_NAME=csr_esg_platform

# Seed the database with sample data
npm run seed

# Start the backend server
npm run dev
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Default Login Credentials

| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Admin   | admin@csr.com       | password123 |
| Company | rahul@tata.com      | password123 |
| Company | priya@reliance.com  | password123 |
| Company | amit@infosys.com    | password123 |
| NGO     | meena@pratham.org   | password123 |
| NGO     | vikram@sewa.org     | password123 |
| NGO     | sunita@vanrai.org   | password123 |
| NGO     | arun@nari.org       | password123 |
| NGO     | kavita@skill.org    | password123 |

## Features

- **Role-based Authentication:** Admin, Company, NGO, Public User
- **NGO Management:** Verify, reject, edit NGOs
- **CSR Project Management:** Create, assign NGOs, track status
- **Progress Tracking:** Beneficiaries, budget utilization, progress %
- **Document Upload:** PDF reports, images, supporting documents
- **Impact Score Engine:** Auto-calculates scores based on performance
- **NGO Trust Score:** Based on completion rate, reporting, verification
- **SDG Mapping:** Auto-maps categories to UN SDGs
- **ESG Dashboard:** Environmental, Social, Governance metrics
- **India Impact Map:** Geo-visualization with React Leaflet
- **Dark Mode:** Full dark mode support
- **Responsive Design:** Modern SaaS-style UI

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### NGOs
- `POST /api/ngos/register` - Register NGO
- `GET /api/ngos` - List NGOs
- `GET /api/ngos/me` - My NGO profile
- `PATCH /api/ngos/:id/verify` - Verify NGO (admin)
- `PATCH /api/ngos/:id/reject` - Reject NGO (admin)

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Project details
- `PUT /api/projects/:id` - Update project
- `PATCH /api/projects/:id/assign` - Assign NGO

### Updates
- `POST /api/updates` - Add progress update
- `GET /api/updates/:projectId` - Get updates

### Documents
- `POST /api/documents/upload` - Upload file
- `GET /api/documents/:projectId` - Get documents

### Analytics
- `GET /api/analytics/admin` - Admin stats
- `GET /api/analytics/company` - Company stats
- `GET /api/analytics/ngo-stats` - NGO stats
- `GET /api/analytics/public` - Public stats
- `GET /api/analytics/map` - Map data
- `GET /api/analytics/esg` - ESG metrics
