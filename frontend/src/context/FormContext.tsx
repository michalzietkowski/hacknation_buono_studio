import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FormState, initialFormState, ValidationOverride } from '@/types/form';

type FormAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'UPDATE_FIELD'; payload: { path: string; value: any } }
  | { type: 'ADD_VALIDATION_OVERRIDE'; payload: ValidationOverride }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'RESET_FORM' };

function updateNestedField(obj: any, path: string, value: any): any {
  const keys = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...current[key] };
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
  return result;
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'UPDATE_FIELD':
      return updateNestedField(state, action.payload.path, action.payload.value);
    case 'ADD_VALIDATION_OVERRIDE':
      return {
        ...state,
        validationOverrides: [...state.validationOverrides, action.payload],
      };
    case 'MARK_STEP_COMPLETED':
      if (state.completedSteps.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload],
      };
    case 'RESET_FORM':
      return initialFormState;
    default:
      return state;
  }
}

interface FormContextType {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  updateField: (path: string, value: any) => void;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  addOverride: (field: string, reason: string) => void;
  markStepCompleted: (step: number) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialFormState);

  const updateField = (path: string, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { path, value } });
  };

  const goToStep = (step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  };

  const nextStep = () => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: state.currentStep });
    let nextStepNum = state.currentStep + 1;
    
    // Skip step 5 (representative) if user is the injured person in manual mode
    if (state.entryMethod === 'manual' && nextStepNum === 5 && state.userRole === 'injured') {
      nextStepNum = 6;
    }
    
    dispatch({ type: 'SET_STEP', payload: nextStepNum });
  };

  const prevStep = () => {
    let prevStepNum = state.currentStep - 1;
    
    // Skip step 5 (representative) when going back if user is the injured person in manual mode
    if (state.entryMethod === 'manual' && prevStepNum === 5 && state.userRole === 'injured') {
      prevStepNum = 4;
    }
    
    dispatch({ type: 'SET_STEP', payload: Math.max(0, prevStepNum) });
  };

  const addOverride = (field: string, reason: string) => {
    dispatch({
      type: 'ADD_VALIDATION_OVERRIDE',
      payload: {
        field,
        reason,
        overriddenAt: new Date().toISOString(),
      },
    });
  };

  const markStepCompleted = (step: number) => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: step });
  };

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch,
        updateField,
        goToStep,
        nextStep,
        prevStep,
        addOverride,
        markStepCompleted,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
