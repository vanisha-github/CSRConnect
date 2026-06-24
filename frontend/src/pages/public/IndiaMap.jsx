import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { analyticsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColors = {
  Education: '#6366f1',
  Healthcare: '#22c55e',
  'Women Empowerment': '#f59e0b',
  Plantation: '#10b981',
  'Skill Development': '#8b5cf6',
};

export default function IndiaMap() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await analyticsAPI.getMapData();
        setProjects(data);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = filter ? projects.filter(p => p.category === filter) : projects;
  const categories = [...new Set(projects.map(p => p.category).filter(Boolean))];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">India Impact Map</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Geographic visualization of CSR projects across India</p>
      </div>

      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-48">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card h-[600px] overflow-hidden p-0">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filtered.map((project) => (
            project.latitude && project.longitude && (
              <Marker key={project.id} position={[parseFloat(project.latitude), parseFloat(project.longitude)]}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mt-1">Company: {project.company_name}</p>
                    <p className="text-gray-600">NGO: {project.ngo_name || 'Not assigned'}</p>
                    <p className="text-gray-600">Category: {project.category}</p>
                    <p className="text-gray-600">Budget: ₹{Number(project.budget).toLocaleString()}</p>
                    <p className="text-gray-600">Beneficiaries: {Number(project.beneficiaries).toLocaleString()}</p>
                    {project.impact_score > 0 && (
                      <p className="text-primary-600 font-semibold">Impact Score: {Number(project.impact_score).toFixed(1)}</p>
                    )}
                    <p className="text-gray-500 mt-1">Status: {project.status}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="card">
          <p className="text-sm text-gray-500">Projects on Map</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{filtered.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-xl font-bold text-green-600">₹{filtered.reduce((s, p) => s + Number(p.budget), 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Beneficiaries</p>
          <p className="text-xl font-bold text-blue-600">{filtered.reduce((s, p) => s + Number(p.beneficiaries), 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Avg Impact Score</p>
          <p className="text-xl font-bold text-primary-600">
            {filtered.length > 0
              ? (filtered.reduce((s, p) => s + Number(p.impact_score), 0) / filtered.length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>
    </div>
  );
}
