import { Button } from '@/components/ui/button';
import { ArrowLeft, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ZusWorkerHeaderProps {
  onBackToClient: () => void;
}

export function ZusWorkerHeader({ onBackToClient }: ZusWorkerHeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center font-bold text-lg">
            ZUS
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">ZANT</h1>
            <p className="text-xs text-primary-foreground/80">Moduł Pracownika ZUS</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onBackToClient}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Moduł klienta</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground hover:bg-primary-foreground/10">
              <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Jan Kowalski</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5">
              <p className="font-medium">Jan Kowalski</p>
              <p className="text-xs text-muted-foreground">Starszy specjalista</p>
              <p className="text-xs text-muted-foreground">I Oddział w Warszawie</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="w-4 h-4 mr-2" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
