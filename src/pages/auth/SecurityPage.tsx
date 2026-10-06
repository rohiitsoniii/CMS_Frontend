import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';

export const SecurityPage: React.FC = () => {
  const [allowedIps, setAllowedIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch current tenant settings
  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        const data = res.data;
        if (data.success && data.data.tenant?.settings?.allowedIps) {
          setAllowedIps(data.data.tenant.settings.allowedIps);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddIp = () => {
    if (!newIp.trim()) return;
    
    // Basic IP validation omitted for UI brevity
    const updatedIps = [...allowedIps, newIp.trim()];
    saveIps(updatedIps);
  };

  const handleRemoveIp = (ip: string) => {
    const updatedIps = allowedIps.filter(i => i !== ip);
    saveIps(updatedIps);
  };

  const saveIps = async (ips: string[]) => {
    setError('');
    setSuccess('');
    
    try {
      const res = await api.put('/admin/settings/security', { allowedIps: ips });
      const data = res.data;
      if (data.success) {
        setAllowedIps(ips);
        setNewIp('');
        setSuccess('IP Allowlist updated successfully.');
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save security settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Security Capabilities</h1>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">{success}</div>}

      {/* IP Allowlist Card */}
      <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Network Security: IP Allowlist</h3>
          <p className="mt-1 text-sm text-gray-500">
            Restrict API access to specific IP addresses. Once enabled, requests from unlisted IPs will be rejected with a 403 Forbidden.
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              placeholder="e.g. 192.168.1.1, 10.0.0.0/24, or '*' for all"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
            <button
              onClick={handleAddIp}
              disabled={!newIp}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
            >
              Add IP Address
            </button>
          </div>

          <div className="border rounded-md overflow-hidden bg-gray-50">
            {allowedIps.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">
                Your API is currently accessible from all requested IP sources.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {allowedIps.map((ip, idx) => (
                  <li key={idx} className="p-4 flex items-center justify-between text-sm">
                    <span className="font-mono text-gray-800 bg-gray-200 px-2 py-1 rounded">{ip}</span>
                    <button
                      onClick={() => handleRemoveIp(ip)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
