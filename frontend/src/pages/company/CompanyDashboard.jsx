import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, projectAPI, companyAPI, documentAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [company, setCompany] = useState(null);
  const [profileGallery, setProfileGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes, companyRes, profileRes] = await Promise.all([
          analyticsAPI.getCompanyStats(),
          projectAPI.getAll(),
          companyAPI.getMyCompany(),
          companyAPI.getGallery().catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setRecent(projRes.data.slice(0, 5));
        setCompany(companyRes.data);
        setProfileGallery(profileRes.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await companyAPI.uploadProfileImage(formData);
      setCompany(data);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    try {
      const { data } = await companyAPI.removeProfileImage();
      setCompany(data);
    } catch (err) {
      console.error('Remove failed:', err);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await companyAPI.uploadGalleryImage(formData);
      setProfileGallery([data, ...profileGallery]);
    } catch (err) {
      console.error('Gallery upload failed:', err);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await companyAPI.deleteGalleryImage(id);
      setProfileGallery(profileGallery.filter(img => img.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Dashboard</h1>
        <Link to="/company/create" className="btn-primary">Create Project</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <DataCard title="Active Projects" value={stats?.active_projects || 0} color="blue" icon="M13 10V3L4 14h7v7l9-11h-7z" />
        <DataCard title="Completed" value={stats?.completed_projects || 0} color="green" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Total Budget" value={`₹${(stats?.total_budget || 0).toLocaleString()}`} color="yellow" icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <DataCard title="Beneficiaries" value={stats?.total_beneficiaries || 0} color="purple" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        <DataCard title="Pending Reviews" value={(stats?.pending_update_reviews || 0) + (stats?.pending_document_reviews || 0)} color="orange" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </div>

      {/* Profile Gallery */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile Gallery</h3>
        <div className="flex items-center gap-4 mb-4">
          {company?.profile_image ? (
            <img
              src={company.profile_image}
              alt="Company profile"
              className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-2xl">
              {company?.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <label className="btn-primary text-sm cursor-pointer">
            {uploading ? 'Uploading...' : 'Set Profile Photo'}
            <input type="file" onChange={handleProfileImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.svg" />
          </label>
          {company?.profile_image && (
            <button onClick={handleRemoveProfileImage} className="btn-secondary text-sm">Remove</button>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">Gallery Images</p>
          <label className="btn-secondary text-xs cursor-pointer">
            + Add Image
            <input type="file" onChange={handleGalleryUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.svg" />
          </label>
        </div>

        {profileGallery.length === 0 ? (
          <p className="text-sm text-gray-400">No gallery images yet. Click "+ Add Image" to upload.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profileGallery.map((img) => (
              <div key={img.id} className="group relative">
                <img
                  src={documentAPI.getViewUrl(img.file_path)}
                  alt={img.file_name}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => handleDeleteGallery(img.id)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Budget Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Total Budget</span>
                  <span className="font-medium">₹{stats.total_budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Utilized</span>
                  <span className="font-medium">₹{stats.budget_utilized.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div className="bg-primary-600 rounded-full h-2" style={{ width: `${stats.total_budget > 0 ? (stats.budget_utilized / stats.total_budget) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Category Distribution</h3>
            {stats.category_stats?.length > 0 ? (
              <div className="space-y-2">
                {stats.category_stats.map((c, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{c.category}</span>
                    <span className="font-medium">{c.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No projects yet</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Projects</h3>
        {recent.length === 0 ? (
          <EmptyState title="No projects yet" description="Create your first CSR project" />
        ) : (
          <div className="space-y-3">
            {recent.map((project) => (
              <Link key={project.id} to={`/company/projects/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                  <p className="text-xs text-gray-500">{project.category} • ₹{Number(project.budget).toLocaleString()}</p>
                </div>
                <StatusBadge status={project.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
