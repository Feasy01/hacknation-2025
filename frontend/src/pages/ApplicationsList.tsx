import React, { useState, useEffect } from 'react';
import { ZusLayout } from '@/components/layout/ZusLayout';
import { applicationsApi } from '@/utils/apiClient';
import { ApplicationListItem, ApplicationListResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicationsList: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    pesel: '',
    status: '',
  });

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page,
        page_size: pageSize,
      };
      if (filters.pesel) params.pesel = filters.pesel;
      if (filters.status) params.status = filters.status;

      const response: ApplicationListResponse = await applicationsApi.list(params);
      setApplications(response.items);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas ładowania zgłoszeń');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.pesel, filters.status]);

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
      return;
    }

    try {
      await applicationsApi.delete(id);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Wystąpił błąd podczas usuwania zgłoszenia');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <ZusLayout 
      title="Lista zgłoszeń" 
      onNavigate={(id) => {
        if (id === 'wypadek') navigate('/');
        else if (id === 'kreatory') navigate('/');
      }}
      activeItem="kreatory"
    >
      <div className="max-w-6xl space-y-4">
        {/* Filters */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Filtry wyszukiwania</span>
          </div>
          <div className="zus-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  PESEL
                </label>
                <Input
                  type="text"
                  placeholder="Wpisz PESEL..."
                  value={filters.pesel}
                  onChange={(e) => setFilters({ ...filters, pesel: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Status
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wszystkie statusy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Wszystkie statusy</SelectItem>
                    <SelectItem value="draft">Szkic</SelectItem>
                    <SelectItem value="submitted">Złożone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="zus-panel">
          <div className="zus-panel-header">
            <span>Zgłoszenia ({total})</span>
          </div>
          <div className="zus-panel-content">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">{error}</p>
                <Button onClick={fetchApplications} className="mt-4">
                  Spróbuj ponownie
                </Button>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Brak zgłoszeń</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center rounded">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              Zgłoszenie #{app.id.substring(0, 8).toUpperCase()}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {app.summary || 'Brak opisu'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>PESEL: {app.pesel}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(app.created_at)}</span>
                          </div>
                          {app.status && (
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-muted rounded text-xs">
                                {app.status === 'draft' ? 'Szkic' : app.status === 'submitted' ? 'Złożone' : app.status}
                              </span>
                            </div>
                          )}
                          {app.attachment_count > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              <span>{app.attachment_count} załącznik{app.attachment_count !== 1 ? 'i' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/applications/${app.id}`)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Zobacz
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(app.id)}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  Strona {page} z {totalPages} ({total} zgłoszeń)
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ZusLayout>
  );
};

export default ApplicationsList;

