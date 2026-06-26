# CSR & ESG Impact Intelligence Platform

A full-stack platform for managing and tracking Corporate Social Responsibility (CSR) projects with ESG impact metrics, featuring NGO/company dashboards, admin review workflow, public impact dashboard, and real-time analytics.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios, Recharts, React Leaflet
- **Backend:** Node.js, Express.js, JWT Authentication, Multer
- **Database:** PostgreSQL

## Project Structure

```
├── backend/
│   ├── config/             # Database connection & seed
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, upload, error handling
│   ├── routes/             # Express routes
│   ├── services/           # Impact score engine
│   ├── uploads/            # File uploads (gitignored)
│   ├── migrate_v*.js       # Database migrations
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # Auth context
│   │   ├── layouts/        # Dashboard & public layouts
│   │   ├── pages/          # All page components
│   │   └── services/       # API integration
│   └── vite.config.js
├── database/
│   └── schema.sql          # PostgreSQL schema
├── .gitignore
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

# Create .env file (see secrets section below)

# Run migrations
node migrate_v9.js
node migrate_v10.js

# (Optional) Seed the database with sample data
npm run seed

# Start development server
npm run dev
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install

# Development
npm run dev            # Starts on http://localhost:3000 with proxy to backend

# Production build
npm run build          # Outputs to frontend/dist/
```

### 4. Environment Variables (`.env`)

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=csr_esg_platform
JWT_SECRET=<generate this>
PORT=5000
```

Generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Security:** The `.env` file is gitignored — secrets never committed.

## Default Login Credentials (seed data)

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

## Deployment

### Build frontend
```bash
cd frontend && npm run build
```

### Serve in production
**Option A — Backend serves frontend statically:**
Add to `backend/server.js`:
```js
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```

**Option B — Nginx/Caddy reverse proxy:**
- Serve `frontend/dist/` as static files
- Proxy `/api/*` and `/uploads/*` to backend

### Process management
Use `pm2` or `systemd` to keep the backend alive:
```bash
npm install -g pm2
pm2 start backend/server.js --name csr-backend
```

## Features

### Core
- **Role-based Authentication:** Admin, Company, NGO, Public User
- **NGO Management:** Verify, reject, edit NGOs
- **CSR Project Management:** Create, assign NGOs, status workflow
- **Progress Tracking:** Beneficiaries, budget utilization, progress %, file attachments
- **Document Upload:** PDF reports, images, supporting documents per project
- **Impact Score Engine:** Auto-calculates scores based on performance
- **NGO Trust Score:** Based on completion rate, reporting consistency, verification

### ESG & SDG
- **ESG Pillar Classification:** Each project tagged as Environmental / Social / Governance
- **ESG Dashboard:** Pillar-wise metrics with charts (global & company-scoped)
- **SDG Mapping:** Auto-maps project categories to UN Sustainable Development Goals

### Review & Visibility Workflow
- **NGO submits** progress updates, reports, and gallery images
- **Company reviews** each submission — check/uncheck review, add private feedback
- **Visibility toggle** (Public/Private) — only available *after* review
- **Reviewed badge + company feedback** visible to the NGO on their project page

### Admin
- **Admin Dashboard:** Overview stats, category bar chart
- **Manage NGOs:** Edit details, verify/reject
- **Manage Companies:** Edit name, industry, description
- **Manage Projects:** Edit fields, verify projects (verified projects counted in public stats)

### Public Dashboard
- **Project listings:** Shows in_progress and completed projects
- **Project detail page:** Photos, progress, SDG tags, NGO info
- **NGO profiles:** Bio, focus areas, projects, gallery
- **Impact Dashboard:** Static ESG metrics, impact score cards
- **Gallery page:** Masonry layout of all public project images

### Geo & Visualization
- **India Impact Map:** Geo-visualization with React Leaflet
- **Spending over time chart:** 5-year monthly budget utilization with horizontal scroll
- **Analytics dashboards:** Company stats (budget, impact, status breakdown), NGO performance, admin metrics

### UI
- **Dark Mode:** Full dark mode support
- **Responsive Design:** Modern SaaS-style UI
- **Cover images:** Per-project cover photo with upload
- **Photo Gallery:** Grid gallery per project with upload capability

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login
- `GET /api/auth/profile` — Get profile

### NGOs
- `POST /api/ngos/register` — Register NGO (with profile image upload)
- `GET /api/ngos` — List NGOs
- `GET /api/ngos/:id` — Get NGO by ID
- `GET /api/ngos/me` — My NGO profile
- `PUT /api/ngos/:id` — Update NGO (admin)
- `PATCH /api/ngos/:id/verify` — Verify NGO (admin)
- `PATCH /api/ngos/:id/reject` — Reject NGO (admin)
- `POST /api/ngos/profile-image` — Upload profile image
- `POST /api/ngos/gallery` — Upload gallery image
- `GET /api/ngos/gallery` — Get gallery images
- `DELETE /api/ngos/gallery/:id` — Delete gallery image

### Companies
- `POST /api/companies/register` — Register company (with profile image upload)
- `GET /api/companies` — List companies
- `GET /api/companies/:id` — Get company by ID
- `GET /api/companies/me` — My company profile
- `PUT /api/companies/:id` — Update company (admin)
- `POST /api/companies/profile-image` — Upload profile image
- `POST /api/companies/gallery` — Upload gallery image
- `GET /api/companies/gallery` — Get gallery images
- `DELETE /api/companies/gallery/:id` — Delete gallery image

### Projects
- `POST /api/projects` — Create project
- `GET /api/projects` — List projects
- `GET /api/projects/:id` — Project details (with updates & docs)
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `PATCH /api/projects/:id/assign` — Assign NGO
- `POST /api/projects/:id/cover-image` — Upload cover image
- `PATCH /api/projects/:id/verify` — Verify/unverify project (admin)

### Updates (Progress Reports)
- `POST /api/updates` — Add progress update (NGO, with optional file)
- `GET /api/updates/:projectId` — Get updates
- `PUT /api/updates/:id` — Edit update (NGO)
- `DELETE /api/updates/:id` — Delete update (NGO)
- `PATCH /api/updates/:id/visibility` — Toggle public/private (Company, after review)
- `PATCH /api/updates/:id/review` — Review update — set reviewed + optional comment (Company)

### Documents & Gallery
- `POST /api/documents/upload` — Upload file (NGO, admin)
- `GET /api/documents/:projectId` — Get project documents
- `GET /api/documents/my-gallery` — Get my gallery images
- `DELETE /api/documents/:id` — Delete document (NGO, admin)
- `PATCH /api/documents/:id/visibility` — Toggle public/private (Company, after review)
- `PATCH /api/documents/:id/review` — Review document — set reviewed + optional comment (Company)
- `GET /api/documents/download/:id` — Download document

### Analytics
- `GET /api/analytics/admin` — Admin dashboard stats
- `GET /api/analytics/company` — Company stats (budget, impact, status breakdown)
- `GET /api/analytics/company-esg` — Company-scoped ESG metrics (authenticated)
- `GET /api/analytics/ngo-stats` — NGO performance stats
- `GET /api/analytics/ngo-performance` — NGO performance ranking
- `GET /api/analytics/public` — Public stats (counts verified projects)
- `GET /api/analytics/map` — Geo map data
- `GET /api/analytics/esg` — Global ESG metrics (public)

### Public (no auth required)
- `GET /api/public/projects` — List public projects
- `GET /api/public/projects/:id` — Public project detail
- `GET /api/public/ngos` — List NGOs with focus areas
- `GET /api/public/ngos/:id` — NGO public profile
- `GET /api/public/gallery` — Public gallery
