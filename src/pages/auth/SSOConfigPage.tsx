import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';

export const SSOConfigPage: React.FC = () => {
  const [ssoStatus, setSsoStatus] = useState<any>({ google: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/sso/status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSsoStatus(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError('Failed to load SSO status'))
      .finally(() => setLoading(false));
  }, []);

  const handleLinkGoogle = async () => {
    try {
      const res = await fetch('/api/v1/sso/google/url');
      const data = await res.json();
      if (data.success) {
        window.location.href = data.data.url; // Redirect to google auth
      }
    } catch {
      setError('Could not establish link with Google');
    }
  };

  const handleUnlinkGoogle = async () => {
    try {
      const res = await fetch('/api/v1/sso/google/unlink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setSsoStatus((prev: any) => ({ ...prev, googleLinked: false }));
        toast.success('Google account unlinked successfully');
      }
    } catch {
      setError('Failed to unlink account');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">Single Sign-On (SSO) Configuration</h2>
      
      {error && <div className="text-red-600 bg-red-50 p-3 rounded mb-4">{error}</div>}

      <div className="border p-4 rounded-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg flex items-center">
              Google Workspace (OIDC)
              {ssoStatus.google ? 
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">System Enabled</span> :
                <span className="ml-2 bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">System Disabled</span>
              }
            </h3>
            <p className="text-sm text-gray-500 mt-1">Allow linking your personal account to login seamlessly.</p>
          </div>
          <div>
            {!ssoStatus.googleLinked ? (
              <button
                disabled={!ssoStatus.google}
                onClick={handleLinkGoogle}
                className="bg-white border hover:bg-gray-50 px-4 py-2 font-medium rounded text-sm disabled:opacity-50"
              >
                Link Google Account
              </button>
            ) : (
                <button
                onClick={handleUnlinkGoogle}
                className="text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 font-medium rounded text-sm"
              >
                Unlink Account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
