import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, projectAPI } from '../../services/api';
import DataCard from '../../components/DataCard';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function NgoDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          analyticsAPI.getNgoStats(),
          projectAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data);
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
