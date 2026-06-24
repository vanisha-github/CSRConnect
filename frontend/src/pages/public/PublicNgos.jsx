import { useState, useEffect } from 'react';
import { publicAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
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
          {ngos.map(ngo => (
            <div key={ngo.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600">
                    {ngo.ngo_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ngo.ngo_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ngo.registration_number}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {ngo.email && <p>Email: {ngo.email}</p>}
                {ngo.phone && <p>Phone: {ngo.phone}</p>}
                {ngo.address && <p className="truncate">Address: {ngo.address}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>Trust Score</span>
                  <span className="font-bold text-primary-600">{Number(ngo.trust_score).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
