import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare } from 'lucide-react';

type FormMode = 'wizard' | 'chat';

interface ModeSelectorProps {
  onSelectMode: (mode: FormMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Wybierz tryb wypełniania formularza
        </h1>
        <p className="text-muted-foreground">
          Możesz wypełnić formularz tradycyjnie krok po kroku lub skorzystać z asystenta rozmowy
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wizard Mode */}
        <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  Tryb kreatora
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Wypełnij formularz krok po kroku, przechodząc przez wszystkie sekcje
                </p>
              </div>
              <Button
                onClick={() => onSelectMode('wizard')}
                className="w-full"
              >
                Wybierz kreator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Mode */}
        <Card className="border-border hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  Tryb rozmowy
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Rozmawiaj z asystentem AI, który pomoże Ci wypełnić formularz
                </p>
              </div>
              <Button
                onClick={() => onSelectMode('chat')}
                className="w-full"
              >
                Wybierz rozmowę
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

