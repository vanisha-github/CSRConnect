import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI, updateAPI, documentAPI, fileAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name);
}

function getFileIcon(name) {
  if (isImageFile(name)) return '🖼️';
  if (/\.pdf$/i.test(name)) return '📄';
  return '📎';
}

export default function CompanyProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updateComments, setUpdateComments] = useState({});
  const [docComments, setDocComments] = useState({});

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

  const handleEdit = () => {
    setEditForm({
      status: project.status,
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      esg_pillar: project.esg_pillar || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await projectAPI.update(id, editForm);
      setEditing(false);
      fetchData();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleReviewUpdate = async (updateId, reviewed) => {
    try {
      await updateAPI.review(updateId, { reviewed });
      fetchData();
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const handleSaveUpdateComment = async (updateId) => {
    try {
      await updateAPI.review(updateId, { comment: updateComments[updateId] || null });
      fetchData();
    } catch (err) {
      console.error('Save comment failed:', err);
    }
  };

  const handleToggleUpdateVisibility = async (update) => {
    try {
      await updateAPI.toggleVisibility(update.id, !update.is_public);
      fetchData();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleReviewDocument = async (docId, reviewed) => {
    try {
      await documentAPI.review(docId, { reviewed });
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Review failed:', err);
    }
  };

  const handleSaveDocComment = async (docId) => {
    try {
      await documentAPI.review(docId, { comment: docComments[docId] || null });
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Save comment failed:', err);
    }
  };

  const handleToggleDocVisibility = async (doc) => {
    try {
      await documentAPI.toggleVisibility(doc.id, !doc.is_public);
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div>
      <Link to="/company/projects" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Back to Projects</Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{project.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          <button onClick={handleEdit} className="btn-primary text-sm">Edit Status</button>
        </div>
      </div>

      {editing && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Update Project</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
              <input type="date" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ESG Pillar</label>
              <select value={editForm.esg_pillar} onChange={(e) => setEditForm({ ...editForm, esg_pillar: e.target.value })} className="input-field">
                <option value="">Not set</option>
                <option value="environmental">Environmental</option>
                <option value="social">Social</option>
                <option value="governance">Governance</option>
              </select>
            </div>
            <button onClick={handleSave} className="btn-primary text-sm">Save</button>
            <button onClick={() => setEditing(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}

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
              <p className="text-xs text-gray-500">Expected End Date</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Actual Completion Date</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.actual_end_date ? new Date(project.actual_end_date).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ESG Pillar</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{project.esg_pillar || 'Not set'}</p>
            </div>
          </div>
          {project.status === 'completed' && project.end_date && project.actual_end_date && (
            <div className="mt-3">
              {(() => {
                const actual = new Date(project.actual_end_date);
                const expected = new Date(project.end_date);
                if (actual < expected) return <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">Completed Ahead of Schedule</span>;
                if (actual > expected) return <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">Completed After Deadline</span>;
                return <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">Completed On Time</span>;
              })()}
            </div>
          )}
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

      {/* Progress Updates with Review & Visibility */}
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

                {update.file_name && (
                  <div className="mt-2 flex items-center gap-2">
                    <span>{getFileIcon(update.file_name)}</span>
                    <a href={fileAPI.getDownloadUrl(update.file_path, update.file_name)} className="text-sm text-primary-600 hover:text-primary-500 underline">{update.file_name}</a>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{new Date(update.created_at).toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!update.reviewed}
                        onChange={() => handleReviewUpdate(update.id, !update.reviewed)}
                        className="rounded"
                      />
                      Reviewed
                    </label>
                    {update.reviewed && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded cursor-pointer ${update.is_public ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                        onClick={() => handleToggleUpdateVisibility(update)}
                      >
                        {update.is_public ? 'Public' : 'Private'}
                      </span>
                    )}
                  </div>
                </div>
                {update.reviewed && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={(updateComments[update.id] ?? update.company_comment) || ''}
                      onChange={(e) => setUpdateComments({ ...updateComments, [update.id]: e.target.value })}
                      placeholder="Private comment for NGO..."
                      className="input-field text-xs flex-1"
                    />
                    <button onClick={() => handleSaveUpdateComment(update.id)} className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200">Save</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery with Review & Visibility */}
      {documents.filter(d => isImageFile(d.file_name)).length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {documents.filter(d => isImageFile(d.file_name)).map((img) => (
              <div key={img.id} className="group relative">
                <img src={img.file_path} alt={img.file_name} className="w-full h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                <div className="absolute bottom-1 left-1 flex flex-col gap-1">
                  <label className="flex items-center gap-1 text-xs bg-black/50 text-white px-1 py-0.5 rounded cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!img.reviewed}
                      onChange={() => handleReviewDocument(img.id, !img.reviewed)}
                      className="rounded"
                    />
                    <span>Review</span>
                  </label>
                  {img.reviewed && (
                    <span
                      className={`text-xs px-1 py-0.5 rounded cursor-pointer ${img.is_public ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}
                      onClick={() => handleToggleDocVisibility(img)}
                    >
                      {img.is_public ? 'Public' : 'Private'}
                    </span>
                  )}
                </div>
                {img.reviewed && (
                  <div className="mt-1 flex gap-1">
                    <input
                      type="text"
                      value={(docComments[img.id] ?? img.company_comment) || ''}
                      onChange={(e) => setDocComments({ ...docComments, [img.id]: e.target.value })}
                      placeholder="Comment..."
                      className="text-xs w-full px-1 py-0.5 border border-gray-300 rounded"
                    />
                    <button onClick={() => handleSaveDocComment(img.id)} className="text-xs px-1 py-0.5 bg-primary-500/80 text-white rounded">Save</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports (non-image) with Review & Visibility */}
      {documents.filter(d => !isImageFile(d.file_name)).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Reports & Documents</h3>
          <div className="space-y-2">
            {documents.filter(d => !isImageFile(d.file_name)).map((doc) => {
              const isImage = isImageFile(doc.file_name);
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {isImage ? (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                        <img src={doc.file_path} alt={doc.file_name} className="w-10 h-10 object-cover rounded" />
                      </a>
                    ) : (
                      <a href={fileAPI.getDownloadUrl(doc.file_path, doc.file_name)}>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </a>
                    )}
                    <div>
                      {isImageFile(doc.file_name) ? (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-500 underline">{doc.file_name}</a>
                    ) : (
                      <a href={fileAPI.getDownloadUrl(doc.file_path, doc.file_name)} className="text-sm font-medium text-primary-600 hover:text-primary-500 underline">{doc.file_name}</a>
                    )}
                      <p className="text-xs text-gray-500">by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={!!doc.reviewed}
                          onChange={() => handleReviewDocument(doc.id, !doc.reviewed)}
                          className="rounded"
                        />
                        Reviewed
                      </label>
                      {doc.reviewed && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded cursor-pointer ${doc.is_public ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}
                          onClick={() => handleToggleDocVisibility(doc)}
                        >
                          {doc.is_public ? 'Public' : 'Private'}
                        </span>
                      )}
                    </div>
                    {doc.reviewed && (
                      <div className="flex gap-1 w-full">
                        <input
                          type="text"
                          value={(docComments[doc.id] ?? doc.company_comment) || ''}
                          onChange={(e) => setDocComments({ ...docComments, [doc.id]: e.target.value })}
                          placeholder="Private comment..."
                          className="text-xs flex-1 px-1 py-0.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                        />
                        <button onClick={() => handleSaveDocComment(doc.id)} className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded hover:bg-primary-200">Save</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
