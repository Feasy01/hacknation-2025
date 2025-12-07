import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { Witness, AINote } from '@/types/accident-report';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasFieldError } from '@/utils/fieldMapping';

interface Step7Props {
  witnesses: Witness[];
  onChange: (witnesses: Witness[]) => void;
  aiNotes?: AINote[];
}

export const Step7Witnesses: React.FC<Step7Props> = ({ witnesses, onChange, aiNotes = [] }) => {
  const addWitness = () => {
    const newWitness: Witness = {
      id: crypto.randomUUID(),
      imie: '',
      nazwisko: '',
      ulica: '',
      nrDomu: '',
      nrLokalu: '',
      kodPocztowy: '',
      miejscowosc: '',
      panstwo: '',
    };
    onChange([...witnesses, newWitness]);
  };

  const removeWitness = (id: string) => {
    onChange(witnesses.filter((w) => w.id !== id));
  };

  const updateWitness = (id: string, field: keyof Witness, value: string) => {
    onChange(
      witnesses.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="form-section">
        <div className="bg-[hsl(var(--section-header))] text-[hsl(var(--section-header-foreground))] px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 mb-0">
            <Users className="w-4 h-4" />
            Świadkowie wypadku
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addWitness}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Dodaj świadka
          </Button>
        </div>

        <div className="form-section-content">
          {witnesses.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
              <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Brak dodanych świadków wypadku
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Kliknij "Dodaj świadka" jeśli ktoś widział wypadek lub posiada informacje o zdarzeniu
              </p>
            </div>
          ) : (
          <div className="space-y-6">
            {witnesses.map((witness, index) => (
              <div
                key={witness.id}
                className="border border-border rounded-lg p-4 bg-muted/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">
                    Świadek {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWitness(witness.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Imię"
                    name={`witness-${witness.id}-imie`}
                    value={witness.imie}
                    onChange={(_, value) => updateWitness(witness.id, 'imie', value)}
                    placeholder="np. Jan"
                    hasError={hasFieldError('imie', aiNotes, 'swiadkowie')}
                  />
                  <FormField
                    label="Nazwisko"
                    name={`witness-${witness.id}-nazwisko`}
                    value={witness.nazwisko}
                    onChange={(_, value) => updateWitness(witness.id, 'nazwisko', value)}
                    placeholder="np. Kowalski"
                    hasError={hasFieldError('nazwisko', aiNotes, 'swiadkowie')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Ulica"
                    name={`witness-${witness.id}-ulica`}
                    value={witness.ulica}
                    onChange={(_, value) => updateWitness(witness.id, 'ulica', value)}
                    placeholder="np. Marszałkowska"
                  />
                  <FormField
                    label="Nr domu"
                    name={`witness-${witness.id}-nrDomu`}
                    value={witness.nrDomu}
                    onChange={(_, value) => updateWitness(witness.id, 'nrDomu', value)}
                    placeholder="np. 10"
                  />
                  <FormField
                    label="Nr lokalu"
                    name={`witness-${witness.id}-nrLokalu`}
                    value={witness.nrLokalu}
                    onChange={(_, value) => updateWitness(witness.id, 'nrLokalu', value)}
                    placeholder="np. 5"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <FormField
                    label="Kod pocztowy"
                    name={`witness-${witness.id}-kodPocztowy`}
                    value={witness.kodPocztowy}
                    onChange={(_, value) => updateWitness(witness.id, 'kodPocztowy', value)}
                    placeholder="np. 00-001"
                  />
                  <FormField
                    label="Miejscowość"
                    name={`witness-${witness.id}-miejscowosc`}
                    value={witness.miejscowosc}
                    onChange={(_, value) => updateWitness(witness.id, 'miejscowosc', value)}
                    placeholder="np. Warszawa"
                  />
                  <FormField
                    label="Państwo (opcjonalnie)"
                    name={`witness-${witness.id}-panstwo`}
                    value={witness.panstwo || ''}
                    onChange={(_, value) => updateWitness(witness.id, 'panstwo', value)}
                    placeholder="np. Polska"
                  />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};
