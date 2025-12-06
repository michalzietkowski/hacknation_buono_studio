import { AccidentCase } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ListChecks } from 'lucide-react';

interface CaseActionsTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

export function CaseActionsTab({ caseData, onUpdate }: CaseActionsTabProps) {
  const handleToggleAction = (actionId: string) => {
    const updatedActions = caseData.suggestedActions?.map(action => {
      if (action.id === actionId) {
        return {
          ...action,
          completed: !action.completed,
          completedDate: !action.completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return action;
    });

    onUpdate({
      ...caseData,
      suggestedActions: updatedActions,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ListChecks className="w-4 h-4" /> Sugerowane czynności
        </CardTitle>
      </CardHeader>
      <CardContent>
        {caseData.suggestedActions?.length ? (
          <div className="space-y-2">
            {caseData.suggestedActions.map(action => (
              <div key={action.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Checkbox 
                  checked={action.completed}
                  onCheckedChange={() => handleToggleAction(action.id)}
                />
                <div className="flex-1">
                  <p className={`text-sm ${action.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {action.description}
                  </p>
                  {action.completedDate && (
                    <p className="text-xs text-muted-foreground">Wykonano: {action.completedDate}</p>
                  )}
                </div>
                <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'}>
                  {action.priority === 'high' ? 'Wysoki' : action.priority === 'medium' ? 'Średni' : 'Niski'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Brak sugerowanych czynności</p>
        )}
      </CardContent>
    </Card>
  );
}
