import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZusLayout } from '@/components/layout/ZusLayout';
import { applicationsApi, attachmentsApi } from '@/utils/apiClient';
import { Application, AttachmentMetadata } from '@/types/api';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Trash2,
  Loader2,
  Download
} from 'lucide-react';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [attachments, setAttachments] = useState<AttachmentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const app = await applicationsApi.get(id);
        setApplication(app);
        
        if (app.attachment_ids && app.attachment_ids.length > 0) {
          const atts = await attachmentsApi.list(id);
          setAttachments(atts.attachments);
        }
      } catch (err: any) {
        setError(err.message || 'Wystąpił błąd podczas ładowania zgłoszenia');
        console.error('Error fetching application:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm('Czy na pewno chcesz usunąć to zgłoszenie? Ta operacja jest nieodwracalna.')) {
      return;
    }

    try {
      await applicationsApi.delete(id);
      navigate('/applications');
    } catch (err: any) {
      alert(err.message || 'Wystąpił błąd podczas usuwania zgłoszenia');
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, title: string) => {
    if (!id) return;
    
    try {
      const url = await attachmentsApi.get(id, attachmentId);
      const link = document.createElement('a');
      link.href = url;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Wystąpił błąd podczas pobierania załącznika');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ZusLayout title="Zgłoszenie" onNavigate={() => navigate('/')} activeItem="kreatory">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ZusLayout>
    );
  }

  if (error || !application) {
    return (
      <ZusLayout title="Zgłoszenie" onNavigate={() => navigate('/')} activeItem="kreatory">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || 'Zgłoszenie nie zostało znalezione'}</p>
          <Button onClick={() => navigate('/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wróć do listy
          </Button>
        </div>
      </ZusLayout>
    );
  }

  const { form_data } = application;

  return (
    <ZusLayout title="Szczegóły zgłoszenia" onNavigate={() => navigate('/')} activeItem="kreatory">
      <div className="max-w-4xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/applications')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Wróć do listy
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Trash2 className="w-4 h-4" />
            Usuń zgłoszenie
          </Button>
        </div>

        {/* Application Info */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Informacje o zgłoszeniu</span>
          </div>
          <div className="zus-panel-content">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">ID:</span>
                <span className="ml-2 font-mono">{application.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground">PESEL:</span>
                <span className="ml-2">{application.pesel}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Utworzono:</span>
                <span className="ml-2">{formatDate(application.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Zaktualizowano:</span>
                <span className="ml-2">{formatDate(application.updated_at)}</span>
              </div>
              {application.status && (
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                    {application.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Data */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Dane zgłoszenia</span>
          </div>
          <div className="zus-panel-content space-y-6">
            {/* Poszkodowany */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Poszkodowany</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Imię i nazwisko:</span>
                  <span className="ml-2">{form_data.poszkodowany.imie} {form_data.poszkodowany.nazwisko}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">PESEL:</span>
                  <span className="ml-2">{form_data.poszkodowany.pesel}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Data urodzenia:</span>
                  <span className="ml-2">{form_data.poszkodowany.dataUrodzenia}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="ml-2">{form_data.poszkodowany.telefon}</span>
                </div>
              </div>
            </div>

            {/* Szczegóły wypadku */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Szczegóły wypadku</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <span className="ml-2">{form_data.szczegoly.data}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Godzina:</span>
                  <span className="ml-2">{form_data.szczegoly.godzina}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Miejsce:</span>
                  <span className="ml-2">{form_data.szczegoly.miejsce}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Opis urazów:</span>
                  <p className="ml-2 mt-1">{form_data.szczegoly.opisUrazow}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Opis okoliczności:</span>
                  <p className="ml-2 mt-1">{form_data.szczegoly.opisOkolicznosci}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="zus-panel">
            <div className="zus-panel-header">
              <span>Załączniki ({attachments.length})</span>
            </div>
            <div className="zus-panel-content">
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{att.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {att.mime_type} • {(att.size_bytes / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(att.id, att.title)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Pobierz
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ZusLayout>
  );
};

export default ApplicationDetail;

