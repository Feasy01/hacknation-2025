import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface AnalysisProgressDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'dialog' | 'overlay';
}

const ANALYSIS_STEPS: Omit<AnalysisStep, 'status'>[] = [
  { id: 'quality', label: 'Weryfikowanie jakości odpowiedzi' },
  { id: 'dates', label: 'Sprawdzanie poprawności dat' },
  { id: 'similar', label: 'Porównywanie podobnych przypadków' },
  { id: 'completeness', label: 'Weryfikacja kompletności danych' },
  { id: 'validation', label: 'Walidacja zgodności z wymaganiami' },
];

export const AnalysisProgressDialog: React.FC<AnalysisProgressDialogProps> = ({
  open,
  onOpenChange,
  variant = 'dialog',
}) => {
  const [steps, setSteps] = useState<AnalysisStep[]>(
    ANALYSIS_STEPS.map((step) => ({ ...step, status: 'pending' as const }))
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [allStepsReached, setAllStepsReached] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setSteps(ANALYSIS_STEPS.map((step) => ({ ...step, status: 'pending' as const })));
      setCurrentStepIndex(0);
      setAllStepsReached(false);
      return;
    }

    // Start the progress simulation
    let stepIndex = 0;
    const interval = setInterval(() => {
      setSteps((prev) => {
        const newSteps = [...prev];
        
        // Mark previous step as completed
        if (stepIndex > 0) {
          newSteps[stepIndex - 1] = {
            ...newSteps[stepIndex - 1],
            status: 'completed',
          };
        }
        
        // Mark current step as in progress
        if (stepIndex < newSteps.length) {
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            status: 'in_progress',
          };
        }
        
        return newSteps;
      });
      
      setCurrentStepIndex(stepIndex);
      stepIndex++;
      
      // Stop when we reach the last step (keep it in progress)
      if (stepIndex >= ANALYSIS_STEPS.length) {
        clearInterval(interval);
        setAllStepsReached(true);
        // Last step stays in progress - don't mark it as completed yet
      }
    }, 1500); // Each step takes 1.5 seconds

    return () => clearInterval(interval);
  }, [open, onOpenChange]);

  // When dialog is closing and all steps were reached, mark last step as completed
  useEffect(() => {
    if (!open && allStepsReached) {
      setSteps((prev) => {
        const newSteps = [...prev];
        // Mark the last step as completed when closing
        if (newSteps.length > 0) {
          newSteps[newSteps.length - 1] = {
            ...newSteps[newSteps.length - 1],
            status: 'completed',
          };
        }
        return newSteps;
      });
    }
  }, [open, allStepsReached]);

  // Calculate progress - show progress based on current step, but cap at ~95% until last step completes
  // When all steps are reached, show 95% (not 100% until analysis completes)
  const progressPercentage = allStepsReached
    ? 95
    : ((currentStepIndex + 1) / ANALYSIS_STEPS.length) * 100;

  const content = (
    <>
      <div className="space-y-4 py-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Postęp</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-2 rounded-lg transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                {step.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : step.status === 'in_progress' ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <span
                className={`text-sm flex-1 ${
                  step.status === 'completed'
                    ? 'text-foreground'
                    : step.status === 'in_progress'
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  if (variant === 'overlay') {
    return (
      <>
        {open && (
          <>
            {/* Backdrop that greys out the wizard */}
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm" />
            {/* Loading dialog centered in the form column */}
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-card border border-border rounded-lg shadow-lg p-6 w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 pointer-events-auto">
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-semibold leading-none tracking-tight">
                    Analizowanie formularza
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Trwa weryfikacja wprowadzonych danych...
                  </p>
                </div>
                {content}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while steps are still progressing (but allow once all steps reached)
      if (!newOpen && !allStepsReached && currentStepIndex < ANALYSIS_STEPS.length - 1) {
        return;
      }
      onOpenChange?.(newOpen);
    }}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Analizowanie formularza</DialogTitle>
          <DialogDescription>
            Trwa weryfikacja wprowadzonych danych...
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

