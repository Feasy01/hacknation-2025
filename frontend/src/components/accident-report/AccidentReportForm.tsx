import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccidentReportFormData, initialFormData, PersonData, Address, CorrespondenceAddress, Witness, AccidentDetails, AINote } from '@/types/accident-report';
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
import { ModeSelector } from './ModeSelector';
import { ChatForm } from './ChatForm';
import { AcceptanceScreen } from './AcceptanceScreen';
import { AnalysisProgressDialog } from './AnalysisProgressDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { applicationsApi, elevenLabsApi } from '@/utils/apiClient';
import { Application } from '@/types/api';
import { mapBackendFormToFrontend, mapFrontendFormToBackend } from '@/utils/formMapping';

type FormMode = 'select' | 'wizard' | 'chat';

interface AccidentReportFormProps {
  conversationId?: string;
}

export const AccidentReportForm: React.FC<AccidentReportFormProps> = ({ conversationId }) => {
  const [mode, setMode] = useState<FormMode>('wizard');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AccidentReportFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<AINote[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const syncTimeoutRef = useRef<number | null>(null);
  const isSseUpdateRef = useRef(false);

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

  const handleChatComplete = (chatFormData: AccidentReportFormData) => {
    setFormData(chatFormData);
    setMode('acceptance');
  };

  const handleBackToModeSelect = () => {
    setMode('select');
    setFormData(initialFormData);
    setIsSubmitted(false);
    setSubmittedApplication(null);
    setSubmitError(null);
  };

  // Live updates from ElevenLabs webhook via SSE
  useEffect(() => {
    if (!conversationId) return;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const streamUrl = `${apiBaseUrl}/api/elevenlabs/stream/${conversationId}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'form_update' && payload.form_data) {
          const mapped = mapBackendFormToFrontend(payload.form_data);
          isSseUpdateRef.current = true;
          setFormData(mapped);
          
          // Update ai_notes from SSE - always update to handle clearing
          // If ai_notes is not present or is empty array, clear the notes
          setAiNotes(payload.ai_notes || []);
        }
      } catch (error) {
        console.error('Error parsing ElevenLabs SSE payload', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('ElevenLabs SSE connection error', error);
    };

    return () => eventSource.close();
  }, [conversationId]);

  const syncElevenLabsForm = useCallback(
    async (data: AccidentReportFormData, triggerAnalysis = false) => {
      if (!conversationId) return;

      try {
        const backendPayload = mapFrontendFormToBackend(data);
        await elevenLabsApi.syncConversation(conversationId, backendPayload, triggerAnalysis);
      } catch (error) {
        console.error('Error syncing manual form data to ElevenLabs session', error);
      }
    },
    [conversationId]
  );

  const triggerAnalysis = useCallback(async () => {
    if (!conversationId) return;
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      await elevenLabsApi.analyseConversation(conversationId);
      // ai_notes zostaną zaktualizowane przez SSE
    } catch (error: any) {
      console.error('Error triggering analysis:', error);
      setAnalysisError(error.message || 'Błąd podczas analizy formularza');
    } finally {
      setIsAnalyzing(false);
    }
  }, [conversationId]);

  // Automatyczna analiza przy wejściu na podsumowanie
  useEffect(() => {
    if (currentStep === 8 && conversationId) {
      triggerAnalysis();
    }
  }, [currentStep, conversationId, triggerAnalysis]);

  useEffect(() => {
    if (!conversationId) return;
    if (isSseUpdateRef.current) {
      // Skip sync for state changes coming from ElevenLabs to avoid echo loops
      isSseUpdateRef.current = false;
      return;
    }

    if (syncTimeoutRef.current) {
      window.clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = window.setTimeout(() => {
      syncElevenLabsForm(formData);
    }, 400);

    return () => {
      if (syncTimeoutRef.current) {
        window.clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [conversationId, formData, syncElevenLabsForm]);

  // Mode selection screen
  if (mode === 'select') {
    return <ModeSelector onSelectMode={(m) => setMode(m === 'wizard' ? 'wizard' : 'chat')} />;
  }

  // Chat mode
  if (mode === 'chat') {
    return <ChatForm onComplete={handleChatComplete} />;
  }

  // Acceptance screen (after chat)
  if (mode === 'acceptance') {
    return <AcceptanceScreen data={formData} onBack={handleBackToModeSelect} />;
  }

  // Confirmation screen (after wizard submission)
  if (isSubmitted && submittedApplication) {
    return <ConfirmationScreen data={formData} application={submittedApplication} onBack={handleBackToForm} />;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1VictimData data={formData.poszkodowany} onChange={updatePoszkodowany} aiNotes={aiNotes} />;
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
        return <Step5AccidentDetails data={formData.szczegoly} onChange={updateSzczegoly} aiNotes={aiNotes} />;
      case 6:
        return <Step6Machinery data={formData.szczegoly} onChange={updateSzczegoly} />;
      case 7:
        return <Step7Witnesses witnesses={formData.swiadkowie} onChange={updateSwiadkowie} aiNotes={aiNotes} />;
      case 8:
        return (
          <Step8Summary 
            data={formData} 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
            error={submitError}
            onStepClick={goToStep}
            aiNotes={aiNotes}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onRetryAnalysis={triggerAnalysis}
          />
        );
      default:
        return null;
    }
  };

  const progressPercentage = Math.round((currentStep / FORM_STEPS.length) * 100);
  const currentStepData = FORM_STEPS.find((s) => s.id === currentStep);

  return (
    <div className="flex justify-center py-6">
      <div className="w-full max-w-3xl relative">
        {/* Loading overlay - positioned relative to form column */}
        <AnalysisProgressDialog 
          open={isAnalyzing} 
          onOpenChange={() => {}} 
          variant="overlay"
        />
        
        <div className="space-y-6">
          {/* Main card with header and step indicator */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            {/* Header with progress */}
            <div className="bg-primary/5 border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {currentStepData?.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Krok {currentStep} z {FORM_STEPS.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
                    <p className="text-xs text-muted-foreground">ukończono</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step indicator */}
            <div className="px-6 py-4 bg-card">
              <StepIndicator steps={FORM_STEPS} currentStep={currentStep} onStepClick={goToStep} />
            </div>
          </div>

          {/* Step content */}
          <div className="animate-fade-in">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Wstecz
            </Button>
            <Button onClick={handleNext} className="gap-2 text-sm shadow-sm">
              Dalej
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
