import React, { useState } from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

interface VoterTokenFormProps {
  apiBase: string;
  onVerified: (token: string) => void;
}

export const VoterTokenForm: React.FC<VoterTokenFormProps> = ({ apiBase, onVerified }) => {
  const [tokenInput, setTokenInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();
    if (!cleanToken) return;

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/api/verify-token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify token');
      }

      onVerified(cleanToken);
    } catch (err: any) {
      setError(err.message || 'Network error verifying token.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="wizard-card" style={{ maxWidth: '480px', margin: '40px auto', padding: '32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          color: 'var(--primary-color)'
        }}>
          <KeyRound size={28} />
        </div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Voter Authentication</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="token-input" style={{ textAlign: 'center', display: 'block' }}>
            Voter Token
          </label>
          <input
            type="text"
            id="token-input"
            className="form-input"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value.slice(0, 4))}
            placeholder="e.g. X7R2"
            maxLength={4}
            autoComplete="off"
            style={{
              textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', textTransform: 'uppercase',
              height: '60px', fontWeight: 'bold', fontFamily: 'monospace'
            }}
            required
            disabled={isVerifying}
          />
        </div>

        {error && (
          <div style={{
            padding: '12px', borderRadius: '8px', backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger-color)', fontSize: '0.9rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem', justifyContent: 'center' }}
          disabled={isVerifying || tokenInput.trim().length < 4}
        >
          {isVerifying ? 'Verifying...' : 'Unlock Ballot'}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};
