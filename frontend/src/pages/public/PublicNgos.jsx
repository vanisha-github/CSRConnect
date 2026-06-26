import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function PublicNgos() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const { data } = await publicAPI.getNgos();
        setNgos(data);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Verified NGOs</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Trusted implementation partners making a difference</p>
      </div>

      {ngos.length === 0 ? <EmptyState title="No verified NGOs yet" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngos.map(ngo => {
            const categories = ngo.focus_areas_list || [];
            return (
            <Link key={ngo.id} to={`/public/ngos/${ngo.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-center gap-3 mb-4">
                {ngo.profile_image ? (
                  <img src={ngo.profile_image} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold text-primary-600">{ngo.ngo_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ngo.ngo_name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-500">Trust Score: {Number(ngo.trust_score).toFixed(1)}</span>
                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">Verified</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>Completed Projects</span>
                  <span className="font-medium">{ngo.completed_projects || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongoing Projects</span>
                  <span className="font-medium">{ngo.ongoing_projects || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Beneficiaries</span>
                  <span className="font-medium">{(ngo.total_beneficiaries || 0).toLocaleString()}</span>
                </div>
              </div>

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {categories.slice(0, 3).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{c}</span>
                  ))}
                  {categories.length > 3 && <span className="text-xs text-gray-400">+{categories.length - 3}</span>}
                </div>
              )}

              <span className="btn-primary text-sm text-center block">View Profile</span>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
