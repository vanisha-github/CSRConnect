import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, documentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CompanyProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await projectAPI.getById(id);
        setProject(data);
        try {
          const docRes = await documentAPI.getByProject(id);
          setDocuments(docRes.data);
        } catch {}
      } catch (err) {
        console.error('Failed to load project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div>
      <Link to="/company/projects" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Back to Projects</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.category} • {project.status}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{project.description || 'No description provided'}</p>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">₹{Number(project.budget).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Start Date</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">End Date</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Impact Summary</h3>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{Number(project.impact_score).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Impact Score</p>
            </div>
            {project.ngo_name && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500">Assigned NGO</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{project.ngo_name}</p>
                {project.ngo_trust_score !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">Trust Score: {Number(project.ngo_trust_score).toFixed(1)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SDG Tags */}
      {project.sdg_tags && project.sdg_tags.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SDG Alignment</h3>
          <div className="flex flex-wrap gap-2">
            {project.sdg_tags.map((sdg, i) => (
              <span key={i} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{sdg}</span>
            ))}
          </div>
        </div>
      )}

      {/* Progress Updates */}
      {project.updates && project.updates.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Progress Updates</h3>
          <div className="space-y-4">
            {project.updates.map((update) => (
              <div key={update.id} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="font-semibold">{update.progress_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Beneficiaries</p>
                    <p className="font-semibold">{update.beneficiaries_reached}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Budget Used</p>
                    <p className="font-semibold">₹{Number(update.budget_utilized).toLocaleString()}</p>
                  </div>
                </div>
                {update.remarks && <p className="text-sm text-gray-600 dark:text-gray-400">{update.remarks}</p>}
                <p className="text-xs text-gray-400 mt-2">{new Date(update.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Reports & Documents</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
