import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChartComponent } from '../../components/Charts';

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [ngoPerf, setNgoPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, perfRes] = await Promise.all([
          analyticsAPI.getAdminStats(),
          analyticsAPI.getNgoPerformance(),
        ]);
        setStats(statsRes.data);
        setNgoPerf(perfRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Analytics Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard title="Total Beneficiaries" value={stats?.total_beneficiaries || 0} color="blue" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        <DataCard title="Verified NGOs" value={stats?.verified_ngos || 0} color="green" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Active Projects" value={stats?.active_projects || 0} color="purple" icon="M13 10V3L4 14h7v7l9-11h-7z" />
        <DataCard title="Completion Rate" value={stats?.total_projects > 0 ? `${((stats.completed_projects / stats.total_projects) * 100).toFixed(1)}%` : '0%'} color="green" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </div>

      {/* NGO Performance */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">NGO Performance</h3>
        {ngoPerf.length === 0 ? (
          <p className="text-sm text-gray-500">No NGO data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">NGO</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Projects</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {ngoPerf.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{ngo.ngo_name}</td>
                    <td className="px-4 py-3 text-sm">{ngo.total_projects}</td>
                    <td className="px-4 py-3 text-sm">{ngo.completed_projects}</td>
                    <td className="px-4 py-3 text-sm">₹{Number(ngo.total_budget).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{Number(ngo.total_beneficiaries).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary-600">{Number(ngo.trust_score).toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${ngo.verified ? 'text-green-600' : 'text-red-600'}`}>
                        {ngo.verified ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Distribution */}
      {stats?.category_stats && stats.category_stats.length > 0 && (
        <BarChartComponent
          data={stats.category_stats.map(c => ({ name: c.category, value: parseInt(c.count) }))}
          xKey="name"
          yKey="value"
          title="Projects by Category"
        />
      )}
    </div>
  );
}
