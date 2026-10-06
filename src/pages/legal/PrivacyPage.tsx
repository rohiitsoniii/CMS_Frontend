import React, { useState } from 'react';

export const PrivacyPage: React.FC = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy/export', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
      } else {
        setError('Failed to request export');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const requestDeletion = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure? This will delete your entire account and all associated data within 30 days.')) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/v1/privacy/delete', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
      } else {
        setError('Failed to trigger deletion');
      }
    } catch {
      setError('Network error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-6">Data Privacy Center (GDPR Toolkit)</h1>
      
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Right to Access</h2>
        <p className="text-gray-600 mb-4">Request a comprehensive export of all personal data we have stored about you across our systems.</p>
        <button 
          onClick={requestExport}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 disabled:opacity-50"
        >
          Request Data Export
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg border border-red-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Right to be Forgotten</h2>
        <p className="text-gray-600 mb-4">
          Permanently delete your account and all associated personal data. 
          This action will immediately restrict access and completely scrub your data physically upon the next deletion cycle.
        </p>
        <button 
          onClick={requestDeletion}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 disabled:opacity-50"
        >
          Irreversibly Delete Account
        </button>
      </div>

      {success && <div className="p-4 bg-green-50 text-green-700 rounded border border-green-200">{success}</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}
    </div>
  );
};
