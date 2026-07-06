import React from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import type { Category, Candidate } from '../../../types';

interface BallotReviewStepProps {
  categories: Category[];
  candidates: Candidate[];
  selectedCandidates: Record<number, number>;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onChangeStep: (stepIndex: number) => void;
  apiBase: string;
}

export const BallotReviewStep: React.FC<BallotReviewStepProps> = ({
  categories,
  candidates,
  selectedCandidates,
  onBack,
  onSubmit,
  isSubmitting,
  onChangeStep,
  apiBase
}) => {
  // Helper: Get candidate image path safely
  const getPictureUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  return (
    <div className="wizard-card">
      <h2 className="category-title" style={{ marginBottom: '32px', textAlign: 'center' }}>Review Your Ballot</h2>

      <div className="ballot-review-grid">
        {categories.map((cat, idx) => {
          const selectedId = selectedCandidates[cat.id];
          const cand = candidates.find(c => c.id === selectedId);

          return (
            <div key={cat.id} className="ballot-item">
              <div className="ballot-item-details" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img 
                  src={cand ? getPictureUrl(cand.picture) : ''} 
                  alt="" 
                  className="ballot-item-pic" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                />
                <div className="ballot-item-info" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="ballot-item-cat" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {cat.name}
                  </span>
                  <span className="ballot-item-name" style={{ fontSize: '1.05rem', fontWeight: '600', textTransform: 'capitalize' }}>
                    {cand ? cand.name : 'No selection'}
                  </span>
                </div>
              </div>
              <button 
                type="button"
                className="ballot-change-btn" 
                onClick={() => onChangeStep(idx + 1)}
                style={{
                  padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition-fast)'
                }}
              >
                Change
              </button>
            </div>
          );
        })}
      </div>

      <div className="stepper-actions">
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={onBack}
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <button 
          type="button"
          className="btn btn-primary" 
          style={{ backgroundColor: 'var(--success-color)' }} 
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting Ballot...' : 'Submit Final Ballot'}
          <Check size={18} />
        </button>
      </div>
    </div>
  );
};
