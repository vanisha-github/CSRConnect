import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectAPI, ngoAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function CompanyProjects() {
  const [projects, setProjects] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, ngoRes] = await Promise.all([projectAPI.getAll(), ngoAPI.getAll()]);
        setProjects(projRes.data);
        setNgos(ngoRes.data.filter(n => n.verified));
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAssign = async (projectId, ngoId) => {
    try {
      await projectAPI.assignNgo(projectId, ngoId);
      const { data } = await projectAPI.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await projectAPI.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await projectAPI.update(id, { status });
      const { data } = await projectAPI.getAll();
      setProjects(data);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Projects</h1>
        <Link to="/company/create" className="btn-primary text-sm">+ New Project</Link>
      </div>

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

      {filtered.length === 0 ? <EmptyState title="No projects found" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <StatusBadge status={project.status} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{project.category}</span>
              </div>

              <Link to={`/company/projects/${project.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 hover:text-primary-600">{project.title}</h3>
              </Link>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex justify-between">
                  <span>Budget</span>
                  <span className="font-medium">₹{Number(project.budget).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>NGO</span>
                  <span className="font-medium">{project.ngo_name || 'Not assigned'}</span>
                </div>
                {project.impact_score > 0 && (
                  <div className="flex justify-between">
                    <span>Impact Score</span>
                    <span className="font-medium text-primary-600">{Number(project.impact_score).toFixed(1)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {!project.ngo_id && ngos.length > 0 && (
                  <select
                    onChange={(e) => handleAssign(project.id, parseInt(e.target.value))}
                    className="input-field text-xs flex-1"
                    defaultValue=""
                  >
                    <option value="" disabled>Assign NGO</option>
                    {ngos.map(ngo => <option key={ngo.id} value={ngo.id}>{ngo.ngo_name}</option>)}
                  </select>
                )}
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  className="input-field text-xs flex-1"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button onClick={() => handleDelete(project.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
