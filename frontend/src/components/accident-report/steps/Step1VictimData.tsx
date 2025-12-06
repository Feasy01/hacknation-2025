import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { PersonData } from '@/types/accident-report';
import { User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step1Props {
  data: PersonData;
  onChange: (data: PersonData) => void;
}

const DOCUMENT_TYPES = [
  { value: 'dowod', label: 'Dowód osobisty' },
  { value: 'paszport', label: 'Paszport' },
  { value: 'karta-pobytu', label: 'Karta pobytu' },
  { value: 'inny', label: 'Inny dokument' },
];

export const Step1VictimData: React.FC<Step1Props> = ({ data, onChange }) => {
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
          />
          <FormField
            label="Numer dokumentu"
            name="dokumentNumer"
            value={data.dokumentNumer}
            onChange={handleChange}
            placeholder="np. 123456"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Imię"
            name="imie"
            value={data.imie}
            onChange={handleChange}
            placeholder="np. Jan"
          />
          <FormField
            label="Nazwisko"
            name="nazwisko"
            value={data.nazwisko}
            onChange={handleChange}
            placeholder="np. Kowalski"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Data urodzenia"
            name="dataUrodzenia"
            value={data.dataUrodzenia}
            onChange={handleChange}
            type="date"
          />
          <FormField
            label="Miejsce urodzenia"
            name="miejsceUrodzenia"
            value={data.miejsceUrodzenia}
            onChange={handleChange}
            placeholder="np. Warszawa"
          />
          <FormField
            label="Numer telefonu"
            name="telefon"
            value={data.telefon}
            onChange={handleChange}
            type="tel"
            placeholder="np. +48 123 456 789"
          />
        </div>
      </div>
    </div>
  );
};
