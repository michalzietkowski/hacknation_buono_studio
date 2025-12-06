import React from 'react';
import { useFormContext } from '@/context/FormContext';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { SummaryPanel } from './SummaryPanel';
import { StepEntryMethod } from './steps/StepEntryMethod';
import { StepImportData } from './steps/StepImportData';
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

// Steps for manual entry path
const manualSteps: Record<number, React.ComponentType> = {
  0: StepEntryMethod,
  1: Step0Start,       // Document type selection
  2: Step1Role,        // Role selection
  3: Step2InjuredPerson,
  4: Step3Business,
  5: Step4Representative,
  6: Step5AccidentBasic,
  7: Step6Injury,
  8: Step7Circumstances,
  9: Step8Witnesses,
  10: Step9Documents,
  11: Step10Summary,
};

// Steps for import path
const importSteps: Record<number, React.ComponentType> = {
  0: StepEntryMethod,
  1: Step0Start,       // Document type selection
  2: StepImportData,   // Import with role selection and basic data
  3: Step10Summary,    // Go directly to summary
};

export function FormWizard() {
  const { state, goToStep } = useFormContext();
  const { currentStep, userRole, entryMethod } = state;

  // Get the appropriate steps based on entry method
  const steps = entryMethod === 'import' ? importSteps : manualSteps;
  const totalSteps = Object.keys(steps).length;

  // Redirect if user is on step 5 (representative) but is the injured person
  React.useEffect(() => {
    if (entryMethod === 'manual' && currentStep === 5 && userRole === 'injured') {
      goToStep(6);
    }
  }, [entryMethod, currentStep, userRole, goToStep]);

  const StepComponent = steps[currentStep];

  if (!StepComponent) {
    return null;
  }

  const showSidePanel = entryMethod === 'manual' && currentStep > 1 && currentStep < totalSteps - 1;
  const showProgressBar = currentStep > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {showProgressBar && <ProgressBar />}

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
