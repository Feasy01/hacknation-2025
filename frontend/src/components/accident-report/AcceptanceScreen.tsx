import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccidentReportFormData, PersonData, Address, AccidentDetails } from '@/types/accident-report';
import { CheckCircle, FileDown, Send, ArrowLeft, Clock, FileText, User, Calendar, Home, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/forms/FormField';
import { applicationsApi } from '@/utils/apiClient';
import { Application } from '@/types/api';
import { Loader2 } from 'lucide-react';

interface AcceptanceScreenProps {
  data: AccidentReportFormData;
  onBack: () => void;
}

export const AcceptanceScreen: React.FC<AcceptanceScreenProps> = ({ data, onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AccidentReportFormData>(data);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const application = await applicationsApi.create(formData);
      setSubmittedApplication(application);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setSubmitError(error.message || 'Wystąpił błąd podczas zapisywania zgłoszenia. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePoszkodowany = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      poszkodowany: { ...prev.poszkodowany, [field]: value },
    }));
  };

  const updateAdresZamieszkania = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      adresZamieszkania: { ...prev.adresZamieszkania, [field]: value },
    }));
  };

  const updateSzczegoly = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      szczegoly: { ...prev.szczegoly, [field]: value },
    }));
  };

  if (submittedApplication) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
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
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Akceptacja i weryfikacja danych
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          Sprawdź i ewentualnie popraw dane przed zapisaniem zgłoszenia
        </p>
      </div>

      {/* Edit Toggle */}
      <div className="flex justify-end mb-4">
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Zakończ edycję
            </>
          ) : (
            <>
              <Edit2 className="w-4 h-4" />
              Edytuj pola
            </>
          )}
        </Button>
      </div>

      {/* Form Data */}
      <div className="space-y-6">
        {/* Poszkodowany */}
        <div className="form-section">
          <h3 className="form-section-title">
            <User className="w-4 h-4" />
            Dane poszkodowanego
          </h3>
          <div className="form-section-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Imię"
                name="imie"
                value={formData.poszkodowany.imie}
                onChange={updatePoszkodowany}
                disabled={!isEditing}
              />
              <FormField
                label="Nazwisko"
                name="nazwisko"
                value={formData.poszkodowany.nazwisko}
                onChange={updatePoszkodowany}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="PESEL"
                name="pesel"
                value={formData.poszkodowany.pesel}
                onChange={updatePoszkodowany}
                disabled={!isEditing}
              />
              <FormField
                label="Telefon"
                name="telefon"
                value={formData.poszkodowany.telefon}
                onChange={updatePoszkodowany}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Adres zamieszkania */}
        <div className="form-section">
          <h3 className="form-section-title">
            <Home className="w-4 h-4" />
            Adres zamieszkania
          </h3>
          <div className="form-section-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Ulica"
                name="ulica"
                value={formData.adresZamieszkania.ulica}
                onChange={updateAdresZamieszkania}
                disabled={!isEditing}
              />
              <FormField
                label="Miejscowość"
                name="miejscowosc"
                value={formData.adresZamieszkania.miejscowosc}
                onChange={updateAdresZamieszkania}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Nr domu"
                name="nrDomu"
                value={formData.adresZamieszkania.nrDomu}
                onChange={updateAdresZamieszkania}
                disabled={!isEditing}
              />
              <FormField
                label="Nr lokalu"
                name="nrLokalu"
                value={formData.adresZamieszkania.nrLokalu}
                onChange={updateAdresZamieszkania}
                disabled={!isEditing}
              />
              <FormField
                label="Kod pocztowy"
                name="kodPocztowy"
                value={formData.adresZamieszkania.kodPocztowy}
                onChange={updateAdresZamieszkania}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Szczegóły wypadku */}
        <div className="form-section">
          <h3 className="form-section-title">
            <FileText className="w-4 h-4" />
            Szczegóły wypadku
          </h3>
          <div className="form-section-content space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Data wypadku"
                name="data"
                value={formData.szczegoly.data}
                onChange={updateSzczegoly}
                type="date"
                disabled={!isEditing}
              />
              <FormField
                label="Miejsce wypadku"
                name="miejsce"
                value={formData.szczegoly.miejsce}
                onChange={updateSzczegoly}
                disabled={!isEditing}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Godzina wypadku"
                name="godzina"
                value={formData.szczegoly.godzina}
                onChange={updateSzczegoly}
                type="time"
                disabled={!isEditing}
              />
              <FormField
                label="Opis urazów"
                name="opisUrazow"
                value={formData.szczegoly.opisUrazow}
                onChange={updateSzczegoly}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{submitError}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-4 pt-4 border-t border-border">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Wróć
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Zapisz zgłoszenie
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

