import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { PersonData, AINote } from '@/types/accident-report';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { hasFieldError } from '@/utils/fieldMapping';

interface Step1Props {
  data: PersonData;
  onChange: (data: PersonData) => void;
  aiNotes?: AINote[];
}

const DOCUMENT_TYPES = [
  { value: 'dowod', label: 'Dowód osobisty' },
  { value: 'paszport', label: 'Paszport' },
  { value: 'karta-pobytu', label: 'Karta pobytu' },
  { value: 'inny', label: 'Inny dokument' },
];

export const Step1VictimData: React.FC<Step1Props> = ({ data, onChange, aiNotes = [] }) => {
  const handleChange = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="form-section animate-fade-in">
      <h3 className="form-section-title">
        <User className="w-4 h-4" />
        Dane poszkodowanego
      </h3>
      
      <div className="form-section-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="PESEL"
            name="pesel"
            value={data.pesel}
            onChange={handleChange}
            placeholder="np. 90010112345"
            hasError={hasFieldError('pesel', aiNotes, 'poszkodowany')}
          />
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Rodzaj dokumentu tożsamości
            </Label>
            <Select
              value={data.dokumentTyp}
              onValueChange={(value) => handleChange('dokumentTyp', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz rodzaj dokumentu" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Seria dokumentu"
            name="dokumentSeria"
            value={data.dokumentSeria}
            onChange={handleChange}
            placeholder="np. ABC"
            hasError={hasFieldError('dokumentSeria', aiNotes, 'poszkodowany')}
          />
          <FormField
            label="Numer dokumentu"
            name="dokumentNumer"
            value={data.dokumentNumer}
            onChange={handleChange}
            placeholder="np. 123456"
            hasError={hasFieldError('dokumentNumer', aiNotes, 'poszkodowany')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Imię"
            name="imie"
            value={data.imie}
            onChange={handleChange}
            placeholder="np. Jan"
            hasError={hasFieldError('imie', aiNotes, 'poszkodowany')}
          />
          <FormField
            label="Nazwisko"
            name="nazwisko"
            value={data.nazwisko}
            onChange={handleChange}
            placeholder="np. Kowalski"
            hasError={hasFieldError('nazwisko', aiNotes, 'poszkodowany')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Data urodzenia"
            name="dataUrodzenia"
            value={data.dataUrodzenia}
            onChange={handleChange}
            type="date"
            hasError={hasFieldError('dataUrodzenia', aiNotes, 'poszkodowany')}
          />
          <FormField
            label="Miejsce urodzenia"
            name="miejsceUrodzenia"
            value={data.miejsceUrodzenia}
            onChange={handleChange}
            placeholder="np. Warszawa"
            hasError={hasFieldError('miejsceUrodzenia', aiNotes, 'poszkodowany')}
          />
          <FormField
            label="Numer telefonu"
            name="telefon"
            value={data.telefon}
            onChange={handleChange}
            type="tel"
            placeholder="np. +48 123 456 789"
            hasError={hasFieldError('telefon', aiNotes, 'poszkodowany')}
          />
        </div>
      </div>
    </div>
  );
};
