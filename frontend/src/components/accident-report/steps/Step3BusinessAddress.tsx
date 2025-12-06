import React from 'react';
import { AddressFields } from '@/components/forms/AddressFields';
import { Address } from '@/types/accident-report';
import { Building2 } from 'lucide-react';

interface Step3Props {
  adresDzialalnosci: Address & { telefon?: string };
  onChange: (address: Address & { telefon?: string }) => void;
}

export const Step3BusinessAddress: React.FC<Step3Props> = ({
  adresDzialalnosci,
  onChange,
}) => {
  return (
    <div className="form-section animate-slide-up">
      <h3 className="form-section-title">
        <Building2 className="w-4 h-4" />
        Adres prowadzenia działalności gospodarczej
      </h3>
      <div className="form-section-content space-y-4">
        <p className="text-sm text-muted-foreground">
          Podaj adres, pod którym prowadzisz działalność gospodarczą
        </p>
        
        <AddressFields
          prefix="dzialalnosc"
          address={adresDzialalnosci}
          onChange={(address) => onChange({ ...address, telefon: adresDzialalnosci.telefon })}
          showPhone
          phoneValue={adresDzialalnosci.telefon}
          onPhoneChange={(value) => onChange({ ...adresDzialalnosci, telefon: value })}
        />
      </div>
    </div>
  );
};
