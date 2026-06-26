import { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function AdminNgos() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchNgos();
  }, []);

  const fetchNgos = async () => {
    try {
      const { data } = await ngoAPI.getAll();
      setNgos(data);
    } catch (err) {
      console.error('Failed to load NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await ngoAPI.verify(id);
      fetchNgos();
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await ngoAPI.reject(id);
      fetchNgos();
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  const handleEdit = (ngo) => {
    setEditing(ngo.id);
    setEditForm({ ngo_name: ngo.ngo_name, registration_number: ngo.registration_number, email: ngo.email || ngo.user_email, phone: ngo.phone, address: ngo.address });
  };

  const handleSave = async (id) => {
    try {
      await ngoAPI.update(id, editForm);
      setEditing(null);
      fetchNgos();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">NGO Management</h1>
        <span className="text-sm text-gray-500">{ngos.length} NGOs</span>
      </div>

      {ngos.length === 0 ? <EmptyState title="No NGOs registered" /> : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">NGO Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Registration</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Trust Score</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {ngos.map((ngo) => (
                  <tr key={ngo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      {editing === ngo.id ? (
                        <input
                          value={editForm.ngo_name}
                          onChange={(e) => setEditForm({ ...editForm, ngo_name: e.target.value })}
                          className="input-field text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-gray-100">{ngo.ngo_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editing === ngo.id ? (
                        <input value={editForm.registration_number} onChange={(e) => setEditForm({ ...editForm, registration_number: e.target.value })} className="input-field text-sm" />
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400">{ngo.registration_number}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editing === ngo.id ? (
                        <div className="space-y-1">
                          <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field text-sm" placeholder="Email" />
                          <input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field text-sm" placeholder="Phone" />
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>{ngo.email}</p>
                          {ngo.phone && <p className="text-xs">{ngo.phone}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary-600">{Number(ngo.trust_score).toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editing === ngo.id ? (
                          <>
                            <button onClick={() => handleSave(ngo.id)} className="btn-success text-xs px-2 py-1">Save</button>
                            <button onClick={() => setEditing(null)} className="btn-secondary text-xs px-2 py-1">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(ngo)} className="btn-secondary text-xs px-2 py-1">Edit</button>
                            {ngo.verified ? (
                              <button onClick={() => handleReject(ngo.id)} className="btn-danger text-xs px-2 py-1">Reject</button>
                            ) : (
                              <button onClick={() => handleVerify(ngo.id)} className="btn-success text-xs px-2 py-1">Verify</button>
                            )}
                          </>
                        )}
                      </div>
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
