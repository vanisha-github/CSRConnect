import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function NgoProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await projectAPI.getAll();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || p.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Assigned Projects</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No assigned projects" description="You will see projects here once a company assigns them to your NGO" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <Link key={project.id} to={`/ngo/projects/${project.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={project.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{project.category}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{project.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Company</span>
                  <span className="font-medium">{project.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Budget</span>
                  <span className="font-medium">₹{Number(project.budget).toLocaleString()}</span>
                </div>
                {project.impact_score > 0 && (
                  <div className="flex justify-between">
                    <span>Impact Score</span>
                    <span className="font-medium text-primary-600">{Number(project.impact_score).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
