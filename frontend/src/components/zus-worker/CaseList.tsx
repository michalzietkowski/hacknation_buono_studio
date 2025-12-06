import { useState } from 'react';
import { AccidentCase, CaseFilters, CaseStatus, CaseType } from '@/types/zus-worker';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, RefreshCw, AlertTriangle, Skull, Plane, Clock } from 'lucide-react';
import { NewCaseDialog } from './NewCaseDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface CaseListProps {
  cases: AccidentCase[];
  filters: CaseFilters;
  onFiltersChange: (filters: CaseFilters) => void;
  selectedCaseId: string | null;
  onCaseSelect: (caseId: string) => void;
}

const statusLabels: Record<CaseStatus, string> = {
  new: 'Nowa',
  in_progress: 'W toku',
  ready_for_decision: 'Gotowa do decyzji',
  closed: 'Zamknięta',
};

const statusColors: Record<CaseStatus, string> = {
  new: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  in_progress: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  ready_for_decision: 'bg-green-500/20 text-green-700 dark:text-green-300',
  closed: 'bg-gray-500/20 text-gray-700 dark:text-gray-300',
};

const caseTypeIcons: Record<CaseType, React.ReactNode> = {
  standard: null,
  fatal: <Skull className="w-4 h-4 text-destructive" />,
  abroad: <Plane className="w-4 h-4 text-primary" />,
};

export function CaseList({ cases, filters, onFiltersChange, selectedCaseId, onCaseSelect }: CaseListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.caseType && c.caseType !== filters.caseType) return false;
    if (filters.highRisk && c.analysis?.overallRecommendation !== 'unclear') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.caseNumber.toLowerCase().includes(query) ||
        c.injuredLastName.toLowerCase().includes(query) ||
        c.injuredFirstName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    // Sort by days remaining (urgent first), then by date
    if (a.daysRemaining <= 3 && b.daysRemaining > 3) return -1;
    if (b.daysRemaining <= 3 && a.daysRemaining > 3) return 1;
    return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
  });

  return (
    <div className="h-full flex flex-col">
      {/* Search and filters */}
      <div className="p-4 space-y-3 border-b border-border">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj sprawy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtry</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? undefined : v as CaseStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="new">Nowe</SelectItem>
                      <SelectItem value="in_progress">W toku</SelectItem>
                      <SelectItem value="ready_for_decision">Gotowe do decyzji</SelectItem>
                      <SelectItem value="closed">Zamknięte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Typ zdarzenia</Label>
                  <Select
                    value={filters.caseType || 'all'}
                    onValueChange={(v) => onFiltersChange({ ...filters, caseType: v === 'all' ? undefined : v as CaseType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie</SelectItem>
                      <SelectItem value="standard">Standardowy</SelectItem>
                      <SelectItem value="fatal">Śmiertelny</SelectItem>
                      <SelectItem value="abroad">Za granicą</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="highRisk">Tylko wysokie ryzyko</Label>
                  <Switch
                    id="highRisk"
                    checked={filters.highRisk || false}
                    onCheckedChange={(checked) => onFiltersChange({ ...filters, highRisk: checked })}
                  />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onFiltersChange({})}
                >
                  Wyczyść filtry
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <NewCaseDialog />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            Wszystkie: {cases.length}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-blue-500/20">
            Nowe: {cases.filter(c => c.status === 'new').length}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-yellow-500/20">
            W toku: {cases.filter(c => c.status === 'in_progress').length}
          </Badge>
        </div>
      </div>

      {/* Case list */}
      <div className="flex-1 overflow-y-auto">
        {sortedCases.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Brak spraw do obsługi</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <RefreshCw className="w-4 h-4" />
              Odśwież
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedCases.map((c) => (
              <button
                key={c.id}
                onClick={() => onCaseSelect(c.id)}
                className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                  selectedCaseId === c.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {caseTypeIcons[c.caseType]}
                      <span className="font-medium text-sm truncate">{c.caseNumber}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">
                      {c.injuredLastName} {c.injuredFirstName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.zusUnit}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${statusColors[c.status]}`}>
                      {statusLabels[c.status]}
                    </Badge>
                    <div className={`flex items-center gap-1 text-xs ${
                      c.daysRemaining <= 3 ? 'text-destructive font-medium' : 'text-muted-foreground'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {c.daysRemaining > 0 ? `${c.daysRemaining} dni` : c.daysRemaining === 0 ? 'Dziś!' : 'Przekroczony'}
                    </div>
                  </div>
                </div>
                {c.analysis?.overallRecommendation === 'unclear' && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" />
                    Wysokie ryzyko braku definicji wypadku
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
