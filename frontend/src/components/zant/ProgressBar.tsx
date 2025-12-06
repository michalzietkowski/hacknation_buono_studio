import { useFormContext } from '@/context/FormContext';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const steps = [
  { id: 0, label: 'Start' },
  { id: 1, label: 'Rola' },
  { id: 2, label: 'Dane poszkodowanego' },
  { id: 3, label: 'Działalność' },
  { id: 4, label: 'Pełnomocnik' },
  { id: 5, label: 'Wypadek' },
  { id: 6, label: 'Uraz' },
  { id: 7, label: 'Okoliczności' },
  { id: 8, label: 'Świadkowie' },
  { id: 9, label: 'Dokumenty' },
  { id: 10, label: 'Podsumowanie' },
];

export function ProgressBar() {
  const { state, goToStep } = useFormContext();
  const { currentStep, completedSteps, userRole } = state;

  // Skip step 4 (representative) if user is the injured person
  const visibleSteps = steps.filter(
    (step) => step.id !== 4 || userRole === 'representative'
  );

  const progress = (currentStep / (visibleSteps.length - 1)) * 100;

  return (
    <div className="bg-card border-b border-border py-4">
      <div className="container mx-auto px-4">
        {/* Progress bar */}
        <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators - only show on larger screens */}
        <div className="hidden md:flex justify-between">
          {visibleSteps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = isCompleted || currentStep >= step.id;

            return (
              <button
                key={step.id}
                onClick={() => isAccessible && goToStep(step.id)}
                disabled={!isAccessible}
                className={cn(
                  'flex flex-col items-center gap-1 transition-all',
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2',
                    isCompleted && !isCurrent && 'bg-primary text-primary-foreground',
                    !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs max-w-[80px] text-center',
                    isCurrent && 'text-primary font-medium',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile step indicator */}
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Krok {currentStep + 1} z {visibleSteps.length}
          </span>
          <span className="text-sm font-medium text-foreground">
            {visibleSteps.find((s) => s.id === currentStep)?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
