import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyAPI, projectAPI } from '../../services/api';

const categories = ['Education', 'Healthcare', 'Women Empowerment', 'Plantation', 'Skill Development'];
const esgPillars = ['environmental', 'social', 'governance'];

export default function CompanyCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    esg_pillar: '',
    budget: '',
    location: '',
    latitude: '',
    longitude: '',
    start_date: '',
    end_date: '',
    cover_image: '',
    objectives: '',
    public_budget: true,
    description_public: true,
    location_public: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkCompany = async () => {
      try {
        await companyAPI.getMyCompany();
      } catch {
        navigate('/company');
      }
    };
    checkCompany();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await projectAPI.create(form);
      navigate('/company/projects');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Create CSR Project</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Project Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="input-field" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field" rows={3} />
          <label className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
            <input type="checkbox" checked={form.description_public} onChange={(e) => setForm({...form, description_public: e.target.checked})} className="rounded" />
            Publicly visible
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field" required>
            <option value="">Select category</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">ESG Pillar</label>
          <select name="esg_pillar" value={form.esg_pillar} onChange={handleChange} className="input-field">
            <option value="">Not set</option>
            {esgPillars.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Budget (₹) *</label>
            <input type="number" name="budget" value={form.budget} onChange={handleChange} className="input-field" min={0} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Location</label>
            <input type="text" name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="City, State" />
            <label className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
              <input type="checkbox" checked={form.location_public} onChange={(e) => setForm({...form, location_public: e.target.checked})} className="rounded" />
              Publicly visible
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Latitude</label>
            <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} className="input-field" placeholder="28.6139" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Longitude</label>
            <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} className="input-field" placeholder="77.2090" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Objectives</label>
          <textarea name="objectives" value={form.objectives} onChange={handleChange} className="input-field" rows={3} placeholder="Project objectives and goals" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cover Image URL</label>
          <input type="text" name="cover_image" value={form.cover_image} onChange={handleChange} className="input-field" placeholder="Upload filename (e.g. cover.jpg)" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="public_budget" id="public_budget" checked={form.public_budget} onChange={(e) => setForm({ ...form, public_budget: e.target.checked })} className="rounded border-gray-300 text-primary-600" />
          <label htmlFor="public_budget" className="text-sm text-gray-700 dark:text-gray-300">Display budget publicly</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button type="button" onClick={() => navigate('/company/projects')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
