import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  shortTitle: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-max px-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isClickable = !!onStepClick;

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  'flex flex-col items-center gap-2 transition-all duration-300',
                  isClickable && 'cursor-pointer hover:opacity-80'
                )}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                <div
                  className={cn(
                    'step-indicator',
                    isCompleted && 'step-indicator-completed',
                    isActive && 'step-indicator-active',
                    !isCompleted && !isActive && 'step-indicator-inactive'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center max-w-[80px] leading-tight hidden sm:block',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {step.shortTitle}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors duration-300',
                    currentStep > step.id ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export const FORM_STEPS: Step[] = [
  { id: 1, title: 'Dane poszkodowanego', shortTitle: 'Poszkodowany' },
  { id: 2, title: 'Adres zamieszkania', shortTitle: 'Adres' },
  { id: 3, title: 'Adres działalności', shortTitle: 'Działalność' },
  { id: 4, title: 'Zgłaszający', shortTitle: 'Zgłaszający' },
  { id: 5, title: 'Szczegóły wypadku', shortTitle: 'Wypadek' },
  { id: 6, title: 'Maszyny i urządzenia', shortTitle: 'Maszyny' },
  { id: 7, title: 'Świadkowie', shortTitle: 'Świadkowie' },
  { id: 8, title: 'Podsumowanie', shortTitle: 'Podsumowanie' },
];
