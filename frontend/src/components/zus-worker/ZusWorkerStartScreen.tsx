import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderPlus, TestTube, FileText, Bot, CheckCircle } from 'lucide-react';

interface ZusWorkerStartScreenProps {
  onNewCase: () => void;
  onTestMode: () => void;
}

export function ZusWorkerStartScreen({ onNewCase, onTestMode }: ZusWorkerStartScreenProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-muted/30">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Asystent analizy wypadków przy pracy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Narzędzie wspierające pracowników ZUS w analizie zgłoszeń wypadków. 
            System automatycznie odczytuje dokumenty i generuje projekty karty wypadku oraz opinii prawnej.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Odczyt OCR</h3>
            <p className="text-sm text-muted-foreground">
              Automatyczne przetwarzanie skanów i dokumentów PDF
            </p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Analiza AI</h3>
            <p className="text-sm text-muted-foreground">
              Ocena zgodności z definicją wypadku przy pracy
            </p>
          </div>
          <div className="p-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium mb-1">Dokumenty wyjściowe</h3>
            <p className="text-sm text-muted-foreground">
              Generowanie karty wypadku i opinii do weryfikacji
            </p>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onNewCase}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <FolderPlus className="w-6 h-6 text-primary-foreground" />
              </div>
              <CardTitle>Nowa sprawa</CardTitle>
              <CardDescription>
                Rozpocznij analizę nowego zgłoszenia wypadku. Wgraj dokumenty źródłowe i uruchom automatyczną analizę.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Rozpocznij</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onTestMode}>
            <CardHeader>
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <TestTube className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle>Tryb testowy / ocena</CardTitle>
              <CardDescription>
                Instrukcja dla jury hackatonu. Krok po kroku jak przetestować rozwiązanie na przykładowych przypadkach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Zobacz instrukcję</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
