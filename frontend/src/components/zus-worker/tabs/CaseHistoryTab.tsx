import { useState } from 'react';
import { AccidentCase, HistoryEntry, CaseComment } from '@/types/zus-worker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  History, 
  MessageSquare, 
  Send, 
  User, 
  FileText, 
  CheckCircle, 
  Edit, 
  Plus,
  Clock,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

interface CaseHistoryTabProps {
  caseData: AccidentCase;
  onUpdate: (updatedCase: AccidentCase) => void;
}

const actionIcons: Record<HistoryEntry['action'], typeof History> = {
  created: Plus,
  status_changed: CheckCircle,
  field_updated: Edit,
  document_added: FileText,
  comment_added: MessageSquare,
  analysis_changed: Edit,
};

const actionLabels: Record<HistoryEntry['action'], string> = {
  created: 'Utworzono sprawę',
  status_changed: 'Zmiana statusu',
  field_updated: 'Aktualizacja pola',
  document_added: 'Dodano dokument',
  comment_added: 'Dodano komentarz',
  analysis_changed: 'Zmiana analizy',
};

export function CaseHistoryTab({ caseData, onUpdate }: CaseHistoryTabProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(true);

  const history = caseData.history || [];
  const comments = caseData.comments || [];

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Wprowadź treść komentarza');
      return;
    }

    const comment: CaseComment = {
      id: `comment-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'user-1',
      userName: 'Jan Kowalski',
      content: newComment.trim(),
      isInternal,
    };

    const historyEntry: HistoryEntry = {
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: 'user-1',
      userName: 'Jan Kowalski',
      action: 'comment_added',
      description: `Dodano ${isInternal ? 'wewnętrzny' : 'zewnętrzny'} komentarz`,
    };

    onUpdate({
      ...caseData,
      comments: [...comments, comment],
      history: [...history, historyEntry],
      lastModified: new Date().toISOString(),
      modifiedBy: 'Jan Kowalski',
    });

    setNewComment('');
    toast.success('Komentarz dodany');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Combine and sort history and comments by timestamp
  const timeline = [
    ...history.map(h => ({ ...h, type: 'history' as const })),
    ...comments.map(c => ({ ...c, type: 'comment' as const, action: 'comment_added' as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Add Comment Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Dodaj komentarz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Wpisz treść komentarza..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked === true)}
              />
              <Label htmlFor="internal" className="text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Komentarz wewnętrzny (widoczny tylko dla pracowników ZUS)
              </Label>
            </div>
            <Button onClick={handleAddComment} className="gap-2">
              <Send className="w-4 h-4" />
              Dodaj komentarz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Historia zmian i komentarze
            <Badge variant="outline" className="ml-auto">
              {timeline.length} {timeline.length === 1 ? 'wpis' : 'wpisów'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Brak historii zmian dla tej sprawy
            </p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => {
                const Icon = item.type === 'comment' ? MessageSquare : actionIcons[item.action];
                const isComment = item.type === 'comment';

                return (
                  <div key={item.id}>
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isComment 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">
                            {item.userName}
                          </span>
                          {isComment && (item as CaseComment & { type: 'comment' }).isInternal && (
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Lock className="w-3 h-3" />
                              Wewnętrzny
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        
                        {isComment ? (
                          <p className="mt-1 text-sm bg-muted/50 rounded-lg p-3">
                            {(item as CaseComment & { type: 'comment' }).content}
                          </p>
                        ) : (
                          <div className="mt-1">
                            <p className="text-sm text-muted-foreground">
                              {(item as HistoryEntry & { type: 'history' }).description}
                            </p>
                            {(item as HistoryEntry & { type: 'history' }).details && (
                              <div className="mt-1 text-xs text-muted-foreground bg-muted/30 rounded p-2">
                                {(item as HistoryEntry & { type: 'history' }).details?.field && (
                                  <span className="font-medium">{(item as HistoryEntry & { type: 'history' }).details?.field}: </span>
                                )}
                                {(item as HistoryEntry & { type: 'history' }).details?.oldValue && (
                                  <span className="line-through text-destructive">{(item as HistoryEntry & { type: 'history' }).details?.oldValue}</span>
                                )}
                                {(item as HistoryEntry & { type: 'history' }).details?.oldValue && (item as HistoryEntry & { type: 'history' }).details?.newValue && ' → '}
                                {(item as HistoryEntry & { type: 'history' }).details?.newValue && (
                                  <span className="text-green-600 dark:text-green-400">{(item as HistoryEntry & { type: 'history' }).details?.newValue}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < timeline.length - 1 && (
                      <Separator className="ml-4 mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
