import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChartComponent, PieChartComponent } from '../../components/Charts';

export default function ImpactDashboard() {
  const [esg, setEsg] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [esgRes, statsRes] = await Promise.all([
          analyticsAPI.getEsgMetrics(),
          analyticsAPI.getPublicStats(),
        ]);
        setEsg(esgRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load impact data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const sdgData = stats?.sdg_coverage?.map(s => ({ name: s.sdg_code, value: parseInt(s.count) })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Impact Dashboard</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Real-time ESG metrics and impact intelligence</p>
      </div>

      {/* ESG Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Environmental</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Trees Planted</p>
              <p className="text-2xl font-bold text-green-600">{esg?.environmental?.trees_planted?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Water Conserved (people)</p>
              <p className="text-2xl font-bold text-blue-600">{esg?.environmental?.water_conserved?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Social</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Students Educated</p>
              <p className="text-2xl font-bold text-purple-600">{esg?.social?.students_educated?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Women Empowered</p>
              <p className="text-2xl font-bold text-yellow-600">{esg?.social?.women_empowered?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Beneficiaries</p>
              <p className="text-2xl font-bold text-primary-600">{esg?.social?.beneficiaries_reached?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Governance</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Verified NGOs</p>
              <p className="text-2xl font-bold text-blue-600">{esg?.governance?.verified_ngos || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reports Uploaded</p>
              <p className="text-2xl font-bold text-purple-600">{esg?.governance?.reports_uploaded || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {sdgData.length > 0 && (
          <BarChartComponent data={sdgData} xKey="name" yKey="value" title="SDG Coverage" />
        )}
        {stats?.category_stats && stats.category_stats.length > 0 && (
          <PieChartComponent
            data={stats.category_stats.map(c => ({ name: c.category, value: parseInt(c.count) }))}
            dataKey="value"
            nameKey="name"
            title="Project Categories"
          />
        )}
      </div>

      {/* Top Impact Projects */}
      {esg?.top_impact_projects && esg.top_impact_projects.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Impact Projects</h3>
          <div className="space-y-3">
            {esg.top_impact_projects.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.ngo_name || 'N/A'} • {p.category}</p>
                </div>
                <span className="text-lg font-bold text-primary-600">{Number(p.score).toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
