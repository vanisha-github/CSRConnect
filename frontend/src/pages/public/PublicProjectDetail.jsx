import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name);
}

export default function PublicProjectDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const ngoId = searchParams.get('ngoId');
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicAPI.getProjectById(id);
        setProject(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!project) return <div className="text-center py-12 text-gray-500">Project not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {(() => {
        let backTo = '/public/projects';
        let backLabel = 'Back to Projects';
        if (from === 'ngo' && ngoId) {
          backTo = `/public/ngos/${ngoId}`;
          backLabel = 'Back to NGO Profile';
        }
        return <Link to={backTo} className="text-sm text-primary-600 hover:text-primary-500 mb-4 inline-block">&larr; {backLabel}</Link>;
      })()}

      {/* Cover Image */}
      {project.cover_image && isImageFile(project.cover_image) ? (
        <img src={project.cover_image} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 rounded-xl mb-6 flex items-center justify-center">
          <svg className="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
          </svg>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {project.company_name}{project.ngo_name ? ` • Partner: ${project.ngo_name}` : ''} • {project.category}
          </p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Info */}
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Description</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{project.description || 'No description provided'}</p>

          {project.objectives && (
            <>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">Objectives</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{project.objectives}</p>
            </>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
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
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{project.location || 'N/A'}</p>
            </div>
          </div>

          {project.status === 'completed' && project.end_date && project.actual_end_date && (
            <div className="mt-4">
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

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Impact Summary</h3>
            <div className="text-center pb-3 border-b border-gray-100 dark:border-gray-700">
              <p className="text-3xl font-bold text-primary-600">{Number(project.impact_score).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Impact Score</p>
            </div>
            <div className="space-y-2 mt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Beneficiaries</span>
                <span className="font-medium">{Number(project.beneficiaries_reached).toLocaleString()}</span>
              </div>
              {project.public_budget !== false && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium">₹{Number(project.budget).toLocaleString()}</span>
                </div>
              )}
              {project.ngo_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">NGO Partner</span>
                  <span className="font-medium">{project.ngo_name}</span>
                </div>
              )}
            </div>
          </div>

          {project.sdg_tags?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">SDG Goals</h3>
              <div className="flex flex-wrap gap-2">
                {project.sdg_tags.map((sdg, i) => (
                  <span key={i} className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">{sdg}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      {project.updates?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Progress Timeline</h3>
          <div className="space-y-4">
            {project.updates.map((update, idx) => (
              <div key={update.id} className="relative pl-8 pb-4 border-l-2 border-primary-200 dark:border-primary-800">
                <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{new Date(update.created_at).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 gap-4 mb-2 text-sm">
                  <div><span className="text-xs text-gray-500">Progress</span><p className="font-semibold">{update.progress_percentage}%</p></div>
                  <div><span className="text-xs text-gray-500">Beneficiaries</span><p className="font-semibold">{update.beneficiaries_reached}</p></div>
                  <div><span className="text-xs text-gray-500">Budget Used</span><p className="font-semibold">₹{Number(update.budget_utilized).toLocaleString()}</p></div>
                </div>
                {update.remarks && <p className="text-sm text-gray-600 dark:text-gray-400">{update.remarks}</p>}
                {update.file_name && (
                  <a href={update.file_path} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-500 underline inline-block mt-1">{update.file_name}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Gallery */}
      {project.gallery_images?.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Photo Gallery</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {project.gallery_images.map((img) => (
              <a key={img.id} href={img.file_path} target="_blank" rel="noopener noreferrer">
                <img src={img.file_path} alt={img.file_name} className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Public Reports (non-image only) */}
      {project.documents?.filter(d => !isImageFile(d.file_name)).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Public Reports</h3>
          <div className="space-y-2">
            {project.documents.filter(d => !isImageFile(d.file_name)).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="min-w-0">
                    <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-500 underline truncate block">{doc.file_name}</a>
                    <p className="text-xs text-gray-500">by {doc.uploaded_by_name} • {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs px-2 py-1 shrink-0 ml-2">View</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
