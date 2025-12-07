import React, { useMemo, useState } from 'react';
import { ZusLayout } from '@/components/layout/ZusLayout';
import { AccidentReportForm } from '@/components/accident-report/AccidentReportForm';
import { ElevenLabsWidget } from '@/components/accident-report/ElevenLabsWidget';
import { ModeSelector } from '@/components/accident-report/ModeSelector';
import { OfficerView } from '@/components/officer/OfficerView';
import { useOfficerView } from '@/contexts/OfficerViewContext';

type ViewState = 'dashboard' | 'accident-form';

const Index: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const callId = useMemo(() => crypto.randomUUID(), []);
  const { isOfficerView } = useOfficerView();

  const handleNavigate = (id: string) => {
    if (id === 'wypadek') {
      setCurrentView('accident-form');
    }
  };

  // Officer View - overrides normal view
  if (isOfficerView) {
    return (
      <ZusLayout
        title="Analiza wypadku (widok urzędnika)"
        onNavigate={handleNavigate}
        activeItem=""
      >
        <OfficerView />
      </ZusLayout>
    );
  }

  if (currentView === 'accident-form') {
    return (
    <ZusLayout 
      title="Zawiadomienie o wypadku przy pracy" 
      onNavigate={handleNavigate}
      activeItem="wypadek"
    >
      <div className="space-y-4">
        <AccidentReportForm conversationId={callId} />
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <ElevenLabsWidget
              agentId={import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_6401kbszf8bdffjrme0cb1c9may9'}
              webhookUrl={import.meta.env.VITE_ELEVENLABS_WEBHOOK_URL}
                conversationId={callId}
              />
            </div>
          </div>
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
      <ModeSelector onSelectMode={() => setCurrentView('accident-form')} />
    </ZusLayout>
  );
};

export default Index;
