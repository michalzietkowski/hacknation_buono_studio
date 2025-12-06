import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AccidentCase } from '@/types/zus-worker';
import { mockCases } from '@/data/mockCases';

interface CasesContextType {
  cases: AccidentCase[];
  addCase: (newCase: AccidentCase) => void;
  updateCase: (updatedCase: AccidentCase) => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

export function CasesProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<AccidentCase[]>(mockCases);

  const addCase = (newCase: AccidentCase) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (updatedCase: AccidentCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  return (
    <CasesContext.Provider value={{ cases, addCase, updateCase }}>
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CasesContext);
  if (!context) {
    throw new Error('useCases must be used within CasesProvider');
  }
  return context;
}
