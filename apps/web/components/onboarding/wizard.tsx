"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface OnboardingStep {
  title: string;
  description: string;
  component: React.ReactNode;
  validate?: () => { isValid: boolean; error?: string };
}

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: () => void;
}

export function OnboardingWizard({ steps, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    // Validate current step if validation function exists
    const currentStepData = steps[currentStep];
    if (currentStepData.validate) {
      const validation = currentStepData.validate();
      if (!validation.isValid) {
        setError(validation.error || "Please complete all required fields");
        return;
      }
    }

    // Clear error and proceed
    setError(null);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-neutral-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-text">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-neutral-text-secondary">
              {Math.round(progress)}% complete
            </span>
          </div>
          <div className="w-full bg-neutral-border rounded-full h-2">
            <div
              className="bg-brand-orange h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-border p-8">
          <h2 className="text-2xl font-semibold text-neutral-text mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-neutral-text-secondary mb-6">
            {steps[currentStep].description}
          </p>

          <div className="mb-8">{steps[currentStep].component}</div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-border">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-text-secondary hover:text-neutral-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white text-sm font-medium rounded-md hover:bg-brand-orange/90 transition-colors"
            >
              {currentStep === steps.length - 1 ? "Complete" : "Continue"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={onComplete}
            className="text-sm text-neutral-text-secondary hover:text-neutral-text"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
