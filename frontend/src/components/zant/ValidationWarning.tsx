import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface ValidationWarningProps {
  message: string;
  suggestion?: string;
  onOverride: (reason: string) => void;
  fieldName: string;
}

export function ValidationWarning({
  message,
  suggestion,
  onOverride,
  fieldName,
}: ValidationWarningProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [reason, setReason] = useState('');

  const handleOverride = () => {
    if (reason.trim().length > 0) {
      onOverride(reason);
      setShowOverride(false);
    }
  };

  return (
    <div className="validation-warning animate-fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm text-foreground font-medium">{message}</p>
          {suggestion && (
            <p className="text-sm text-muted-foreground">{suggestion}</p>
          )}

          {!showOverride ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOverride(true)}
              className="mt-2"
            >
              Przejdź dalej mimo ostrzeżenia
            </Button>
          ) : (
            <div className="space-y-2 mt-3">
              <label className="text-sm font-medium text-foreground">
                Dlaczego chcesz zostawić tę wartość?
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Krótkie uzasadnienie (max 300 znaków)"
                maxLength={300}
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOverride(false)}
                >
                  Anuluj
                </Button>
                <Button
                  size="sm"
                  onClick={handleOverride}
                  disabled={reason.trim().length === 0}
                >
                  Potwierdź i przejdź dalej
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
