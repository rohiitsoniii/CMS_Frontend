import React, { useState } from 'react';

interface MFAChallengeModalProps {
  onSuccess: (tokens: any) => void;
  onCancel: () => void;
  tempToken: string; // The token with mfaVerified=false
}

export const MFAChallengeModal: React.FC<MFAChallengeModalProps> = ({ onSuccess, onCancel, tempToken }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();
      if (data.success) {
        onSuccess(data.data.tokens);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch {
      setError('Network error verifying code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full p-6">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please enter the 6-digit code from your authenticator app or a backup code.
        </p>

        {error && <div className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-lg text-center tracking-widest mb-4"
            placeholder="000000"
            autoFocus
          />
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!token || loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
