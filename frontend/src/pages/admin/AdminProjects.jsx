import { useState, useEffect } from 'react';
import { projectAPI, ngoAPI, documentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [docModal, setDocModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, ngoRes] = await Promise.all([projectAPI.getAll(), ngoAPI.getAll()]);
        setProjects(projRes.data);
        setNgos(ngoRes.data);
        const docPromises = projRes.data.map(async (p) => {
          try {
            const { data } = await documentAPI.getByProject(p.id);
            return { projectId: p.id, docs: data };
          } catch { return { projectId: p.id, docs: [] }; }
        });
        const docResults = await Promise.all(docPromises);
        const docMap = {};
        docResults.forEach((r) => { docMap[r.projectId] = r.docs; });
        setDocuments(docMap);
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Reports</th>
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
                      <button onClick={() => setDocModal(project)} className="text-xs text-primary-600 hover:text-primary-500 font-medium">
                        {documents[project.id]?.length || 0} reports
                      </button>
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
      {/* Document Modal */}
      {docModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDocModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reports - {docModal.title}</h3>
              <button onClick={() => setDocModal(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            {(!documents[docModal.id] || documents[docModal.id].length === 0) ? (
              <p className="text-sm text-gray-500">No reports uploaded</p>
            ) : (
              <div className="space-y-2">
                {documents[docModal.id].map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={documentAPI.getDownloadUrl(doc.id)} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-2 py-1 shrink-0 ml-2">Download</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
