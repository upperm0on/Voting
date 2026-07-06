import React, { useState } from 'react';
import type { Category, Candidate } from '../../types';
import { VoterTokenForm } from './components/VoterTokenForm';
import { WelcomeStep } from './components/WelcomeStep';
import { CategoryVotingStep } from './components/CategoryVotingStep';
import { BallotReviewStep } from './components/BallotReviewStep';
import { SuccessStep } from './components/SuccessStep';

interface VotePageProps {
  categories: Category[];
  candidates: Candidate[];
  apiBase: string;
}

export const VotePage: React.FC<VotePageProps> = ({ categories, candidates, apiBase }) => {
  const [voterToken, setVoterToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleVerified = (token: string) => {
    setVoterToken(token);
    setCurrentStep(0); // Start at instructions / welcome screen
  };

  const handleSelectCandidate = (categoryId: number, candidateId: number) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [categoryId]: candidateId
    }));
  };

  const handleNextStep = () => {
    if (currentStep > 0 && currentStep <= categories.length) {
      const currentCategory = categories[currentStep - 1];
      if (!selectedCandidates[currentCategory.id]) {
        alert(`Please select a candidate for the position: ${currentCategory.name}`);
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    setSelectedCandidates({});
    setVoterToken(null);
    setCurrentStep(0);
  };

  const handleSubmitBallot = async () => {
    if (!voterToken) return;
    setIsSubmitting(true);

    try {
      const votesPayload = Object.values(selectedCandidates).map(id => ({ voted_for: id }));
      
      const res = await fetch(`${apiBase}/api/vote/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: voterToken,
          votes: votesPayload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ballot');
      }

      // Jump to Success step (which will be categories.length + 2)
      setCurrentStep(categories.length + 2);
    } catch (err: any) {
      console.error(err);
      alert('Failed to submit ballot: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Token verification first
  if (!voterToken) {
    return <VoterTokenForm apiBase={apiBase} onVerified={handleVerified} />;
  }

  // Step 2: Welcome screen
  if (currentStep === 0) {
    return (
      <WelcomeStep 
        hasCategories={categories.length > 0} 
        onStart={handleNextStep} 
        token={voterToken}
      />
    );
  }

  // Step 3: Stepper headers
  const isReviewStep = currentStep === categories.length + 1;
  const isSuccessStep = currentStep === categories.length + 2;

  return (
    <div>
      {/* Stepper Header Progress Tracker */}
      {!isSuccessStep && (
        <div className="stepper-header" style={{ marginBottom: '32px' }}>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / (categories.length + 1)) * 100}%` }}
            ></div>
          </div>
          <div className="step-info" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <span>Step {currentStep} of {categories.length + 1}</span>
            <span>{isReviewStep ? 'Ballot Review' : 'Selecting Candidates'}</span>
          </div>
        </div>
      )}

      {/* Stepper Wizard Core Screens */}
      {categories.map((cat, idx) => {
        const stepIndex = idx + 1;
        if (currentStep !== stepIndex) return null;

        const positionCandidates = candidates.filter(c => c.position === cat.id);

        return (
          <CategoryVotingStep
            key={cat.id}
            category={cat}
            candidates={positionCandidates}
            selectedCandidateId={selectedCandidates[cat.id]}
            onSelectCandidate={(candId) => handleSelectCandidate(cat.id, candId)}
            apiBase={apiBase}
            onNext={handleNextStep}
            onBack={handlePrevStep}
          />
        );
      })}

      {/* Ballot Review step */}
      {isReviewStep && (
        <BallotReviewStep
          categories={categories}
          candidates={candidates}
          selectedCandidates={selectedCandidates}
          onBack={handlePrevStep}
          onSubmit={handleSubmitBallot}
          isSubmitting={isSubmitting}
          onChangeStep={(stepIdx) => setCurrentStep(stepIdx)}
          apiBase={apiBase}
        />
      )}

      {/* Success step */}
      {isSuccessStep && (
        <SuccessStep onReset={handleReset} />
      )}
    </div>
  );
};
