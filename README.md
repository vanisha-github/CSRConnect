# CSR & ESG Impact Intelligence Platform

A full-stack platform for managing and tracking Corporate Social Responsibility (CSR) projects with ESG impact metrics, featuring NGO/company dashboards, admin review workflow, public impact dashboard, and real-time analytics.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Axios, Recharts, React Leaflet
- **Backend:** Node.js, Express.js, JWT Authentication, Multer (Cloudinary storage)
- **Database:** PostgreSQL (Neon or local)
- **File Storage:** Cloudinary

## Project Structure

```
├── backend/
│   ├── config/             # Database connection & seed
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, upload (Cloudinary), error handling
│   ├── routes/             # Express routes
│   ├── services/           # Impact score engine
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
- PostgreSQL (v14+) or Neon account
- npm
- Cloudinary account (for file uploads)

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

# Create .env file (see below)

# Run all migrations in order
node migrate_v2.js
node migrate_v3.js
node migrate_v4.js
node migrate_v5.js
node migrate_v6.js
node migrate_v7.js
node migrate_v8.js
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

# Development (proxies API calls to backend)
npm run dev    # Starts on http://localhost:3000

# Production build
npm run build  # Outputs to frontend/dist/
```

Set `VITE_API_URL` environment variable for production builds (the full backend URL + `/api`, e.g. `https://your-backend.com/api`). In development it defaults to `/api` and uses the Vite proxy.

### 4. Environment Variables (`.env`)

Create `backend/.env`:

```env
# Database (local)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=csr_esg_platform

# or use a single connection string (Neon/Render)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

JWT_SECRET=<generate this>
PORT=5000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

## Features

### Core
- **Role-based Authentication:** Admin, Company, NGO, Public User
- **NGO Management:** Verify, reject, edit NGOs with trust scoring
- **CSR Project Management:** Create, assign NGOs, status workflow (pending → active → completed)
- **Progress Tracking:** Beneficiaries, budget utilization, progress %, file attachments
- **Document Upload:** PDF reports, images, supporting documents per project

### ESG & SDG
- **ESG Pillar Classification:** Each project tagged as Environmental / Social / Governance
- **ESG Dashboard:** Pillar-wise metrics with charts (global & company-scoped)
- **SDG Mapping:** Auto-maps project categories to UN Sustainable Development Goals

### Review & Visibility Workflow
- **NGO submits** progress updates, reports, and gallery images
- **Company reviews** each submission — mark reviewed, add private feedback
- **Visibility toggle** (Public/Private) — only available after review
- **Reviewed badge + company feedback** visible to the NGO on their project page
- Only reviewed + public content appears on the public dashboard

### Admin
- **Dashboard:** Overview stats with category breakdown chart
- **Manage NGOs:** Edit details, verify/reject
- **Manage Companies:** Edit name, industry, description
- **Manage Projects:** Edit fields, verify projects

### Public Dashboard
- **Project listings & detail pages:** Photos, progress timeline, SDG tags, NGO partner info
- **NGO profiles:** Bio, focus areas, completed/ongoing projects, gallery
- **Impact Dashboard:** ESG metrics, impact score cards
- **Gallery page:** All public project images and cover photos
- **India Impact Map:** Geo-visualization with React Leaflet

### Analytics
- **Admin analytics:** Platform-wide stats
- **Company analytics:** Budget utilization, impact metrics, status breakdown, ESG distribution
- **NGO analytics:** Performance stats, ranking by trust score
- **Public analytics:** Aggregate statistics, ESG metrics

### File Handling
- **Cloudinary uploads:** All files stored on Cloudinary (no local disk storage)
- **Download proxy:** `GET /api/files/download?url=...&name=...` forces correct filenames on download
- **Automatic resource type:** Images delivered as `image`, PDFs/docs as `raw`

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
- `PUT /api/updates/:id` — Edit update (NGO, resets review state)
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

### Files
- `GET /api/files/download?url=...&name=...` — Proxy download with correct filename (no auth)

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

## Deployment

### Build frontend
```bash
cd frontend && npm run build
```

Set `VITE_API_URL` to your backend URL during build.

### Serve in production
**Option A — Backend serves frontend statically:**
Add to `backend/server.js`:
```js
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));
```

**Option B — Separate hosting (e.g. Vercel + Render):**
- Deploy `frontend/` to Vercel with `VITE_API_URL` pointing to backend
- Deploy `backend/` to Render with `DATABASE_URL` and Cloudinary env vars
- Ensure CORS is configured on the backend

### Process management
```bash
npm install -g pm2
pm2 start backend/server.js --name csr-backend
```
