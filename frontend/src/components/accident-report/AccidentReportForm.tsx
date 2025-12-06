import React, { useState } from 'react';
import { AccidentReportFormData, initialFormData, PersonData, Address, CorrespondenceAddress, Witness, AccidentDetails } from '@/types/accident-report';
import { StepIndicator, FORM_STEPS } from './StepIndicator';
import { Step1VictimData } from './steps/Step1VictimData';
import { Step2Address } from './steps/Step2Address';
import { Step3BusinessAddress } from './steps/Step3BusinessAddress';
import { Step4Reporter } from './steps/Step4Reporter';
import { Step5AccidentDetails } from './steps/Step5AccidentDetails';
import { Step6Machinery } from './steps/Step6Machinery';
import { Step7Witnesses } from './steps/Step7Witnesses';
import { Step8Summary } from './steps/Step8Summary';
import { ConfirmationScreen } from './ConfirmationScreen';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { applicationsApi } from '@/utils/apiClient';
import { Application } from '@/types/api';

export const AccidentReportForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AccidentReportFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goToStep = (step: number) => {
    if (step >= 1 && step <= FORM_STEPS.length) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handleBack = () => goToStep(currentStep - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const application = await applicationsApi.create(formData);
      setSubmittedApplication(application);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error('Error submitting application:', error);
      setSubmitError(error.message || 'Wystąpił błąd podczas zapisywania zgłoszenia. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setIsSubmitted(false);
    setSubmittedApplication(null);
    setSubmitError(null);
  };

  // Update handlers
  const updatePoszkodowany = (data: PersonData) => {
    setFormData((prev) => ({ ...prev, poszkodowany: data }));
  };

  const updateAdresZamieszkania = (address: Address) => {
    setFormData((prev) => ({ ...prev, adresZamieszkania: address }));
  };

  const updateMieszkaZaGranica = (value: boolean) => {
    setFormData((prev) => ({ ...prev, mieszkaZaGranica: value }));
  };

  const updateOstatniAdresPL = (address: Address) => {
    setFormData((prev) => ({ ...prev, ostatniAdresPL: address }));
  };

  const updateInnyAdresKorespondencyjny = (value: boolean) => {
    setFormData((prev) => ({ ...prev, innyAdresKorespondencyjny: value }));
  };

  const updateAdresKorespondencyjny = (address: CorrespondenceAddress) => {
    setFormData((prev) => ({ ...prev, adresKorespondencyjny: address }));
  };

  const updateAdresDzialalnosci = (address: Address & { telefon?: string }) => {
    setFormData((prev) => ({ ...prev, adresDzialalnosci: address }));
  };

  const updateZglaszajacyInny = (value: boolean) => {
    setFormData((prev) => ({ ...prev, zglaszajacyInny: value }));
  };

  const updateZglaszajacy = (data: PersonData) => {
    setFormData((prev) => ({ ...prev, zglaszajacy: data }));
  };

  const updateZglaszajacyAdres = (address: Address) => {
    setFormData((prev) => ({ ...prev, zglaszajacyAdresZamieszkania: address }));
  };

  const updateZglaszajacyMieszkaZaGranica = (value: boolean) => {
    setFormData((prev) => ({ ...prev, zglaszajacyMieszkaZaGranica: value }));
  };

  const updateZglaszajacyOstatniAdresPL = (address: Address) => {
    setFormData((prev) => ({ ...prev, zglaszajacyOstatniAdresPL: address }));
  };

  const updateZglaszajacyInnyAdresKorespondencyjny = (value: boolean) => {
    setFormData((prev) => ({ ...prev, zglaszajacyInnyAdresKorespondencyjny: value }));
  };

  const updateZglaszajacyAdresKorespondencyjny = (address: CorrespondenceAddress) => {
    setFormData((prev) => ({ ...prev, zglaszajacyAdresKorespondencyjny: address }));
  };

  const updateSzczegoly = (data: AccidentDetails) => {
    setFormData((prev) => ({ ...prev, szczegoly: data }));
  };

  const updateSwiadkowie = (witnesses: Witness[]) => {
    setFormData((prev) => ({ ...prev, swiadkowie: witnesses }));
  };

  if (isSubmitted && submittedApplication) {
    return <ConfirmationScreen data={formData} application={submittedApplication} onBack={handleBackToForm} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1VictimData data={formData.poszkodowany} onChange={updatePoszkodowany} />;
      case 2:
        return (
          <Step2Address
            adresZamieszkania={formData.adresZamieszkania}
            mieszkaZaGranica={formData.mieszkaZaGranica}
            ostatniAdresPL={formData.ostatniAdresPL}
            innyAdresKorespondencyjny={formData.innyAdresKorespondencyjny}
            adresKorespondencyjny={formData.adresKorespondencyjny}
            onAddressChange={updateAdresZamieszkania}
            onMieszkaZaGranicaChange={updateMieszkaZaGranica}
            onOstatniAdresPLChange={updateOstatniAdresPL}
            onInnyAdresKorespondencyjnyChange={updateInnyAdresKorespondencyjny}
            onAdresKorespondencyjnyChange={updateAdresKorespondencyjny}
          />
        );
      case 3:
        return <Step3BusinessAddress adresDzialalnosci={formData.adresDzialalnosci} onChange={updateAdresDzialalnosci} />;
      case 4:
        return (
          <Step4Reporter
            zglaszajacyInny={formData.zglaszajacyInny}
            zglaszajacy={formData.zglaszajacy}
            zglaszajacyAdresZamieszkania={formData.zglaszajacyAdresZamieszkania}
            zglaszajacyMieszkaZaGranica={formData.zglaszajacyMieszkaZaGranica}
            zglaszajacyOstatniAdresPL={formData.zglaszajacyOstatniAdresPL}
            zglaszajacyInnyAdresKorespondencyjny={formData.zglaszajacyInnyAdresKorespondencyjny}
            zglaszajacyAdresKorespondencyjny={formData.zglaszajacyAdresKorespondencyjny}
            onZglaszajacyInnyChange={updateZglaszajacyInny}
            onZglaszajacyChange={updateZglaszajacy}
            onZglaszajacyAdresChange={updateZglaszajacyAdres}
            onZglaszajacyMieszkaZaGranicaChange={updateZglaszajacyMieszkaZaGranica}
            onZglaszajacyOstatniAdresPLChange={updateZglaszajacyOstatniAdresPL}
            onZglaszajacyInnyAdresKorespondencyjnyChange={updateZglaszajacyInnyAdresKorespondencyjny}
            onZglaszajacyAdresKorespondencyjnyChange={updateZglaszajacyAdresKorespondencyjny}
          />
        );
      case 5:
        return <Step5AccidentDetails data={formData.szczegoly} onChange={updateSzczegoly} />;
      case 6:
        return <Step6Machinery data={formData.szczegoly} onChange={updateSzczegoly} />;
      case 7:
        return <Step7Witnesses witnesses={formData.swiadkowie} onChange={updateSwiadkowie} />;
      case 8:
        return <Step8Summary data={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} error={submitError} onStepClick={goToStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Step indicator panel */}
      <div className="zus-panel">
        <div className="zus-panel-header">
          <span>Postęp wypełniania formularza</span>
        </div>
        <div className="zus-panel-content">
          <StepIndicator steps={FORM_STEPS} currentStep={currentStep} onStepClick={goToStep} />
        </div>
      </div>

      {/* Current step info */}
      <div className="flex items-center justify-between text-sm">
        <h2 className="font-semibold text-foreground">
          Krok {currentStep}: {FORM_STEPS.find((s) => s.id === currentStep)?.title}
        </h2>
        <span className="text-muted-foreground">
          {currentStep} z {FORM_STEPS.length}
        </span>
      </div>

      {/* Step content */}
      <div className="animate-fade-in">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep < 8 && (
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Wstecz
          </Button>
          <Button onClick={handleNext} className="gap-2 text-sm">
            Dalej
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
