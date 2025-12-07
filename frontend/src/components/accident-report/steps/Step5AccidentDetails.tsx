import React from 'react';
import { FormField } from '@/components/forms/FormField';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { AccidentDetails, AINote } from '@/types/accident-report';
import { AlertTriangle, Clock, Hospital, FileSearch } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { hasFieldError } from '@/utils/fieldMapping';

interface Step5Props {
  data: AccidentDetails;
  onChange: (data: AccidentDetails) => void;
  aiNotes?: AINote[];
}

export const Step5AccidentDetails: React.FC<Step5Props> = ({ data, onChange, aiNotes = [] }) => {
  const handleChange = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  const handleBoolChange = (name: keyof AccidentDetails, value: boolean) => {
    onChange({ ...data, [name]: value });
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Podstawowe informacje o wypadku */}
      <div className="form-section">
        <h3 className="form-section-title">
          <AlertTriangle className="w-4 h-4" />
          Informacje o wypadku
        </h3>
        
        <div className="form-section-content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              label="Data wypadku"
              name="data"
              value={data.data}
              onChange={handleChange}
              type="date"
              hasError={hasFieldError('data', aiNotes, 'szczegoly')}
            />
            <FormField
              label="Godzina wypadku"
              name="godzina"
              value={data.godzina}
              onChange={handleChange}
              type="time"
              hasError={hasFieldError('godzina', aiNotes, 'szczegoly')}
            />
            <FormField
              label="Miejsce wypadku"
              name="miejsce"
              value={data.miejsce}
              onChange={handleChange}
              placeholder="np. plac budowy ul. Nowa 5"
              className="lg:col-span-1 md:col-span-2"
              hasError={hasFieldError('miejsce', aiNotes, 'szczegoly')}
            />
          </div>
        </div>
      </div>

      {/* Godziny pracy */}
      <div className="form-section">
        <h3 className="form-section-title">
          <Clock className="w-4 h-4" />
          Planowane godziny pracy w dniu wypadku
        </h3>
        
        <div className="form-section-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Planowana godzina rozpoczęcia pracy"
              name="godzinaRozpoczeciaPracy"
              value={data.godzinaRozpoczeciaPracy}
              onChange={handleChange}
              type="time"
              hasError={hasFieldError('godzinaRozpoczeciaPracy', aiNotes, 'szczegoly')}
            />
            <FormField
              label="Planowana godzina zakończenia pracy"
              name="godzinaZakonczeniaPracy"
              value={data.godzinaZakonczeniaPracy}
              onChange={handleChange}
              type="time"
              hasError={hasFieldError('godzinaZakonczeniaPracy', aiNotes, 'szczegoly')}
            />
          </div>
        </div>
      </div>

      {/* Opis urazów i okoliczności */}
      <div className="form-section">
        <h3 className="form-section-title">
          <AlertTriangle className="w-4 h-4" />
          Opis wypadku
        </h3>
        
        <div className="form-section-content space-y-4">
          <FormTextarea
            label="Rodzaj urazów doznanych wskutek wypadku"
            name="opisUrazow"
            value={data.opisUrazow}
            onChange={handleChange}
            placeholder="Opisz jakie urazy zostały doznanej, np. złamanie ręki, stłuczenie głowy..."
            rows={3}
            hasError={hasFieldError('opisUrazow', aiNotes, 'szczegoly')}
          />
          
          <FormTextarea
            label="Szczegółowy opis okoliczności i przyczyn wypadku"
            name="opisOkolicznosci"
            value={data.opisOkolicznosci}
            onChange={handleChange}
            placeholder="Opisz dokładnie jak doszło do wypadku, jakie czynności wykonywałeś/aś, co spowodowało wypadek, jak wyglądało miejsce zdarzenia..."
            rows={6}
            hasError={hasFieldError('opisOkolicznosci', aiNotes, 'szczegoly')}
          />
        </div>
      </div>

      {/* Pierwsza pomoc */}
      <div className="form-section">
        <h3 className="form-section-title">
          <Hospital className="w-4 h-4" />
          Pierwsza pomoc medyczna
        </h3>
        
        <div className="form-section-content space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="pierwszaPomoc"
              checked={data.pierwszaPomoc}
              onCheckedChange={(value) => handleBoolChange('pierwszaPomoc', value)}
            />
            <Label htmlFor="pierwszaPomoc" className="cursor-pointer">
              Udzielono pierwszej pomocy medycznej
            </Label>
          </div>

          {data.pierwszaPomoc && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-success/30">
              <FormField
                label="Nazwa placówki służby zdrowia"
                name="pierwszaPomocNazwa"
                value={data.pierwszaPomocNazwa || ''}
                onChange={handleChange}
                placeholder="np. Szpital Miejski"
              />
              <FormField
                label="Adres placówki"
                name="pierwszaPomocAdres"
                value={data.pierwszaPomocAdres || ''}
                onChange={handleChange}
                placeholder="np. ul. Szpitalna 1, Warszawa"
              />
            </div>
          )}
        </div>
      </div>

      {/* Postępowanie */}
      <div className="form-section">
        <h3 className="form-section-title">
          <FileSearch className="w-4 h-4" />
          Postępowanie wyjaśniające
        </h3>
        
        <div className="form-section-content space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              id="postepowanieProwadzone"
              checked={data.postepowanieProwadzone}
              onCheckedChange={(value) => handleBoolChange('postepowanieProwadzone', value)}
            />
            <Label htmlFor="postepowanieProwadzone" className="cursor-pointer">
              W sprawie wypadku prowadzono postępowanie (np. policja, prokuratura)
            </Label>
          </div>

          {data.postepowanieProwadzone && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
              <FormField
                label="Nazwa organu prowadzącego postępowanie"
                name="postepowanieOrgan"
                value={data.postepowanieOrgan || ''}
                onChange={handleChange}
                placeholder="np. Komenda Policji"
              />
              <FormField
                label="Adres organu"
                name="postepowanieAdres"
                value={data.postepowanieAdres || ''}
                onChange={handleChange}
                placeholder="np. ul. Policjantów 10, Warszawa"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
