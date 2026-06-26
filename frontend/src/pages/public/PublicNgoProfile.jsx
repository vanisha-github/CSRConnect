import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function PublicNgoProfile() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicAPI.getNgoById(id);
        setNgo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!ngo) return <div className="text-center py-12 text-gray-500">NGO not found</div>;

  const yearsActive = ngo.years_of_experience || Math.max(1, new Date().getFullYear() - new Date(ngo.created_at).getFullYear());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/public/ngos" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Back to NGOs</Link>

      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {ngo.profile_image ? (
            <img src={ngo.profile_image} alt="" className="w-24 h-24 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary-600">{ngo.ngo_name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ngo.ngo_name}</h1>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">Verified</span>
            </div>
            {ngo.registration_number && <p className="text-sm text-gray-500">Reg: {ngo.registration_number}</p>}
            {ngo.about && <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 whitespace-pre-line">{ngo.about}</p>}
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600">{Number(ngo.trust_score).toFixed(1)}</p>
                <p className="text-xs text-gray-500">Trust Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ngo.total_projects || 0}</p>
                <p className="text-xs text-gray-500">Total Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ngo.completed_projects || 0}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{ngo.ongoing_projects || 0}</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{(ngo.total_beneficiaries || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Beneficiaries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{yearsActive}</p>
                <p className="text-xs text-gray-500">Years Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Contact & Info */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact</h3>
          <div className="space-y-2 text-sm">
            {ngo.email && <p><span className="text-gray-500">Email:</span> {ngo.email}</p>}
            {ngo.phone && <p><span className="text-gray-500">Phone:</span> {ngo.phone}</p>}
            {ngo.address && <p><span className="text-gray-500">Address:</span> {ngo.address}</p>}
            {ngo.website && (
              <p><span className="text-gray-500">Website:</span>{' '}
                <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 underline">{ngo.website}</a>
              </p>
            )}
            {ngo.operating_locations && <p><span className="text-gray-500">Locations:</span> {ngo.operating_locations}</p>}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {ngo.focus_areas_list?.length > 0 ? ngo.focus_areas_list.map((area, i) => (
              <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{area}</span>
            )) : <span className="text-sm text-gray-400">No focus areas listed</span>}
          </div>
        </div>

        {/* SDG Goals */}
        {ngo.sdg_tags?.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SDG Goals Supported</h3>
            <div className="flex flex-wrap gap-2">
              {ngo.sdg_tags.map((sdg, i) => (
                <span key={i} className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">{sdg}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gallery */}
      {ngo.gallery?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">NGO Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ngo.gallery.map((img) => (
              <a key={img.id} href={img.file_path} target="_blank" rel="noopener noreferrer">
                <img src={img.file_path} alt={img.file_name} className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Completed Projects */}
      {ngo.completed_projects_list?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Completed Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngo.completed_projects_list.map((p) => (
              <Link key={p.id} to={`/public/projects/${p.id}?from=ngo&ngoId=${ngo.id}`} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-gray-500">{p.category}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{p.title}</p>
                <p className="text-xs text-gray-500 mt-1">{p.company_name}</p>
                {p.impact_score > 0 && <p className="text-xs text-primary-600 mt-1">Score: {Number(p.impact_score).toFixed(1)}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Projects */}
      {ngo.ongoing_projects_list?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Ongoing Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ngo.ongoing_projects_list.map((p) => (
              <Link key={p.id} to={`/public/projects/${p.id}?from=ngo&ngoId=${ngo.id}`} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-gray-500">{p.category}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{p.title}</p>
                <p className="text-xs text-gray-500 mt-1">{p.company_name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
