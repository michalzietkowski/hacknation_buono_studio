import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/context/FormContext';

interface FormNavigationProps {
  onNext?: () => void;
  onPrev?: () => void;
  nextDisabled?: boolean;
  showGenerate?: boolean;
  onGenerate?: () => void;
  nextLabel?: string;
}

export function FormNavigation({
  onNext,
  onPrev,
  nextDisabled = false,
  showGenerate = false,
  onGenerate,
  nextLabel = 'Dalej',
}: FormNavigationProps) {
  const { state, nextStep, prevStep } = useFormContext();
  const { currentStep } = state;

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else {
      prevStep();
    }
  };

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
      <Button
        variant="outline"
        onClick={handlePrev}
        disabled={currentStep === 0}
        className="gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Wstecz
      </Button>

      <div className="flex gap-3">
        {showGenerate && (
          <Button onClick={onGenerate} variant="secondary" className="gap-2">
            <FileText className="w-4 h-4" />
            Generuj dokumenty
          </Button>
        )}

        <Button onClick={handleNext} disabled={nextDisabled} className="gap-2">
          {nextLabel}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
