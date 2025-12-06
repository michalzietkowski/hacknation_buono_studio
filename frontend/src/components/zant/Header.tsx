import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Z</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">ZANT</h1>
            <p className="text-xs text-muted-foreground">ZUS Accident Notification Tool</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Info className="w-4 h-4" />
              O narzędziu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>O narzędziu ZANT</DialogTitle>
              <DialogDescription className="space-y-4 pt-4">
                <p>
                  <strong>ZANT</strong> (ZUS Accident Notification Tool) to asystent, który pomoże
                  Ci przejść przez proces zgłoszenia wypadku przy pracy do ZUS.
                </p>
                <p>
                  Narzędzie prowadzi Cię krok po kroku przez wypełnienie:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Zawiadomienia o wypadku</li>
                  <li>Wyjaśnień poszkodowanego</li>
                </ul>
                <p>
                  Na końcu otrzymasz gotowe dokumenty do pobrania w formacie PDF lub edytowalnym,
                  które możesz wysłać przez PUE/eZUS lub złożyć w placówce ZUS.
                </p>
                <p className="text-sm text-muted-foreground">
                  Przygotuj: dokumentację medyczną, dane firmy (NIP/REGON), informacje o świadkach.
                </p>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
