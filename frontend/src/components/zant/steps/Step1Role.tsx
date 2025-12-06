import { User, UserCheck } from 'lucide-react';
import { useFormContext } from '@/context/FormContext';
import { UserRole } from '@/types/form';
import { cn } from '@/lib/utils';
import { FormNavigation } from '../FormNavigation';

const roleOptions: { type: UserRole; label: string; description: string; icon: typeof User }[] = [
  {
    type: 'injured',
    label: 'Jestem poszkodowanym',
    description: 'Zgłaszam wypadek, który mnie bezpośrednio dotyczył',
    icon: User,
  },
  {
    type: 'representative',
    label: 'Jestem pełnomocnikiem poszkodowanego',
    description: 'Zgłaszam wypadek w imieniu innej osoby',
    icon: UserCheck,
  },
];

export function Step1Role() {
  const { state, updateField, nextStep } = useFormContext();
  const { userRole } = state;

  const handleSelect = (role: UserRole) => {
    updateField('userRole', role);
  };

  const handleNext = () => {
    // Skip step 4 (representative data) if user is the injured person
    nextStep();
  };

  return (
    <div className="form-section">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold text-foreground">Kim jesteś w tym zgłoszeniu?</h2>
        <p className="text-muted-foreground">
          Wybierz, czy zgłaszasz wypadek jako poszkodowany, czy jako pełnomocnik.
        </p>
      </div>

      <div className="grid gap-4 mb-8">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = userRole === option.type;

          return (
            <button
              key={option.type}
              onClick={() => handleSelect(option.type)}
              className={cn(
                'flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-secondary/50'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">{option.label}</h4>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {userRole === 'representative' && (
        <div className="bg-secondary/50 rounded-xl p-4 mb-8 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Informacja:</strong> Jako pełnomocnik będziesz
            musiał podać swoje dane oraz dołączyć pełnomocnictwo do zgłoszenia.
          </p>
        </div>
      )}

      <FormNavigation nextDisabled={!userRole} onNext={handleNext} />
    </div>
  );
}
