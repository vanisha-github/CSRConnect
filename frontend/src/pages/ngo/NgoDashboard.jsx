import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, projectAPI, ngoAPI, documentAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function isImage(name) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name);
}

export default function NgoDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [ngo, setNgo] = useState(null);
  const [profileGallery, setProfileGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes, ngoRes, profileRes] = await Promise.all([
          analyticsAPI.getNgoStats(),
          projectAPI.getAll(),
          ngoAPI.getMyNgo(),
          ngoAPI.getGallery().catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data);
        setNgo(ngoRes.data);
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
      const { data } = await ngoAPI.uploadProfileImage(formData);
      setNgo(data);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    try {
      const { data } = await ngoAPI.removeProfileImage();
      setNgo(data);
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
      const { data } = await ngoAPI.uploadGalleryImage(formData);
      setProfileGallery([data, ...profileGallery]);
    } catch (err) {
      console.error('Gallery upload failed:', err);
    }
  };

  const handleEditProfile = () => {
    setProfileForm({
      ngo_name: ngo?.ngo_name || '',
      registration_number: ngo?.registration_number || '',
      email: ngo?.email || '',
      phone: ngo?.phone || '',
      address: ngo?.address || '',
      about: ngo?.about || '',
      website: ngo?.website || '',
      operating_locations: ngo?.operating_locations || '',
      focus_areas: ngo?.focus_areas || '',
      years_of_experience: ngo?.years_of_experience || '',
      email_public: ngo?.email_public !== false,
      phone_public: ngo?.phone_public !== false,
      address_public: ngo?.address_public !== false,
      website_public: ngo?.website_public !== false,
      about_public: ngo?.about_public !== false,
      operating_locations_public: ngo?.operating_locations_public !== false,
      registration_number_public: ngo?.registration_number_public === true,
    });
    setEditingProfile(true);
  };

  const handleProfileSave = async () => {
    try {
      const { data } = await ngoAPI.update(ngo.id, profileForm);
      setNgo(data);
      setEditingProfile(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await ngoAPI.deleteGalleryImage(id);
      setProfileGallery(profileGallery.filter(img => img.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">NGO Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard title="Assigned Projects" value={stats?.assigned_projects || 0} color="blue" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <DataCard title="Pending Updates" value={stats?.pending_updates || 0} color="yellow" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Submitted Reports" value={stats?.submitted_reports || 0} color="green" icon="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        <DataCard title="Total Beneficiaries" value={stats?.total_beneficiaries || 0} color="purple" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </div>

      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Budget Overview</h3>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Total Budget Managed</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">₹{Number(stats?.total_budget || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profile Information</h3>
          {!editingProfile && <button onClick={handleEditProfile} className="btn-secondary text-xs">Edit Profile</button>}
        </div>
        {editingProfile ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">NGO Name</label>
                <input type="text" value={profileForm.ngo_name} onChange={(e) => setProfileForm({...profileForm, ngo_name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Registration Number</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={profileForm.registration_number} onChange={(e) => setProfileForm({...profileForm, registration_number: e.target.value})} className="input-field flex-1" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <input type="checkbox" checked={profileForm.registration_number_public} onChange={(e) => setProfileForm({...profileForm, registration_number_public: e.target.checked})} className="rounded" />
                    Public
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email</label>
                <div className="flex items-center gap-2">
                  <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} className="input-field flex-1" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <input type="checkbox" checked={profileForm.email_public} onChange={(e) => setProfileForm({...profileForm, email_public: e.target.checked})} className="rounded" />
                    Public
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                <div className="flex items-center gap-2">
                  <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="input-field flex-1" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <input type="checkbox" checked={profileForm.phone_public} onChange={(e) => setProfileForm({...profileForm, phone_public: e.target.checked})} className="rounded" />
                    Public
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Website</label>
                <div className="flex items-center gap-2">
                  <input type="url" value={profileForm.website} onChange={(e) => setProfileForm({...profileForm, website: e.target.value})} className="input-field flex-1" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <input type="checkbox" checked={profileForm.website_public} onChange={(e) => setProfileForm({...profileForm, website_public: e.target.checked})} className="rounded" />
                    Public
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Years of Experience</label>
                <input type="number" value={profileForm.years_of_experience} onChange={(e) => setProfileForm({...profileForm, years_of_experience: e.target.value})} className="input-field" min={0} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Address</label>
              <div className="flex items-center gap-2">
                <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} className="input-field flex-1" />
                <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <input type="checkbox" checked={profileForm.address_public} onChange={(e) => setProfileForm({...profileForm, address_public: e.target.checked})} className="rounded" />
                  Public
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Operating Locations</label>
              <div className="flex items-center gap-2">
                <input type="text" value={profileForm.operating_locations} onChange={(e) => setProfileForm({...profileForm, operating_locations: e.target.value})} className="input-field flex-1" placeholder="e.g. Mumbai, Delhi, Bangalore" />
                <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                  <input type="checkbox" checked={profileForm.operating_locations_public} onChange={(e) => setProfileForm({...profileForm, operating_locations_public: e.target.checked})} className="rounded" />
                  Public
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Focus Areas</label>
              <input type="text" value={profileForm.focus_areas} onChange={(e) => setProfileForm({...profileForm, focus_areas: e.target.value})} className="input-field" placeholder="e.g. Education, Healthcare, Environment" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">About</label>
              <div className="flex items-center gap-2">
                <textarea value={profileForm.about} onChange={(e) => setProfileForm({...profileForm, about: e.target.value})} className="input-field flex-1" rows={3} />
                <label className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap self-start mt-2">
                  <input type="checkbox" checked={profileForm.about_public} onChange={(e) => setProfileForm({...profileForm, about_public: e.target.checked})} className="rounded" />
                  Public
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleProfileSave} className="btn-primary text-sm">Save</button>
              <button onClick={() => setEditingProfile(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-500">Name</span><p className="font-medium">{ngo?.ngo_name}</p></div>
            <div><span className="text-gray-500">Reg No.</span><p className="font-medium">{ngo?.registration_number || '—'}</p></div>
            <div><span className="text-gray-500">Email</span><p className="font-medium">{ngo?.email || '—'}</p></div>
            <div><span className="text-gray-500">Phone</span><p className="font-medium">{ngo?.phone || '—'}</p></div>
            <div><span className="text-gray-500">Website</span><p className="font-medium">{ngo?.website || '—'}</p></div>
            <div><span className="text-gray-500">Experience</span><p className="font-medium">{ngo?.years_of_experience ? `${ngo.years_of_experience} years` : '—'}</p></div>
            <div className="col-span-2"><span className="text-gray-500">Location</span><p className="font-medium">{ngo?.operating_locations || '—'}</p></div>
          </div>
        )}
      </div>

      {/* Profile Gallery */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Profile Gallery</h3>
        <div className="flex items-center gap-4 mb-4">
          {ngo?.profile_image ? (
            <img
              src={ngo.profile_image}
              alt="NGO profile"
              className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-2xl">
              {ngo?.ngo_name?.charAt(0) || 'N'}
            </div>
          )}
          <label className="btn-primary text-sm cursor-pointer">
            {uploading ? 'Uploading...' : 'Set Profile Photo'}
            <input type="file" onChange={handleProfileImageUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.svg" />
          </label>
          {ngo?.profile_image && (
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

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">My Projects</h3>
        {projects.length === 0 ? (
          <EmptyState title="No projects assigned yet" description="Wait for companies to assign projects to your NGO" />
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link key={project.id} to={`/ngo/projects/${project.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                  <p className="text-xs text-gray-500">{project.company_name} • ₹{Number(project.budget).toLocaleString()}</p>
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
