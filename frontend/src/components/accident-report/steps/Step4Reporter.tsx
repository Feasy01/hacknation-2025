import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { AddressFields } from '@/components/forms/AddressFields';
import { CorrespondenceAddressFields } from '@/components/forms/CorrespondenceAddressFields';
import { PersonData, Address, CorrespondenceAddress } from '@/types/accident-report';
import { UserCheck, MapPin, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step4Props {
  zglaszajacyInny: boolean;
  zglaszajacy?: PersonData;
  zglaszajacyAdresZamieszkania?: Address;
  zglaszajacyMieszkaZaGranica?: boolean;
  zglaszajacyOstatniAdresPL?: Address;
  zglaszajacyInnyAdresKorespondencyjny?: boolean;
  zglaszajacyAdresKorespondencyjny?: CorrespondenceAddress;
  onZglaszajacyInnyChange: (value: boolean) => void;
  onZglaszajacyChange: (data: PersonData) => void;
  onZglaszajacyAdresChange: (address: Address) => void;
  onZglaszajacyMieszkaZaGranicaChange: (value: boolean) => void;
  onZglaszajacyOstatniAdresPLChange: (address: Address) => void;
  onZglaszajacyInnyAdresKorespondencyjnyChange: (value: boolean) => void;
  onZglaszajacyAdresKorespondencyjnyChange: (address: CorrespondenceAddress) => void;
}

const DOCUMENT_TYPES = [
  { value: 'dowod', label: 'Dowód osobisty' },
  { value: 'paszport', label: 'Paszport' },
  { value: 'karta-pobytu', label: 'Karta pobytu' },
  { value: 'inny', label: 'Inny dokument' },
];

export const Step4Reporter: React.FC<Step4Props> = ({
  zglaszajacyInny,
  zglaszajacy,
  zglaszajacyAdresZamieszkania,
  zglaszajacyMieszkaZaGranica,
  zglaszajacyOstatniAdresPL,
  zglaszajacyInnyAdresKorespondencyjny,
  zglaszajacyAdresKorespondencyjny,
  onZglaszajacyInnyChange,
  onZglaszajacyChange,
  onZglaszajacyAdresChange,
  onZglaszajacyMieszkaZaGranicaChange,
  onZglaszajacyOstatniAdresPLChange,
  onZglaszajacyInnyAdresKorespondencyjnyChange,
  onZglaszajacyAdresKorespondencyjnyChange,
}) => {
  const handlePersonChange = (name: string, value: string) => {
    onZglaszajacyChange({ ...zglaszajacy!, [name]: value });
  };

  const emptyPerson: PersonData = {
    pesel: '',
    dokumentTyp: '',
    dokumentSeria: '',
    dokumentNumer: '',
    imie: '',
    nazwisko: '',
    dataUrodzenia: '',
    miejsceUrodzenia: '',
    telefon: '',
  };

  const emptyAddress: Address = {
    ulica: '',
    nrDomu: '',
    nrLokalu: '',
    kodPocztowy: '',
    miejscowosc: '',
    panstwo: '',
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="form-section">
        <div className="bg-[hsl(var(--section-header))] text-[hsl(var(--section-header-foreground))] px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 mb-0">
            <UserCheck className="w-4 h-4" />
            Osoba zgłaszająca wypadek
          </h3>
          <div className="flex items-center space-x-3">
            <Switch
              id="zglaszajacyInny"
              checked={zglaszajacyInny}
              onCheckedChange={onZglaszajacyInnyChange}
            />
            <Label htmlFor="zglaszajacyInny" className="cursor-pointer text-sm">
              Zgłaszający inny niż poszkodowany
            </Label>
          </div>
        </div>

        <div className="form-section-content">
          {!zglaszajacyInny && (
            <p className="text-sm text-muted-foreground">
              Zgłoszenie składa poszkodowany. Dane zostały już podane w poprzednich krokach.
            </p>
          )}
        </div>
      </div>

      {zglaszajacyInny && (
        <>
          {/* Dane zgłaszającego */}
          <div className="form-section">
            <h4 className="form-section-title">
              <UserCheck className="w-4 h-4" />
              Dane zgłaszającego
            </h4>
            
            <div className="form-section-content space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="PESEL"
                  name="pesel"
                  value={(zglaszajacy || emptyPerson).pesel}
                  onChange={handlePersonChange}
                  placeholder="np. 90010112345"
                />
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Rodzaj dokumentu tożsamości
                  </Label>
                  <Select
                    value={(zglaszajacy || emptyPerson).dokumentTyp}
                    onValueChange={(value) => handlePersonChange('dokumentTyp', value)}
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
                  value={(zglaszajacy || emptyPerson).dokumentSeria}
                  onChange={handlePersonChange}
                  placeholder="np. ABC"
                />
                <FormField
                  label="Numer dokumentu"
                  name="dokumentNumer"
                  value={(zglaszajacy || emptyPerson).dokumentNumer}
                  onChange={handlePersonChange}
                  placeholder="np. 123456"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Imię"
                  name="imie"
                  value={(zglaszajacy || emptyPerson).imie}
                  onChange={handlePersonChange}
                  placeholder="np. Jan"
                />
                <FormField
                  label="Nazwisko"
                  name="nazwisko"
                  value={(zglaszajacy || emptyPerson).nazwisko}
                  onChange={handlePersonChange}
                  placeholder="np. Kowalski"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Data urodzenia"
                  name="dataUrodzenia"
                  value={(zglaszajacy || emptyPerson).dataUrodzenia}
                  onChange={handlePersonChange}
                  type="date"
                />
                <FormField
                  label="Numer telefonu (opcjonalnie)"
                  name="telefon"
                  value={(zglaszajacy || emptyPerson).telefon}
                  onChange={handlePersonChange}
                  type="tel"
                  placeholder="np. +48 123 456 789"
                />
              </div>
            </div>
          </div>

          {/* Adres zamieszkania zgłaszającego */}
          <div className="form-section">
            <h4 className="form-section-title">
              <MapPin className="w-4 h-4" />
              Adres zamieszkania zgłaszającego
            </h4>
            
            <div className="form-section-content space-y-4">
              <AddressFields
                prefix="zglaszajacyZam"
                address={zglaszajacyAdresZamieszkania || emptyAddress}
                onChange={onZglaszajacyAdresChange}
                showCountry={zglaszajacyMieszkaZaGranica}
              />

              <div className="flex items-center space-x-3 pt-4 border-t border-border">
                <Switch
                  id="zglaszajacyMieszkaZaGranica"
                  checked={zglaszajacyMieszkaZaGranica || false}
                  onCheckedChange={onZglaszajacyMieszkaZaGranicaChange}
                />
                <Label htmlFor="zglaszajacyMieszkaZaGranica" className="cursor-pointer">
                  Zgłaszający mieszka za granicą
                </Label>
              </div>
            </div>
          </div>

          {/* Ostatni adres w Polsce (jeśli zgłaszający mieszka za granicą) */}
          {zglaszajacyMieszkaZaGranica && (
            <div className="form-section">
              <h4 className="form-section-title">
                <MapPin className="w-4 h-4" />
                Ostatni adres zgłaszającego w Polsce
              </h4>
              
              <div className="form-section-content">
                <AddressFields
                  prefix="zglaszajacyOstatniPL"
                  address={zglaszajacyOstatniAdresPL || emptyAddress}
                  onChange={onZglaszajacyOstatniAdresPLChange}
                />
              </div>
            </div>
          )}

          {/* Adres korespondencyjny zgłaszającego */}
          <div className="form-section">
            <div className="bg-[hsl(var(--section-header))] text-[hsl(var(--section-header-foreground))] px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-2 mb-0">
                <Mail className="w-4 h-4" />
                Adres korespondencyjny zgłaszającego
              </h4>
              <div className="flex items-center space-x-3">
                <Switch
                  id="zglaszajacyInnyAdresKorespondencyjny"
                  checked={zglaszajacyInnyAdresKorespondencyjny || false}
                  onCheckedChange={onZglaszajacyInnyAdresKorespondencyjnyChange}
                />
                <Label htmlFor="zglaszajacyInnyAdresKorespondencyjny" className="cursor-pointer text-sm">
                  Inny niż zamieszkania
                </Label>
              </div>
            </div>

            <div className="form-section-content">
              {zglaszajacyInnyAdresKorespondencyjny ? (
                <CorrespondenceAddressFields
                  prefix="zglaszajacyKoresp"
                  data={zglaszajacyAdresKorespondencyjny || { typ: 'adres' }}
                  onChange={onZglaszajacyAdresKorespondencyjnyChange}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Korespondencja będzie wysyłana na adres zamieszkania zgłaszającego.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
