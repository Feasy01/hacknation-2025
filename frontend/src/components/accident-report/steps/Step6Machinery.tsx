import React from 'react';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { AccidentDetails } from '@/types/accident-report';
import { Wrench, Shield, FileCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Step6Props {
  data: AccidentDetails;
  onChange: (data: AccidentDetails) => void;
}

export const Step6Machinery: React.FC<Step6Props> = ({ data, onChange }) => {
  const handleChange = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  const handleBoolChange = (name: keyof AccidentDetails, value: boolean) => {
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Obsługa maszyn */}
      <div className="form-section">
        <h3 className="form-section-title">
          <Wrench className="w-4 h-4" />
          Obsługa maszyn i urządzeń
        </h3>
        
        <div className="form-section-content space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="obslugaMaszyn"
              checked={data.obslugaMaszyn}
              onCheckedChange={(value) => handleBoolChange('obslugaMaszyn', value)}
            />
            <Label htmlFor="obslugaMaszyn" className="cursor-pointer">
              Wypadek powstał podczas obsługi maszyn lub urządzeń
            </Label>
          </div>

          {data.obslugaMaszyn && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/30">
              <div className="flex items-center space-x-3">
                <Switch
                  id="maszynySprawne"
                  checked={data.maszynySprawne || false}
                  onCheckedChange={(value) => handleBoolChange('maszynySprawne', value)}
                />
                <Label htmlFor="maszynySprawne" className="cursor-pointer">
                  Maszyna/urządzenie były sprawne
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="maszynyZgodnieZZasadami"
                  checked={data.maszynyZgodnieZZasadami || false}
                  onCheckedChange={(value) => handleBoolChange('maszynyZgodnieZZasadami', value)}
                />
                <Label htmlFor="maszynyZgodnieZZasadami" className="cursor-pointer">
                  Maszyna/urządzenie były używane zgodnie z zasadami producenta
                </Label>
              </div>

              <FormTextarea
                label="Opis sposobu używania maszyny/urządzenia"
                name="maszynyOpis"
                value={data.maszynyOpis || ''}
                onChange={handleChange}
                placeholder="Opisz jaką maszynę/urządzenie obsługiwałeś/aś, jak ją używałeś/aś, jakie czynności wykonywałeś/aś..."
                rows={4}
              />
            </div>
          )}
        </div>
      </div>

      {/* Atesty i dokumentacja */}
      <div className="form-section">
        <h3 className="form-section-title">
          <FileCheck className="w-4 h-4" />
          Dokumentacja maszyn/urządzeń
        </h3>
        
        <div className="form-section-content space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="atestDeklaracja"
              checked={data.atestDeklaracja}
              onCheckedChange={(value) => handleBoolChange('atestDeklaracja', value)}
            />
            <Label htmlFor="atestDeklaracja" className="cursor-pointer">
              Maszyna/urządzenie posiada atest lub deklarację zgodności
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Switch
              id="ewidencjaSrodkowTrwalych"
              checked={data.ewidencjaSrodkowTrwalych}
              onCheckedChange={(value) => handleBoolChange('ewidencjaSrodkowTrwalych', value)}
            />
            <Label htmlFor="ewidencjaSrodkowTrwalych" className="cursor-pointer">
              Maszyna/urządzenie zostały wpisane do ewidencji środków trwałych
            </Label>
          </div>
        </div>
      </div>

      {/* Informacja pomocnicza */}
      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-info mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Informacja</p>
            <p>
              Jeśli wypadek nie był związany z obsługą maszyn lub urządzeń, możesz pominąć 
              wypełnianie tej sekcji i przejść do następnego kroku.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
