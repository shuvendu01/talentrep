'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { Code, Plus, Edit, Trash2, ArrowLeft, X, Save } from 'lucide-react';

export default function AdminCustomCodePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codes, setCodes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    code_type: 'css',
    code_content: '',
    is_active: true,
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await api.get('/auth/me');
        if (userResponse.data.role !== 'admin') {
          router.push('/dashboard');
          return;
        }
        setUser(userResponse.data);
        await fetchCodes();
      } catch (err) {
        console.error('Failed to fetch data:', err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const fetchCodes = async () => {
    try {
      const response = await api.get('/admin/custom-code');
      setCodes(response.data);
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCode) {
        await api.put(`/admin/custom-code/${editingCode.id}`, formData);
        setMessage({ type: 'success', text: 'Custom code updated successfully!' });
      } else {
        await api.post('/admin/custom-code', formData);
        setMessage({ type: 'success', text: 'Custom code created successfully!' });
      }
      
      await fetchCodes();
      setShowModal(false);
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to save custom code' });
    }
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code_type: code.code_type,
      code_content: code.code_content,
      is_active: code.is_active,
      description: code.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this custom code?')) return;
    
    try {
      await api.delete(`/admin/custom-code/${id}`);
      setMessage({ type: 'success', text: 'Custom code deleted successfully!' });
      await fetchCodes();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete custom code' });
    }
  };

  const resetForm = () => {
    setEditingCode(null);
    setFormData({
      code_type: 'css',
      code_content: '',
      is_active: true,
      description: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-blue-600">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Custom CSS/JS</h1>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Code
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Codes List */}
        <div className="space-y-4">
          {codes.map((code) => (
            <div key={code.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    code.code_type === 'css' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {code.code_type.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    code.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {code.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(code)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(code.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {code.description && (
                <p className="text-sm text-gray-600 mb-3">{code.description}</p>
              )}
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{code.code_content}</code>
              </pre>
            </div>
          ))}

          {codes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <Code className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No custom code yet</h3>
              <p className="text-gray-600">Add custom CSS or JavaScript to your platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCode ? 'Edit Custom Code' : 'Add Custom Code'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code Type</label>
                  <select
                    value={formData.code_type}
                    onChange={(e) => setFormData({ ...formData, code_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={!!editingCode}
                  >
                    <option value="css">CSS</option>
                    <option value="js">JavaScript</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                  <textarea
                    value={formData.code_content}
                    onChange={(e) => setFormData({ ...formData, code_content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    rows={15}
                    required
                    placeholder={formData.code_type === 'css' ? '.custom-class { color: blue; }' : 'console.log("Hello");'}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {editingCode ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
