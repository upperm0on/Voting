import React from 'react';
import { Check, CheckCircle2 } from 'lucide-react';
import type { Candidate } from '../../../types';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onSelect: () => void;
  apiBase: string;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  onSelect,
  apiBase
}) => {
  // Helper: Get candidate image path safely
  const getPictureUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  return (
    <div 
      className={`candidate-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {/* Select Circle Indicator in Top Corner */}
      <div className="select-indicator">
        {isSelected && <Check size={14} className="select-check" />}
      </div>

      <div className="candidate-picture-container">
        <img 
          src={getPictureUrl(candidate.picture)} 
          alt={candidate.name} 
          className="candidate-picture" 
          loading="lazy"
        />
      </div>
      
      <span className="candidate-name">{candidate.name}</span>
      
      {/* Prominent Distinguished Vote Button */}
      <button 
        type="button" 
        className="candidate-vote-btn"
        onClick={(e) => {
          e.stopPropagation(); // prevent double triggers from card click
          onSelect();
        }}
      >
        {isSelected ? (
          <>
            <CheckCircle2 size={16} />
            <span>Selected</span>
          </>
        ) : (
          <span>Select Candidate</span>
        )}
      </button>
    </div>
  );
};
