import React from 'react';
import { FormField } from './FormField';
import { Address } from '@/types/accident-report';

interface AddressFieldsProps {
  prefix: string;
  address: Address;
  onChange: (address: Address) => void;
  showCountry?: boolean;
  showPhone?: boolean;
  phoneValue?: string;
  onPhoneChange?: (value: string) => void;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  prefix,
  address,
  onChange,
  showCountry = false,
  showPhone = false,
  phoneValue,
  onPhoneChange,
}) => {
  const handleChange = (name: string, value: string) => {
    const field = name.replace(`${prefix}-`, '');
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormField
        label="Ulica"
        name={`${prefix}-ulica`}
        value={address.ulica}
        onChange={handleChange}
        placeholder="np. Marszałkowska"
      />
      <FormField
        label="Numer domu"
        name={`${prefix}-nrDomu`}
        value={address.nrDomu}
        onChange={handleChange}
        placeholder="np. 10"
        className="md:col-span-1"
      />
      <FormField
        label="Numer lokalu"
        name={`${prefix}-nrLokalu`}
        value={address.nrLokalu}
        onChange={handleChange}
        placeholder="np. 5"
      />
      <FormField
        label="Kod pocztowy"
        name={`${prefix}-kodPocztowy`}
        value={address.kodPocztowy}
        onChange={handleChange}
        placeholder="np. 00-001"
      />
      <FormField
        label="Miejscowość"
        name={`${prefix}-miejscowosc`}
        value={address.miejscowosc}
        onChange={handleChange}
        placeholder="np. Warszawa"
      />
      {showCountry && (
        <FormField
          label="Państwo"
          name={`${prefix}-panstwo`}
          value={address.panstwo || ''}
          onChange={handleChange}
          placeholder="np. Polska"
        />
      )}
      {showPhone && onPhoneChange && (
        <FormField
          label="Telefon (opcjonalnie)"
          name={`${prefix}-telefon`}
          value={phoneValue || ''}
          onChange={(_, value) => onPhoneChange(value)}
          type="tel"
          placeholder="np. +48 123 456 789"
        />
      )}
    </div>
  );
};
