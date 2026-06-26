import { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await companyAPI.getAll();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (company) => {
    setEditing(company.id);
    setEditForm({ company_name: company.company_name, industry: company.industry || '', description: company.description || '' });
  };

  const handleSave = async (id) => {
    try {
      await companyAPI.update(id, editForm);
      setEditing(null);
      fetchCompanies();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Company Management</h1>
        <span className="text-sm text-gray-500">{companies.length} Companies</span>
      </div>

      {companies.length === 0 ? <EmptyState title="No companies registered" /> : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Company Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Industry</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      {editing === company.id ? (
                        <input value={editForm.company_name} onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })} className="input-field text-sm" />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-gray-100">{company.company_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {editing === company.id ? (
                        <input value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className="input-field text-sm" />
                      ) : (
                        company.industry || 'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {editing === company.id ? (
                        <input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-field text-sm" />
                      ) : (
                        company.description || 'N/A'
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{company.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(company.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {editing === company.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleSave(company.id)} className="btn-success text-xs px-2 py-1">Save</button>
                          <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-2 py-1">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(company)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                      )}
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
