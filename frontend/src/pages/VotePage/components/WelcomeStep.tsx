import React from 'react';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface WelcomeStepProps {
  hasCategories: boolean;
  onStart: () => void;
  token: string;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ hasCategories, onStart, token }) => {
  return (
    <div className="wizard-card" style={{ textAlign: 'center', padding: '48px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: 'var(--success-bg)', color: 'var(--success-color)', fontSize: '0.85rem', fontWeight: '600', marginBottom: '24px' }}>
        <ShieldCheck size={16} />
        <span>Token Authorized: {token}</span>
      </div>
      
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px' }}>KsTS Ballot System</h1>

      {!hasCategories ? (
        <div style={{ color: 'var(--secondary-hover)', fontWeight: 'bold' }}>
          No voting positions have been configured. Please contact the administrator.
        </div>
      ) : (
        <button 
          className="btn btn-primary" 
          style={{ padding: '14px 28px', fontSize: '1.1rem', margin: '0 auto' }} 
          onClick={onStart}
        >
          Proceed to Vote
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};
