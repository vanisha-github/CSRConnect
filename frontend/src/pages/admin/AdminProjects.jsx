import { useState, useEffect } from 'react';
import { projectAPI, ngoAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function AdminProjects() {
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
        setNgos(ngoRes.data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.company_name?.toLowerCase().includes(search.toLowerCase());
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

  const handleStatusChange = async (projectId, status) => {
    try {
      await projectAPI.update(projectId, { status });
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Project Monitoring</h1>
        <span className="text-sm text-gray-500">{projects.length} Projects</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState title="No projects found" /> : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">NGO</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{project.title}</p>
                      <p className="text-xs text-gray-500">{project.category}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{project.company_name}</td>
                    <td className="px-4 py-3 text-sm">
                      {project.ngo_name ? (
                        <span className="text-gray-600 dark:text-gray-400">{project.ngo_name}</span>
                      ) : (
                        <select
                          onChange={(e) => handleAssign(project.id, parseInt(e.target.value))}
                          className="input-field text-xs p-1"
                          defaultValue=""
                        >
                          <option value="" disabled>Assign NGO</option>
                          {ngos.filter(n => n.verified).map(ngo => (
                            <option key={ngo.id} value={ngo.id}>{ngo.ngo_name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">₹{Number(project.budget).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary-600">{Number(project.impact_score).toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project.id, e.target.value)}
                        className="input-field text-xs p-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge status={project.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
