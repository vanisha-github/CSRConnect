import React, { useState, useEffect } from 'react';
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

export default function NgoProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [editingUpdateId, setEditingUpdateId] = useState(null);
  const [updateForm, setUpdateForm] = useState({ beneficiaries_reached: '', budget_utilized: '', progress_percentage: '', remarks: '' });
  const [updateFile, setUpdateFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [editingUpdateFile, setEditingUpdateFile] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [reportUploading, setReportUploading] = useState(false);

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

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await projectAPI.uploadCoverImage(id, formData);
      setProject(data);
    } catch (err) {
      console.error('Cover upload failed:', err);
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    if (!window.confirm('Remove cover image?')) return;
    try {
      const { data } = await projectAPI.removeCoverImage(id);
      setProject(data);
    } catch (err) {
      console.error('Cover remove failed:', err);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setGalleryUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    formData.append('is_public', true);
    try {
      await documentAPI.upload(formData);
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Gallery upload failed:', err);
    } finally {
      setGalleryUploading(false);
    }
  };

  const resetForm = () => {
    setShowUpdateForm(false);
    setEditingUpdateId(null);
    setUpdateForm({ beneficiaries_reached: '', budget_utilized: '', progress_percentage: '', remarks: '' });
    setUpdateFile(null);
    setRemoveFile(false);
    setEditingUpdateFile(null);
    setUpdateError('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('project_id', id);
    formData.append('beneficiaries_reached', updateForm.beneficiaries_reached || 0);
    formData.append('budget_utilized', updateForm.budget_utilized || 0);
    formData.append('progress_percentage', updateForm.progress_percentage || 0);
    formData.append('remarks', updateForm.remarks || '');
    if (updateFile) formData.append('file', updateFile);
    if (removeFile) formData.append('remove_file', true);

    try {
      if (editingUpdateId) {
        await updateAPI.updateWithFile(editingUpdateId, formData);
      } else {
        await updateAPI.addWithFile(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (update) => {
    setUpdateForm({
      beneficiaries_reached: update.beneficiaries_reached,
      budget_utilized: update.budget_utilized,
      progress_percentage: update.progress_percentage,
      remarks: update.remarks || '',
    });
    setEditingUpdateId(update.id);
    setShowUpdateForm(true);
    setUpdateFile(null);
    setRemoveFile(false);
    setEditingUpdateFile(update.file_name ? { file_name: update.file_name, file_path: update.file_path } : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (updateId) => {
    if (!window.confirm('Delete this update?')) return;
    try {
      await updateAPI.delete(updateId);
      fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReportUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', id);
    formData.append('is_public', true);
    try {
      await documentAPI.upload(formData);
      const docRes = await documentAPI.getByProject(id);
      setDocuments(docRes.data);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setReportUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await documentAPI.delete(docId);
      setDocuments(documents.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div>
      <Link to="/ngo/projects" className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; Back to Projects</Link>

      {/* Cover Image */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20">
        {project.cover_image && isImageFile(project.cover_image) ? (
          <img src={project.cover_image} alt="" className="w-full h-48 object-cover" />
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <svg className="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
            </svg>
          </div>
        )}
        {project.status !== 'completed' && project.status !== 'cancelled' && (
          <div className="absolute top-2 right-2 flex gap-2">
            <label className="bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-colors">
              {project.cover_image ? 'Change Cover' : 'Add Cover'}
              <input type="file" onChange={handleCoverUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.svg" />
            </label>
            {project.cover_image && (
              <button onClick={handleRemoveCover} className="bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-colors">Remove</button>
            )}
          </div>
        )}
      </div>

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
              <p className="text-xs text-gray-500">Expected End Date</p>
              <p className="font-semibold">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Actual Completion Date</p>
              <p className="font-semibold">{project.actual_end_date ? new Date(project.actual_end_date).toLocaleDateString() : '—'}</p>
            </div>
            {project.status === 'completed' && project.end_date && project.actual_end_date && (
              <div className="col-span-2">
                {(() => {
                  const actual = new Date(project.actual_end_date);
                  const expected = new Date(project.end_date);
                  if (actual < expected) return <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">Completed Ahead of Schedule</span>;
                  if (actual > expected) return <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">Completed After Deadline</span>;
                  return <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">Completed On Time</span>;
                })()}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Impact Score</p>
              <p className="font-semibold text-primary-600">{Number(project.impact_score).toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Actions</h3>
          {project.status === 'completed' || project.status === 'cancelled' ? (
            <p className="text-sm text-gray-500 italic">This project is {project.status}. No further actions allowed.</p>
          ) : (
          <div className="space-y-3">
            <button onClick={() => { resetForm(); setShowUpdateForm(!showUpdateForm); }} className="btn-primary w-full text-sm">
              {showUpdateForm ? 'Cancel' : 'Submit Progress Update'}
            </button>

            <label className="btn-secondary w-full text-sm text-center cursor-pointer block">
              {reportUploading ? 'Uploading...' : 'Upload Report'}
              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" disabled={reportUploading} />
            </label>
          </div>
          )}
        </div>
      </div>

      {/* Update Form */}
      {showUpdateForm && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {editingUpdateId ? 'Edit Progress Update' : 'Submit Progress Update'}
          </h3>
          <form onSubmit={handleUpdateSubmit} className="space-y-4" encType="multipart/form-data">
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

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Proof Document (image/PDF) {updateFile ? `— ${updateFile.name}` : ''}
              </label>
              {editingUpdateFile && !removeFile && !updateFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-sm">
                  <span>{getFileIcon(editingUpdateFile.file_name)}</span>
                  <a href={editingUpdateFile.file_path} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 underline">{editingUpdateFile.file_name}</a>
                  <button type="button" onClick={() => setRemoveFile(true)} className="text-xs text-red-600 hover:text-red-500 ml-auto">Remove</button>
                </div>
              )}
              {(!editingUpdateFile || removeFile) && (
              <input
                type="file"
                onChange={(e) => setUpdateFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.svg"
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Uploading...' : (editingUpdateId ? 'Update' : 'Submit') + ' Update'}
              </button>
              {editingUpdateId && (
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel Edit</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Progress Updates */}
      {project.updates && project.updates.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Progress History</h3>
          <div className="space-y-4">
            {project.updates.map((update) => (
              <React.Fragment key={update.id}>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
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
                      {isImageFile(update.file_name) ? (
                        <a href={update.file_path} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-500 underline">{update.file_name}</a>
                      ) : (
                        <a href={fileAPI.getDownloadUrl(update.file_path, update.file_name)} className="text-sm text-primary-600 hover:text-primary-500 underline">{update.file_name}</a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">{new Date(update.created_at).toLocaleString()}</p>
                      {update.reviewed && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">✓ Reviewed</span>}
                    </div>
                    {project.status !== 'completed' && project.status !== 'cancelled' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(update)} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">Edit</button>
                      <button onClick={() => handleDelete(update.id)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">Delete</button>
                    </div>
                    )}
                  </div>
                </div>
                {update.reviewed && update.company_comment && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Company feedback:</span> {update.company_comment}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Photo Gallery</h3>
          {project.status !== 'completed' && project.status !== 'cancelled' && (
            <label className="btn-secondary text-xs cursor-pointer">
              {galleryUploading ? 'Uploading...' : '+ Add Photo'}
              <input type="file" onChange={handleGalleryUpload} className="hidden" accept=".png,.jpg,.jpeg,.gif,.svg" disabled={galleryUploading} />
            </label>
          )}
        </div>
        {documents.filter(d => isImageFile(d.file_name)).length === 0 ? (
          <p className="text-sm text-gray-400">No gallery images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {documents.filter(d => isImageFile(d.file_name)).map((img) => (
              <div key={img.id} className="group relative">
                <img src={img.file_path} alt={img.file_name} className="w-full h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                {img.reviewed && (
                  <span className="absolute top-1 left-1 text-xs px-1 py-0.5 bg-green-500/80 text-white rounded">✓</span>
                )}
                {project.status !== 'completed' && project.status !== 'cancelled' && (
                  <button onClick={() => handleDeleteDoc(img.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs">✕</button>
                )}
                {img.reviewed && img.company_comment && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <p className="text-xs bg-black/60 text-white px-1 py-0.5 rounded truncate" title={img.company_comment}>{img.company_comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents (non-image) */}
      {documents.filter(d => !isImageFile(d.file_name)).length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Uploaded Reports</h3>
          <div className="space-y-2">
            {documents.filter(d => !isImageFile(d.file_name)).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {isImageFile(doc.file_name) ? (
                    <a href={documentAPI.getViewUrl(doc.file_path)} target="_blank" rel="noopener noreferrer">
                      <img src={documentAPI.getViewUrl(doc.file_path)} alt={doc.file_name} className="w-10 h-10 object-cover rounded" />
                    </a>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                  <div>
                    {isImageFile(doc.file_name) ? (
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-500 underline">{doc.file_name}</a>
                    ) : (
                      <a href={fileAPI.getDownloadUrl(doc.file_path, doc.file_name)} className="text-sm font-medium text-primary-600 hover:text-primary-500 underline">{doc.file_name}</a>
                    )}
                    <p className="text-xs text-gray-500">by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                    {doc.reviewed && doc.company_comment && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Feedback: {doc.company_comment}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {doc.reviewed && <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded font-medium">✓ Reviewed</span>}
                  {project.status !== 'completed' && project.status !== 'cancelled' && (
                    <button onClick={() => handleDeleteDoc(doc.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
