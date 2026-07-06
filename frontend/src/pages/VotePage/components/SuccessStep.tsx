import React from 'react';
import { Check, RotateCcw } from 'lucide-react';

interface SuccessStepProps {
  onReset: () => void;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onReset }) => {
  return (
    <div className="wizard-card success-screen" style={{ textAlign: 'center', padding: '48px' }}>
      <div className="success-icon-wrapper" style={{
        width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--success-bg)',
        display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: 'var(--success-color)'
      }}>
        <Check size={40} />
      </div>
      
      <h1 style={{ fontSize: '2.2rem', marginBottom: '32px' }}>Ballot Successfully Cast!</h1>
      
      <button 
        type="button"
        className="btn btn-primary" 
        onClick={onReset}
        style={{ margin: '0 auto' }}
      >
        <RotateCcw size={18} />
        Cast Another Vote
      </button>
    </div>
  );
};
