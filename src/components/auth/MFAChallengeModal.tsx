import React, { useState, useEffect, useRef } from 'react';
import { twoFactorAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MFAChallengeModalProps {
  onSuccess: (tokens: any) => void;
  onCancel: () => void;
  tempToken: string; // The token with mfaVerified=false
}

export const MFAChallengeModal: React.FC<MFAChallengeModalProps> = ({ onSuccess, onCancel, tempToken }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Save the element that had focus before modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;
    // Focus the input
    const input = document.getElementById('mfa-token');
    input?.focus();
    // Trap focus inside modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to element that triggered modal
      previousActiveElement.current?.focus();
    };
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the pre-MFA temp token ONLY for this verify call.
      const res = await twoFactorAPI.verify({ token: token.trim() }, tempToken);
      const data = res.data;
      if (data.success) {
        onSuccess(data.data.tokens);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mfa-modal-title"
      onClick={onCancel}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="mfa-modal-title" className="text-xl font-bold mb-4">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Please enter the 6-digit code from your authenticator app or a backup code.
        </p>

        {error && (
          <div className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-2 mb-4">
            <Label htmlFor="mfa-token">Verification Code</Label>
            <Input
              id="mfa-token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="text-lg text-center tracking-widest"
              placeholder="000000"
              autoFocus
              inputMode="numeric"
              maxLength={6}
              disabled={loading}
            />
          </div>

          {error && <div className="text-red-500 text-sm mb-3 bg-red-50 p-2 rounded" role="alert">{error}</div>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!token || loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
