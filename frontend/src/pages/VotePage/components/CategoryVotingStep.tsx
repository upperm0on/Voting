import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Category, Candidate } from '../../../types';
import { CandidateCard } from './CandidateCard';

interface CategoryVotingStepProps {
  category: Category;
  candidates: Candidate[];
  selectedCandidateId: number | undefined;
  onSelectCandidate: (candidateId: number) => void;
  apiBase: string;
  onNext: () => void;
  onBack: () => void;
}

export const CategoryVotingStep: React.FC<CategoryVotingStepProps> = ({
  category,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  apiBase,
  onNext,
  onBack
}) => {
  return (
    <div className="wizard-card">
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '32px', textTransform: 'capitalize' }}>
        {category.name}
      </h2>

      {candidates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No candidates registered for this position.
        </div>
      ) : (
        /* Render Regular Centered Grid Layout that wraps to the next line */
        <div className="candidates-grid">
          {candidates.map(cand => (
            <CandidateCard 
              key={cand.id}
              candidate={cand}
              isSelected={selectedCandidateId === cand.id}
              onSelect={() => onSelectCandidate(cand.id)}
              apiBase={apiBase}
            />
          ))}
        </div>
      )}

      {/* Stepper Wizard Actions */}
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
          onClick={onNext}
          disabled={!selectedCandidateId}
        >
          Continue
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
