import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChartComponent, PieChartComponent, LineChartComponent } from '../../components/Charts';

export default function CompanyAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await analyticsAPI.getCompanyStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const categoryData = stats?.category_stats?.map(c => ({ name: c.category, value: parseInt(c.count) })) || [];
  const monthlyData = stats?.monthly_budget?.map(m => ({ name: m.month, value: parseFloat(m.budget) })) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Company Analytics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard title="Spending Analysis" value={`₹${(stats?.budget_utilized || 0).toLocaleString()}`} color="blue" subtitle={`Of ${(stats?.total_budget || 0).toLocaleString()} total budget`} icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <DataCard title="Budget Utilization" value={stats?.total_budget > 0 ? `${((stats.budget_utilized / stats.total_budget) * 100).toFixed(1)}%` : '0%'} color="green" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        <DataCard title="Completion Rate" value={stats?.total_projects > 0 ? `${((stats.completed_projects / stats.total_projects) * 100).toFixed(1)}%` : '0%'} color="purple" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Avg Impact Per Project" value={stats?.total_beneficiaries > 0 && stats?.total_projects > 0 ? Math.round(stats.total_beneficiaries / stats.total_projects).toLocaleString() : '0'} color="yellow" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categoryData.length > 0 && (
          <PieChartComponent data={categoryData} dataKey="value" nameKey="name" title="Impact Comparison by Category" />
        )}
        {monthlyData.length > 0 && (
          <BarChartComponent data={monthlyData} xKey="name" yKey="value" title="Spending Over Time" />
        )}
      </div>

      {stats && (
        <div className="card mt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">ESG Metrics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Environmental</h4>
              <p className="text-sm">Projects: {stats.category_stats?.find(c => c.category === 'Plantation')?.count || 0}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Social</h4>
              <p className="text-sm">Beneficiaries: {stats.total_beneficiaries?.toLocaleString() || 0}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Governance</h4>
              <p className="text-sm">Projects Completed: {stats.completed_projects || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
