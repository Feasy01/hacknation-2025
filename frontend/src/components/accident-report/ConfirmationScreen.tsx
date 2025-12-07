import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccidentReportFormData } from '@/types/accident-report';
import { Application } from '@/types/api';
import { CheckCircle, FileDown, Send, ArrowLeft, Clock, FileText, User, Calendar, Home, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fillPdfForm, downloadPdf } from '@/utils/pdfFiller';

interface ConfirmationScreenProps {
  data: AccidentReportFormData;
  application?: Application | null;
  onBack: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ data, application, onBack }) => {
  const navigate = useNavigate();
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  const referenceNumber = application?.id 
    ? `ZG/${new Date(application.created_at).getFullYear()}/${application.id.substring(0, 8).toUpperCase()}`
    : `ZG/${new Date().getFullYear()}/${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const submissionDate = application?.created_at
    ? new Date(application.created_at).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPdfError(null);
    
    try {
      // Path to the PDF template in public folder
      const pdfTemplatePath = '/EWYP_wypelnij_i_wydrukuj.pdf';
      
      // Fill the PDF with form data
      const filledPdf = await fillPdfForm(pdfTemplatePath, data);
      
      // Generate filename with reference number
      const filename = `zawiadomienie_wypadek_${referenceNumber.replace(/\//g, '_')}.pdf`;
      
      // Download the PDF
      downloadPdf(filledPdf, filename);
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      setPdfError(error.message || 'Nie udało się pobrać pliku PDF. Spróbuj ponownie.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle className="w-12 h-12 text-success" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Zgłoszenie zostało zapisane
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          Twoje zgłoszenie wypadku przy pracy zostało pomyślnie przygotowane.
        </p>
      </div>

      {/* Informacje o zgłoszeniu */}
      <div className="form-section">
        <h3 className="form-section-title">
          <FileText className="w-4 h-4" />
          Informacje o zgłoszeniu
        </h3>
        <div className="form-section-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Numer referencyjny</p>
                    <p className="font-mono font-semibold text-foreground text-sm break-all">
                      {referenceNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Data utworzenia</p>
                    <p className="font-medium text-foreground text-sm">
                      {submissionDate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Poszkodowany</p>
                    <p className="font-medium text-foreground text-sm">
                      {data.poszkodowany.imie} {data.poszkodowany.nazwisko}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Data wypadku</p>
                    <p className="font-medium text-foreground text-sm">
                      {data.szczegoly.data || 'Nie podano'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Następne kroki */}
      <div className="form-section">
        <h3 className="form-section-title">
          <Clock className="w-4 h-4" />
          Następne kroki
        </h3>
        <div className="form-section-content">
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                1
              </span>
              <span className="pt-0.5">Pobierz i wydrukuj wypełnione zawiadomienie o wypadku</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                2
              </span>
              <span className="pt-0.5">Zapoznaj się z treścią dokumentu i sprawdź poprawność danych</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                3
              </span>
              <span className="pt-0.5">Podpisz dokument (w przypadku formy papierowej)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs">
                4
              </span>
              <span className="pt-0.5">Prześlij zgłoszenie za pośrednictwem PUE/eZUS lub złóż w placówce ZUS</span>
            </li>
          </ol>
        </div>
      </div>

      {/* Przyciski akcji */}
      <div className="form-section">
        <h3 className="form-section-title">
          <FileDown className="w-4 h-4" />
          Pobierz lub wyślij zgłoszenie
        </h3>
        <div className="form-section-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-auto py-6 flex-col gap-3 hover:bg-muted/50"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {isDownloadingPdf ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <FileDown className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">
                      {isDownloadingPdf ? 'Przygotowywanie PDF...' : 'Pobierz/drukuj PDF'}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {isDownloadingPdf ? 'Proszę czekać' : 'Pobierz wypełniony formularz'}
                    </span>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-auto py-6 flex-col gap-3 hover:bg-muted/50"
                  disabled
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Send className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground">Wyślij elektronicznie</span>
                    <span className="text-xs text-muted-foreground font-normal">Wkrótce dostępne</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {pdfError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-xs text-destructive text-center">
                {pdfError}
              </p>
            </div>
          )}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground text-center">
              Funkcja wysyłki elektronicznej będzie dostępna wkrótce.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wróć do formularza
        </Button>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="w-4 h-4" />
          Przejdź do Kreatorów wniosków
        </Button>
      </div>
    </div>
  );
};
