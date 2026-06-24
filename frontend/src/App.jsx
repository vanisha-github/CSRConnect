import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Public pages
import Home from './pages/public/Home';
import PublicProjects from './pages/public/PublicProjects';
import PublicNgos from './pages/public/PublicNgos';
import ImpactDashboard from './pages/public/ImpactDashboard';
import IndiaMap from './pages/public/IndiaMap';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminNgos from './pages/admin/AdminNgos';
import AdminProjects from './pages/admin/AdminProjects';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Company pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProjects from './pages/company/CompanyProjects';
import CompanyProjectDetails from './pages/company/CompanyProjectDetails';
import CompanyCreate from './pages/company/CompanyCreate';
import CompanyAnalytics from './pages/company/CompanyAnalytics';

// NGO pages
import NgoDashboard from './pages/ngo/NgoDashboard';
import NgoProjects from './pages/ngo/NgoProjects';
import NgoProjectDetails from './pages/ngo/NgoProjectDetails';
import NgoReports from './pages/ngo/NgoReports';

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(role)) return <Navigate to={`/${role}`} />;
  return children;
}

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/public/projects" element={<PublicLayout><PublicProjects /></PublicLayout>} />
      <Route path="/public/ngos" element={<PublicLayout><PublicNgos /></PublicLayout>} />
      <Route path="/public/impact" element={<PublicLayout><ImpactDashboard /></PublicLayout>} />
      <Route path="/public/map" element={<PublicLayout><IndiaMap /></PublicLayout>} />

      {/* Auth routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={`/${role}`} /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={`/${role}`} /> : <Register />} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/ngos" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin"><AdminNgos /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin"><AdminProjects /></DashboardLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin"><AdminAnalytics /></DashboardLayout></ProtectedRoute>} />

      {/* Company routes */}
      <Route path="/company" element={<ProtectedRoute roles={['company']}><DashboardLayout role="company"><CompanyDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/company/projects" element={<ProtectedRoute roles={['company']}><DashboardLayout role="company"><CompanyProjects /></DashboardLayout></ProtectedRoute>} />
      <Route path="/company/projects/:id" element={<ProtectedRoute roles={['company']}><DashboardLayout role="company"><CompanyProjectDetails /></DashboardLayout></ProtectedRoute>} />
      <Route path="/company/create" element={<ProtectedRoute roles={['company']}><DashboardLayout role="company"><CompanyCreate /></DashboardLayout></ProtectedRoute>} />
      <Route path="/company/analytics" element={<ProtectedRoute roles={['company']}><DashboardLayout role="company"><CompanyAnalytics /></DashboardLayout></ProtectedRoute>} />

      {/* NGO routes */}
      <Route path="/ngo" element={<ProtectedRoute roles={['ngo']}><DashboardLayout role="ngo"><NgoDashboard /></DashboardLayout></ProtectedRoute>} />
      <Route path="/ngo/projects" element={<ProtectedRoute roles={['ngo']}><DashboardLayout role="ngo"><NgoProjects /></DashboardLayout></ProtectedRoute>} />
      <Route path="/ngo/projects/:id" element={<ProtectedRoute roles={['ngo']}><DashboardLayout role="ngo"><NgoProjectDetails /></DashboardLayout></ProtectedRoute>} />
      <Route path="/ngo/reports" element={<ProtectedRoute roles={['ngo']}><DashboardLayout role="ngo"><NgoReports /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
