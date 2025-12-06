import React from 'react';
import { FormField } from './FormField';
import { AddressFields } from './AddressFields';
import { CorrespondenceAddress, Address } from '@/types/accident-report';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CorrespondenceAddressFieldsProps {
  prefix: string;
  data: CorrespondenceAddress;
  onChange: (data: CorrespondenceAddress) => void;
}

export const CorrespondenceAddressFields: React.FC<CorrespondenceAddressFieldsProps> = ({
  prefix,
  data,
  onChange,
}) => {
  const handleTypeChange = (typ: 'adres' | 'poste-restante' | 'skrytka') => {
    onChange({ ...data, typ });
  };

  const handleAddressChange = (adres: Address) => {
    onChange({ ...data, adres });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Typ adresu korespondencyjnego</Label>
        <RadioGroup
          value={data.typ}
          onValueChange={(value) => handleTypeChange(value as 'adres' | 'poste-restante' | 'skrytka')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="adres" id={`${prefix}-typ-adres`} />
            <Label htmlFor={`${prefix}-typ-adres`} className="font-normal cursor-pointer">
              Adres
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="poste-restante" id={`${prefix}-typ-poste`} />
            <Label htmlFor={`${prefix}-typ-poste`} className="font-normal cursor-pointer">
              Poste restante
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="skrytka" id={`${prefix}-typ-skrytka`} />
            <Label htmlFor={`${prefix}-typ-skrytka`} className="font-normal cursor-pointer">
              Skrytka pocztowa
            </Label>
          </div>
        </RadioGroup>
      </div>

      {data.typ === 'adres' && (
        <AddressFields
          prefix={`${prefix}-addr`}
          address={data.adres || { ulica: '', nrDomu: '', nrLokalu: '', kodPocztowy: '', miejscowosc: '', panstwo: '' }}
          onChange={handleAddressChange}
          showCountry
        />
      )}

      {data.typ === 'poste-restante' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Kod pocztowy placówki"
            name={`${prefix}-kodPlacowki`}
            value={data.kodPocztowyPlacowki || ''}
            onChange={(_, value) => onChange({ ...data, kodPocztowyPlacowki: value })}
            placeholder="np. 00-001"
          />
          <FormField
            label="Nazwa placówki"
            name={`${prefix}-nazwaPlacowki`}
            value={data.nazwaPlacowki || ''}
            onChange={(_, value) => onChange({ ...data, nazwaPlacowki: value })}
            placeholder="np. UP Warszawa 1"
          />
        </div>
      )}

      {data.typ === 'skrytka' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Numer skrytki"
            name={`${prefix}-numerSkrytki`}
            value={data.numerSkrytki || ''}
            onChange={(_, value) => onChange({ ...data, numerSkrytki: value })}
            placeholder="np. 123"
          />
          <FormField
            label="Kod pocztowy placówki"
            name={`${prefix}-kodSkrytki`}
            value={data.kodPocztowySkrytki || ''}
            onChange={(_, value) => onChange({ ...data, kodPocztowySkrytki: value })}
            placeholder="np. 00-001"
          />
          <FormField
            label="Nazwa placówki"
            name={`${prefix}-nazwaPlacowkiSkrytki`}
            value={data.nazwaPlacowkiSkrytki || ''}
            onChange={(_, value) => onChange({ ...data, nazwaPlacowkiSkrytki: value })}
            placeholder="np. UP Warszawa 1"
          />
        </div>
      )}
    </div>
  );
};
