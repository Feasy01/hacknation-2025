import React from 'react';
import { AccidentReportFormData } from '@/types/accident-report';
import { 
  User, MapPin, Building2, UserCheck, AlertTriangle, 
  Wrench, Users, CheckCircle, FileText, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step8Props {
  data: AccidentReportFormData;
  onSubmit: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  onStepClick?: (step: number) => void;
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const SummarySection: React.FC<SectionProps> = ({ icon, title, children, onClick }) => (
  <div 
    className={onClick ? "border border-border rounded-lg p-4 bg-card cursor-pointer hover:bg-accent transition-colors" : "border border-border rounded-lg p-4 bg-card"}
    onClick={onClick}
  >
    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h4>
    <div className="text-sm text-muted-foreground space-y-1">
      {children}
    </div>
  </div>
);

const DataRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex">
      <span className="text-foreground font-medium w-40 shrink-0">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

export const Step8Summary: React.FC<Step8Props> = ({ data, onSubmit, isSubmitting = false, error = null, onStepClick }) => {
  const formatAddress = (addr: { ulica?: string; nrDomu?: string; nrLokalu?: string; kodPocztowy?: string; miejscowosc?: string; panstwo?: string }) => {
    const parts = [
      addr.ulica,
      addr.nrDomu && `${addr.nrDomu}${addr.nrLokalu ? `/${addr.nrLokalu}` : ''}`,
      addr.kodPocztowy && addr.miejscowosc && `${addr.kodPocztowy} ${addr.miejscowosc}`,
      addr.panstwo,
    ].filter(Boolean);
    return parts.join(', ') || 'Nie podano';
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="form-section">
        <h3 className="form-section-title">
          <CheckCircle className="w-4 h-4" />
          Podsumowanie zgłoszenia
        </h3>
        <div className="form-section-content">
          <p className="text-sm text-muted-foreground mb-6">
            Sprawdź poprawność wprowadzonych danych przed wysłaniem zgłoszenia.
          </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dane poszkodowanego */}
          <SummarySection 
            icon={<User className="w-4 h-4 text-primary" />} 
            title="Dane poszkodowanego"
            onClick={() => onStepClick?.(1)}
          >
            <DataRow label="Imię i nazwisko" value={`${data.poszkodowany.imie} ${data.poszkodowany.nazwisko}`} />
            <DataRow label="PESEL" value={data.poszkodowany.pesel} />
            <DataRow label="Data urodzenia" value={data.poszkodowany.dataUrodzenia} />
            <DataRow label="Telefon" value={data.poszkodowany.telefon} />
          </SummarySection>

          {/* Adres zamieszkania */}
          <SummarySection 
            icon={<MapPin className="w-4 h-4 text-primary" />} 
            title="Adres zamieszkania"
            onClick={() => onStepClick?.(2)}
          >
            <p>{formatAddress(data.adresZamieszkania)}</p>
            {data.mieszkaZaGranica && data.ostatniAdresPL && (
              <>
                <p className="mt-2 text-xs text-muted-foreground">Ostatni adres w PL:</p>
                <p>{formatAddress(data.ostatniAdresPL)}</p>
              </>
            )}
          </SummarySection>

          {/* Adres działalności */}
          <SummarySection 
            icon={<Building2 className="w-4 h-4 text-primary" />} 
            title="Adres działalności"
            onClick={() => onStepClick?.(3)}
          >
            <p>{formatAddress(data.adresDzialalnosci)}</p>
            {data.adresDzialalnosci.telefon && (
              <DataRow label="Telefon" value={data.adresDzialalnosci.telefon} />
            )}
          </SummarySection>

          {/* Zgłaszający */}
          <SummarySection 
            icon={<UserCheck className="w-4 h-4 text-primary" />} 
            title="Zgłaszający"
            onClick={() => onStepClick?.(4)}
          >
            {data.zglaszajacyInny && data.zglaszajacy ? (
              <>
                <DataRow label="Imię i nazwisko" value={`${data.zglaszajacy.imie} ${data.zglaszajacy.nazwisko}`} />
                <DataRow label="PESEL" value={data.zglaszajacy.pesel} />
              </>
            ) : (
              <p>Poszkodowany (dane jak powyżej)</p>
            )}
          </SummarySection>

          {/* Szczegóły wypadku */}
          <SummarySection 
            icon={<AlertTriangle className="w-4 h-4 text-warning" />} 
            title="Szczegóły wypadku"
            onClick={() => onStepClick?.(5)}
          >
            <DataRow label="Data" value={data.szczegoly.data} />
            <DataRow label="Godzina" value={data.szczegoly.godzina} />
            <DataRow label="Miejsce" value={data.szczegoly.miejsce} />
            <DataRow label="Urazy" value={data.szczegoly.opisUrazow} />
            {data.szczegoly.pierwszaPomoc && (
              <DataRow label="Pierwsza pomoc" value={data.szczegoly.pierwszaPomocNazwa} />
            )}
          </SummarySection>

          {/* Maszyny */}
          <SummarySection 
            icon={<Wrench className="w-4 h-4 text-primary" />} 
            title="Maszyny i urządzenia"
            onClick={() => onStepClick?.(6)}
          >
            {data.szczegoly.obslugaMaszyn ? (
              <>
                <DataRow label="Sprawne" value={data.szczegoly.maszynySprawne ? 'Tak' : 'Nie'} />
                <DataRow label="Zgodnie z zasadami" value={data.szczegoly.maszynyZgodnieZZasadami ? 'Tak' : 'Nie'} />
                <DataRow label="Atest/deklaracja" value={data.szczegoly.atestDeklaracja ? 'Tak' : 'Nie'} />
              </>
            ) : (
              <p>Wypadek nie był związany z obsługą maszyn</p>
            )}
          </SummarySection>

          {/* Świadkowie */}
          <SummarySection 
            icon={<Users className="w-4 h-4 text-primary" />} 
            title="Świadkowie"
            onClick={() => onStepClick?.(7)}
          >
            {data.swiadkowie.length > 0 ? (
              data.swiadkowie.map((s, i) => (
                <p key={s.id}>
                  {i + 1}. {s.imie} {s.nazwisko}
                  {s.miejscowosc && ` (${s.miejscowosc})`}
                </p>
              ))
            ) : (
              <p>Brak świadków</p>
            )}
          </SummarySection>
        </div>
        </div>
      </div>

      {/* Akcje */}
      <div className="form-section">
        <h4 className="form-section-title">
          <Send className="w-4 h-4" />
          Po wysłaniu zgłoszenia
        </h4>
        <div className="form-section-content">
          <p className="text-sm text-muted-foreground mb-6">
            Po zatwierdzeniu zgłoszenia będziesz mógł pobrać dokument w formacie PDF 
            lub wysłać go elektronicznie do ZUS.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              size="lg"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Zatwierdź zgłoszenie
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
