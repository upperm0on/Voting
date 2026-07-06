import React, { useState, useEffect } from 'react';
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
  const [startIndex, setStartIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(4);

  // Dynamic responsive sizing for carousel
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1150) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 850) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 600) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset carousel index when category changes
  useEffect(() => {
    setStartIndex(0);
  }, [category.id]);

  const isCarousel = candidates.length > 4;
  const currentVisibleCount = isCarousel ? visibleCount : candidates.length;
  
  // Safe limits for startIndex
  const maxStartIndex = Math.max(0, candidates.length - currentVisibleCount);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);

  const visibleCandidates = isCarousel 
    ? candidates.slice(safeStartIndex, safeStartIndex + currentVisibleCount)
    : candidates;

  const handlePrevCarousel = () => {
    setStartIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextCarousel = () => {
    setStartIndex(prev => Math.min(maxStartIndex, prev + 1));
  };

  // Dots navigation
  const dotCount = maxStartIndex + 1;

  return (
    <div className="wizard-card">
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '32px', textTransform: 'capitalize' }}>
        {category.name}
      </h2>

      {candidates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No candidates registered for this position.
        </div>
      ) : isCarousel ? (
        /* Render Carousel Layout */
        <div>
          <div className="carousel-container">
            <button 
              type="button"
              className="carousel-btn" 
              onClick={handlePrevCarousel}
              disabled={safeStartIndex === 0}
              aria-label="Previous candidates"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="carousel-grid">
              {visibleCandidates.map(cand => (
                <CandidateCard 
                  key={cand.id}
                  candidate={cand}
                  isSelected={selectedCandidateId === cand.id}
                  onSelect={() => onSelectCandidate(cand.id)}
                  apiBase={apiBase}
                />
              ))}
            </div>

            <button 
              type="button"
              className="carousel-btn" 
              onClick={handleNextCarousel}
              disabled={safeStartIndex >= maxStartIndex}
              aria-label="Next candidates"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots Indicator */}
          {dotCount > 1 && (
            <div className="carousel-dots">
              {Array.from({ length: dotCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`carousel-dot ${safeStartIndex === i ? 'active' : ''}`}
                  onClick={() => setStartIndex(i)}
                  aria-label={`Go to candidate group ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Render Regular Centered Grid Layout */
        <div className="candidates-grid">
          {visibleCandidates.map(cand => (
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
