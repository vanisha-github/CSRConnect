import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, updateAPI, documentAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function NgoProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateForm, setUpdateForm] = useState({ beneficiaries_reached: '', budget_utilized: '', progress_percentage: '', remarks: '' });
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    try {
      await updateAPI.add({ project_id: parseInt(id), ...updateForm });
      setShowUpdateForm(false);
      setUpdateForm({ beneficiaries_reached: '', budget_utilized: '', progress_percentage: '', remarks: '' });
      fetchData();
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to submit update');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    try {
      await documentAPI.upload(formData);
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div>
      <Link to="/ngo/projects" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Back to Projects</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.company_name} • {project.category}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{project.description || 'No description'}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="font-semibold">₹{Number(project.budget).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-semibold">{project.location || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Timeline</p>
              <p className="font-semibold">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Impact Score</p>
              <p className="font-semibold text-primary-600">{Number(project.impact_score).toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setShowUpdateForm(!showUpdateForm)} className="btn-primary w-full text-sm">
              {showUpdateForm ? 'Cancel' : 'Submit Progress Update'}
            </button>

            <label className="btn-secondary w-full text-sm text-center cursor-pointer block">
              Upload Report
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
            </label>
          </div>
        </div>
      </div>

      {/* Update Form */}
      {showUpdateForm && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Submit Progress Update</h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {updateError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600">{updateError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Beneficiaries Reached</label>
                <input type="number" value={updateForm.beneficiaries_reached} onChange={(e) => setUpdateForm({ ...updateForm, beneficiaries_reached: e.target.value })} className="input-field" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Budget Utilized (₹)</label>
                <input type="number" value={updateForm.budget_utilized} onChange={(e) => setUpdateForm({ ...updateForm, budget_utilized: e.target.value })} className="input-field" min={0} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Progress %</label>
                <input type="number" value={updateForm.progress_percentage} onChange={(e) => setUpdateForm({ ...updateForm, progress_percentage: e.target.value })} className="input-field" min={0} max={100} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Remarks</label>
              <textarea value={updateForm.remarks} onChange={(e) => setUpdateForm({ ...updateForm, remarks: e.target.value })} className="input-field" rows={2} />
            </div>

            <button type="submit" className="btn-primary">Submit Update</button>
          </form>
        </div>
      )}

      {/* Progress Updates */}
      {project.updates && project.updates.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Progress History</h3>
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
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Uploaded Reports</h3>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{doc.file_name}</p>
                    <p className="text-xs text-gray-500">{new Date(doc.created_at).toLocaleDateString()}</p>
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
