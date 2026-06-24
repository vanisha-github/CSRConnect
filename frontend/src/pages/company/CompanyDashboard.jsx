import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, projectAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CompanyDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          analyticsAPI.getCompanyStats(),
          projectAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setRecent(projRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Dashboard</h1>
        <Link to="/company/create" className="btn-primary">Create Project</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard title="Active Projects" value={stats?.active_projects || 0} color="blue" icon="M13 10V3L4 14h7v7l9-11h-7z" />
        <DataCard title="Completed" value={stats?.completed_projects || 0} color="green" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        <DataCard title="Total Budget" value={`₹${(stats?.total_budget || 0).toLocaleString()}`} color="yellow" icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        <DataCard title="Beneficiaries" value={stats?.total_beneficiaries || 0} color="purple" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
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
