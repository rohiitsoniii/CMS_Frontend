import React, { useState, useEffect } from 'react';

export const MFASetupPage: React.FC = () => {
  const [setupData, setSetupData] = useState<any>(null);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ideally, use a custom hook for fetching authenticated routes
  useEffect(() => {
    fetch('/api/v1/2fa/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setSetupData(data.data);
      } else {
        setError(data.error || 'Failed to initialize 2FA setup');
      }
    })
    .catch(() => setError('Network error initializing 2FA'))
    .finally(() => setLoading(false));
  }, []);

  const handleVerify = async () => {
    setError('');
    try {
      const res = await fetch('/api/v1/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch {
      setError('Network error verifying code');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">2FA Enabled Successfully!</h2>
        <p className="text-gray-700 mb-4">Your account is now protected with Two-Factor Authentication.</p>
        <div className="bg-gray-100 p-4 rounded mb-4">
          <h3 className="font-bold mb-2">Save these Backup Codes:</h3>
          <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
            {setupData?.backupCodes.map((code: string) => (
              <li key={code}>{code}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Set up Two-Factor Authentication</h2>
      {error && <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">{error}</div>}
      
      {setupData && (
        <div className="flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-4 text-center">
            Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
          </p>
          <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-48 h-48 mb-4 border" />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter the 6-digit code from your app
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="000000"
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              maxLength={6}
            />
            <button
              onClick={handleVerify}
              disabled={token.length < 6}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Verify & Enable
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
