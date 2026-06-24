import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChartComponent, PieChartComponent } from '../../components/Charts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await analyticsAPI.getAdminStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const categoryData = stats?.category_stats?.map(c => ({ name: c.category, value: parseInt(c.count) })) || [];
  const statusData = stats?.status_stats?.map(s => ({ name: s.status, value: parseInt(s.count) })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <DataCard title="Total Companies" value={stats?.total_companies || 0} color="primary" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        <DataCard title="Total NGOs" value={stats?.total_ngos || 0} color="green" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        <DataCard title="Total Projects" value={stats?.total_projects || 0} color="blue" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        <DataCard title="Total CSR Budget" value={`₹${(stats?.total_budget || 0).toLocaleString()}`} color="yellow" icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <DataCard title="Active Projects" value={stats?.active_projects || 0} color="purple" icon="M13 10V3L4 14h7v7l9-11h-7z" />
        <DataCard title="Completed Projects" value={stats?.completed_projects || 0} color="green" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <BarChartComponent data={categoryData} xKey="name" yKey="value" title="Projects by Category" />
        )}
        {statusData.length > 0 && (
          <PieChartComponent data={statusData} dataKey="value" nameKey="name" title="Project Status Distribution" />
        )}
      </div>
    </div>
  );
}
