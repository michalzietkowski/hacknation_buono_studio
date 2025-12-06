import { useFormContext } from '@/context/FormContext';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { SummaryPanel } from './SummaryPanel';
import { Step0Start } from './steps/Step0Start';
import { Step1Role } from './steps/Step1Role';
import { Step2InjuredPerson } from './steps/Step2InjuredPerson';
import { Step3Business } from './steps/Step3Business';
import { Step4Representative } from './steps/Step4Representative';
import { Step5AccidentBasic } from './steps/Step5AccidentBasic';
import { Step6Injury } from './steps/Step6Injury';
import { Step7Circumstances } from './steps/Step7Circumstances';
import { Step8Witnesses } from './steps/Step8Witnesses';
import { Step9Documents } from './steps/Step9Documents';
import { Step10Summary } from './steps/Step10Summary';

const steps: Record<number, React.ComponentType> = {
  0: Step0Start,
  1: Step1Role,
  2: Step2InjuredPerson,
  3: Step3Business,
  4: Step4Representative,
  5: Step5AccidentBasic,
  6: Step6Injury,
  7: Step7Circumstances,
  8: Step8Witnesses,
  9: Step9Documents,
  10: Step10Summary,
};

export function FormWizard() {
  const { state } = useFormContext();
  const { currentStep, userRole } = state;

  // Skip step 4 (representative) if user is the injured person
  const shouldShowStep = (step: number) => {
    if (step === 4 && userRole === 'injured') return false;
    return true;
  };

  const StepComponent = steps[currentStep];

  if (!StepComponent) {
    return null;
  }

  const showSidePanel = currentStep > 0 && currentStep < 10;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {currentStep > 0 && <ProgressBar />}

      <main className="container mx-auto px-4 py-8">
        {currentStep === 0 ? (
          <StepComponent />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <StepComponent />
            </div>
            {showSidePanel && (
              <div className="hidden lg:block">
                <SummaryPanel />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
