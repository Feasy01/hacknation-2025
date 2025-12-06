import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZusLayout } from '@/components/layout/ZusLayout';
import { AccidentReportForm } from '@/components/accident-report/AccidentReportForm';
import { FileText, Paperclip, Clock, ChevronRight, List, Calendar, User, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applicationsApi } from '@/utils/apiClient';
import { ApplicationListItem } from '@/types/api';

type ViewState = 'dashboard' | 'accident-form';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);

  const handleNavigate = (id: string) => {
    if (id === 'wypadek') {
      setCurrentView('accident-form');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const fetchApplications = async () => {
    setLoadingApplications(true);
    setApplicationsError(null);
    try {
      const response = await applicationsApi.list({ page: 1, page_size: 5 });
      setApplications(response.items);
    } catch (err: any) {
      setApplicationsError(err.message || 'Wystąpił błąd podczas ładowania zgłoszeń');
      console.error('Error fetching applications:', err);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    if (currentView === 'dashboard') {
      fetchApplications();
    }
  }, [currentView]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (currentView === 'accident-form') {
    return (
      <ZusLayout 
        title="Zawiadomienie o wypadku przy pracy" 
        onNavigate={handleNavigate}
        activeItem="wypadek"
      >
        <div className="max-w-4xl">
          <AccidentReportForm />
        </div>
      </ZusLayout>
    );
  }

  return (
    <ZusLayout 
      title="Kreatory wniosków" 
      onNavigate={handleNavigate}
      activeItem="kreatory"
    >
      <div className="max-w-4xl space-y-4">
        {/* Introduction panel */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Kreatory wniosków</span>
          </div>
          <div className="zus-panel-content">
            <div className="flex items-center justify-between mb-4">
              <ul className="list-disc list-inside text-sm text-foreground space-y-1 flex-1">
                <li>Katalog kreatorów wniosków udostępnianych przez ZUS drogą elektroniczną</li>
                <li>Wybierz odpowiedni kreator, aby rozpocząć składanie wniosku</li>
              </ul>
              <Button
                variant="outline"
                onClick={() => navigate('/applications')}
                className="gap-2 ml-4"
              >
                <List className="w-4 h-4" />
                Zobacz wszystkie zgłoszenia
              </Button>
            </div>
          </div>
        </div>

        {/* Available forms */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Dostępne formularze</span>
          </div>
          <div className="zus-panel-content space-y-3">
            {/* Active form - Accident report */}
            <div
              onClick={() => setCurrentView('accident-form')}
              className="flex items-center justify-between p-3 border border-border hover:border-primary hover:bg-muted/30 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Zawiadomienie o wypadku przy pracy
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Formularz dla osób prowadzących pozarolniczą działalność gospodarczą
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>Rozpocznij</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Disabled form - Attachment */}
            <div className="flex items-center justify-between p-3 border border-border opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted flex items-center justify-center">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">
                    Załącznik dokumentów
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Prześlij zeskanowane dokumenty - system automatycznie odczyta dane
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Wkrótce</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help section */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Informacje</span>
          </div>
          <div className="zus-panel-content">
            <div className="text-sm text-foreground space-y-2">
              <p>
                <strong>Zawiadomienie o wypadku przy pracy</strong> - formularz umożliwia zgłoszenie wypadku przy pracy 
                osoby prowadzącej pozarolniczą działalność gospodarczą.
              </p>
              <p>
                System prowadzi użytkownika przez wszystkie wymagane kroki i wskazuje informacje, 
                które należy uzupełnić.
              </p>
              <p className="text-primary hover:underline cursor-pointer inline-flex items-center gap-1">
                Pokaż więcej <ChevronRight className="w-3 h-3" />
              </p>
            </div>
          </div>
        </div>

        {/* Recent applications */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Ostatnio wysłane zgłoszenia</span>
          </div>
          <div className="zus-panel-content">
            {loadingApplications ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : applicationsError ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">{applicationsError}</p>
                <Button variant="outline" size="sm" onClick={fetchApplications}>
                  Spróbuj ponownie
                </Button>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Brak wysłanych zgłoszeń</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/applications/${app.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-primary/10 flex items-center justify-center rounded">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground text-sm">
                              Zgłoszenie #{app.id.substring(0, 8).toUpperCase()}
                            </h3>
                            {app.summary && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {app.summary}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>PESEL: {app.pesel}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formatDate(app.created_at)}</span>
                          </div>
                          {app.status && (
                            <span className="px-2 py-0.5 bg-muted rounded text-xs">
                              {app.status === 'draft' ? 'Szkic' : app.status === 'submitted' ? 'Złożone' : app.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                        className="gap-1.5 ml-4"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Zobacz
                      </Button>
                    </div>
                  </div>
                ))}
                {applications.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/applications')}
                      className="w-full gap-2"
                    >
                      <List className="w-4 h-4" />
                      Zobacz wszystkie zgłoszenia
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ZusLayout>
  );
};

export default Index;
