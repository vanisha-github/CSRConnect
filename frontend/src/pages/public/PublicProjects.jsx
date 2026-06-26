import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

function isImageFile(name) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(name);
}

export default function PublicProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await publicAPI.getProjects();
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
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !filter || p.category === filter;
    return matchSearch && matchFilter;
  });

  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Verified Projects</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Browse completed and active CSR initiatives</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? <EmptyState title="No projects found" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(project => (
            <Link key={project.id} to={`/public/projects/${project.id}`} className="card hover:shadow-md transition-shadow block overflow-hidden">
              {project.cover_image && isImageFile(project.cover_image) ? (
                <img src={project.cover_image} alt="" className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={project.status} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{project.category}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{project.description}</p>
                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Company</span>
                    <span className="font-medium truncate ml-2">{project.company_name}</span>
                  </div>
                  {project.ngo_name && (
                    <div className="flex justify-between">
                      <span>NGO</span>
                      <span className="font-medium truncate ml-2">{project.ngo_name}</span>
                    </div>
                  )}
                  {project.location && (
                    <div className="flex justify-between">
                      <span>Location</span>
                      <span className="font-medium truncate ml-2">{project.location}</span>
                    </div>
                  )}
                  {project.public_budget !== false && (
                    <div className="flex justify-between">
                      <span>Budget</span>
                      <span className="font-medium">₹{Number(project.budget).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Beneficiaries</span>
                    <span className="font-medium">{Number(project.beneficiaries_reached).toLocaleString()}</span>
                  </div>
                  {project.impact_score > 0 && (
                    <div className="flex justify-between">
                      <span>Impact Score</span>
                      <span className="font-medium text-primary-600">{Number(project.impact_score).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <span className="btn-primary text-sm text-center block">View Details</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
