import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, Shield, CircleCheckBig, ArrowRight } from 'lucide-react';

type FormMode = 'wizard';

interface ModeSelectorProps {
  onSelectMode: (mode: FormMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode }) => {
  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-2xl text-center space-y-8 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold text-foreground">
              Zgłoś wypadek przy pracy
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Wypełnij formularz zgłoszenia wypadku przy pracy szybko i łatwo. Przejdź przez wszystkie sekcje formularza w wygodny sposób.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground text-center">Około 10 minut</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground text-center">Bezpieczne dane</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border">
              <CircleCheckBig className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground text-center">Proste kroki</span>
            </div>
          </div>

          {/* Mode Selection Cards */}
          <div className="flex justify-center pt-4">
            <Card 
              className="border-border hover:border-primary/50 transition-all hover:shadow-md cursor-pointer max-w-md w-full"
              onClick={() => onSelectMode('wizard')}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Wypełnij wniosek
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Przejdź przez wszystkie sekcje formularza w wygodny sposób
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMode('wizard');
                    }}
                    className="w-full gap-2"
                  >
                    Wybierz kreator
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <p className="text-xs text-muted-foreground pt-4">
            Możesz zapisać postęp i wrócić do formularza w dowolnym momencie
          </p>
        </div>
      </div>
    </div>
  );
};

