import React from 'react';
import { AddressFields } from '@/components/forms/AddressFields';
import { CorrespondenceAddressFields } from '@/components/forms/CorrespondenceAddressFields';
import { Address, CorrespondenceAddress } from '@/types/accident-report';
import { MapPin, Mail } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Step2Props {
  adresZamieszkania: Address;
  mieszkaZaGranica: boolean;
  ostatniAdresPL?: Address;
  innyAdresKorespondencyjny: boolean;
  adresKorespondencyjny?: CorrespondenceAddress;
  onAddressChange: (address: Address) => void;
  onMieszkaZaGranicaChange: (value: boolean) => void;
  onOstatniAdresPLChange: (address: Address) => void;
  onInnyAdresKorespondencyjnyChange: (value: boolean) => void;
  onAdresKorespondencyjnyChange: (address: CorrespondenceAddress) => void;
}

export const Step2Address: React.FC<Step2Props> = ({
  adresZamieszkania,
  mieszkaZaGranica,
  ostatniAdresPL,
  innyAdresKorespondencyjny,
  adresKorespondencyjny,
  onAddressChange,
  onMieszkaZaGranicaChange,
  onOstatniAdresPLChange,
  onInnyAdresKorespondencyjnyChange,
  onAdresKorespondencyjnyChange,
}) => {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Adres zamieszkania */}
      <div className="form-section">
        <h3 className="form-section-title">
          <MapPin className="w-4 h-4" />
          Adres zamieszkania
        </h3>
        
        <div className="form-section-content space-y-4">
          <AddressFields
            prefix="zamieszkania"
            address={adresZamieszkania}
            onChange={onAddressChange}
            showCountry={mieszkaZaGranica}
          />

          <div className="flex items-center space-x-3 pt-4 border-t border-border">
            <Switch
              id="mieszkaZaGranica"
              checked={mieszkaZaGranica}
              onCheckedChange={onMieszkaZaGranicaChange}
            />
            <Label htmlFor="mieszkaZaGranica" className="cursor-pointer">
              Mieszkam obecnie za granicą
            </Label>
          </div>
        </div>
      </div>

      {/* Ostatni adres w Polsce (jeśli mieszka za granicą) */}
      {mieszkaZaGranica && (
        <div className="form-section">
          <h3 className="form-section-title">
            <MapPin className="w-4 h-4" />
            Ostatni adres zamieszkania w Polsce
          </h3>
          <div className="form-section-content space-y-4">
            <p className="text-sm text-muted-foreground">
              Podaj ostatni adres, pod którym mieszkałeś/aś w Polsce
            </p>
            
            <AddressFields
              prefix="ostatniPL"
              address={ostatniAdresPL || { ulica: '', nrDomu: '', nrLokalu: '', kodPocztowy: '', miejscowosc: '' }}
              onChange={onOstatniAdresPLChange}
            />
          </div>
        </div>
      )}

      {/* Adres korespondencyjny */}
      <div className="form-section">
        <div className="bg-[hsl(var(--section-header))] text-[hsl(var(--section-header-foreground))] px-4 py-2.5 text-sm font-semibold flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 mb-0">
            <Mail className="w-4 h-4" />
            Adres korespondencyjny
          </h3>
          <div className="flex items-center space-x-3">
            <Switch
              id="innyAdresKorespondencyjny"
              checked={innyAdresKorespondencyjny}
              onCheckedChange={onInnyAdresKorespondencyjnyChange}
            />
            <Label htmlFor="innyAdresKorespondencyjny" className="cursor-pointer text-sm">
              Inny niż zamieszkania
            </Label>
          </div>
        </div>

        <div className="form-section-content">
          {innyAdresKorespondencyjny ? (
            <CorrespondenceAddressFields
              prefix="koresp"
              data={adresKorespondencyjny || { typ: 'adres' }}
              onChange={onAdresKorespondencyjnyChange}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Korespondencja będzie wysyłana na adres zamieszkania.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
