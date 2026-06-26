import { useState, useEffect, useRef } from 'react';
import { analyticsAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#10b981'];

export default function CompanyAnalytics() {
  const [stats, setStats] = useState(null);
  const [esg, setEsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, esgRes] = await Promise.all([
          analyticsAPI.getCompanyStats(),
          analyticsAPI.getCompanyEsgMetrics(),
        ]);
        setStats(statsRes.data);
        setEsg(esgRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalActive = (stats?.total_projects || 0) - (stats?.completed_projects || 0) - (stats?.cancelled_projects || 0);
  const completionRate = stats?.total_projects > 0 ? ((stats.completed_projects / stats.total_projects) * 100).toFixed(1) : '0';

  const categoryData = stats?.category_stats?.map(c => ({ name: c.category, value: parseInt(c.count) })) || [];
  const monthlyData = stats?.monthly_budget?.map(m => ({ name: m.month, value: parseFloat(m.budget) })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Company Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard title="Spending Analysis" value={`₹${(stats?.budget_utilized || 0).toLocaleString()}`} color="blue" subtitle={`Of ₹${(stats?.total_budget || 0).toLocaleString()} total budget`} icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <DataCard title="Budget Utilization" value={stats?.total_budget > 0 ? `${((stats.budget_utilized / stats.total_budget) * 100).toFixed(1)}%` : '0%'} color="green" subtitle={`₹${(stats?.budget_utilized || 0).toLocaleString()} of ₹${(stats?.total_budget || 0).toLocaleString()}`} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <DataCard title="Completion Rate" value={`${completionRate}%`} color="purple" subtitle={`${stats?.completed_projects || 0} of ${stats?.total_projects || 0} projects`} icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Avg Impact Score" value={Number(stats?.avg_impact_score || 0).toFixed(1)} color="yellow" subtitle={`${stats?.total_beneficiaries?.toLocaleString() || 0} beneficiaries`} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Impact Comparison by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value" nameKey="name">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        {monthlyData.length > 0 && (
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Spending Over Time (Last 5 Years)</h3>
            <div className="overflow-x-auto pb-2">
              <div style={{ minWidth: Math.max(monthlyData.length * 50, 400) }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9ca3af" angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#f3f4f6' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {esg && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">ESG Pillar Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="text-xs font-medium text-green-700 dark:text-green-300 uppercase mb-2">Environmental</h4>
              <p className="text-sm text-green-800 dark:text-green-200">Projects: {esg.environmental?.projects || 0}</p>
              <p className="text-sm text-green-800 dark:text-green-200">Beneficiaries: {(esg.environmental?.beneficiaries || 0).toLocaleString()}</p>
              <p className="text-sm text-green-800 dark:text-green-200">Budget: ₹{(esg.environmental?.budget || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase mb-2">Social</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">Projects: {esg.social?.projects || 0}</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">Beneficiaries: {(esg.social?.beneficiaries || 0).toLocaleString()}</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">Budget: ₹{(esg.social?.budget || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase mb-2">Governance</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">Projects: {esg.governance?.projects || 0}</p>
              <p className="text-sm text-purple-800 dark:text-purple-200">Beneficiaries: {(esg.governance?.beneficiaries || 0).toLocaleString()}</p>
              <p className="text-sm text-purple-800 dark:text-purple-200">Budget: ₹{(esg.governance?.budget || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
