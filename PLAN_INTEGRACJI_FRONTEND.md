# Plan integracji analizy formularza z frontendem

## Przegląd
Integracja funkcjonalności automatycznej analizy formularza (`ai_notes`) z frontendem wymaga:
1. Dodania typów TypeScript dla `ai_notes`
2. Rozszerzenia API clienta o metodę analizy
3. Obsługi `ai_notes` w SSE
4. Wywołania analizy przy wejściu na Step8Summary
5. Wyświetlenia notatek w komponencie podsumowania
6. Obsługi stanu ładowania i błędów

---

## 1. Typy TypeScript

### Plik: `frontend/src/types/accident-report.ts`

**Dodaj nowe interfejsy:**

```typescript
// AI Notes types
export type AINoteSeverity = 'warning' | 'critical';
export type AINoteReason = 'missing' | 'insufficient' | 'inconsistent';

export interface AINote {
  section: string;  // np. 'szczegoly', 'poszkodowany', 'swiadkowie'
  message: string;  // Wiadomość po polsku, formalnym tonem
  severity: AINoteSeverity;
  fields: string[];  // Lista ścieżek w dot-notation, np. ['szczegoly.opis_okolicznosci']
  reason: AINoteReason;
  suggested_action?: string;  // Opcjonalna sugestia działania
}

// Rozszerz interfejs dla SSE payload
export interface FormUpdatePayload {
  type: 'form_update';
  conversation_id: string;
  form_data: AccidentReportFormData;
  validation_errors: Record<string, string>;
  ai_notes: AINote[];  // NOWE
  timestamp: string;
}
```

---

## 2. Rozszerzenie API Clienta

### Plik: `frontend/src/utils/apiClient.js`

**Dodaj metodę do `elevenLabsApi`:**

```javascript
// ElevenLabs integration helpers
export const elevenLabsApi = {
  // Sync manual form edits into ElevenLabs conversation session
  syncConversation: async (conversationId, formData, analyse = false) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/conversation/${conversationId}/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          form_data: formData,
          analyse: analyse  // NOWE - opcjonalna flaga
        }),
      }
    );

    return handleResponse(response);
  },

  // NEW: Trigger form analysis
  analyseConversation: async (conversationId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/conversation/${conversationId}/analyse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return handleResponse(response);
  },

  // NEW: Get conversation snapshot (includes ai_notes)
  getConversationSnapshot: async (conversationId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/elevenlabs/snapshot/${conversationId}`
    );

    return handleResponse(response);
  },
};
```

---

## 3. Aktualizacja komponentu głównego formularza

### Plik: `frontend/src/components/accident-report/AccidentReportForm.tsx`

**Zmiany:**

1. **Dodaj stan dla `ai_notes`:**
```typescript
const [aiNotes, setAiNotes] = useState<AINote[]>([]);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisError, setAnalysisError] = useState<string | null>(null);
```

2. **Zaktualizuj handler SSE, żeby obsługiwał `ai_notes`:**
```typescript
// W useEffect dla SSE (około linii 151)
eventSource.onmessage = (event) => {
  try {
    const payload = JSON.parse(event.data);
    if (payload?.type === 'form_update' && payload.form_data) {
      const mapped = mapBackendFormToFrontend(payload.form_data);
      isSseUpdateRef.current = true;
      setFormData(mapped);
      
      // NOWE: Aktualizuj ai_notes z SSE
      if (payload.ai_notes) {
        setAiNotes(payload.ai_notes);
      }
    }
  } catch (error) {
    console.error('Error parsing ElevenLabs SSE payload', error);
  }
};
```

3. **Dodaj funkcję wywołania analizy:**
```typescript
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
```

4. **Dodaj useEffect do automatycznego wywołania analizy przy wejściu na Step 8:**
```typescript
// Automatyczna analiza przy wejściu na podsumowanie
useEffect(() => {
  if (currentStep === 8 && conversationId) {
    triggerAnalysis();
  }
}, [currentStep, conversationId, triggerAnalysis]);
```

5. **Przekaż `ai_notes` do Step8Summary:**
```typescript
case 8:
  return (
    <Step8Summary 
      data={formData} 
      onSubmit={handleSubmit} 
      isSubmitting={isSubmitting} 
      error={submitError}
      onStepClick={goToStep}
      aiNotes={aiNotes}  // NOWE
      isAnalyzing={isAnalyzing}  // NOWE
      analysisError={analysisError}  // NOWE
      onRetryAnalysis={triggerAnalysis}  // NOWE
    />
  );
```

---

## 4. Aktualizacja komponentu Step8Summary

### Plik: `frontend/src/components/accident-report/steps/Step8Summary.tsx`

**Zmiany:**

1. **Rozszerz interfejs props:**
```typescript
import { AINote } from '@/types/accident-report';
import { AlertCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface Step8Props {
  data: AccidentReportFormData;
  onSubmit: () => void;
  isSubmitting?: boolean;
  error?: string | null;
  onStepClick?: (step: number) => void;
  // NOWE
  aiNotes?: AINote[];
  isAnalyzing?: boolean;
  analysisError?: string | null;
  onRetryAnalysis?: () => void;
}
```

2. **Dodaj sekcję wyświetlającą `ai_notes` przed sekcją podsumowania:**
```typescript
export const Step8Summary: React.FC<Step8Props> = ({ 
  data, 
  onSubmit, 
  isSubmitting = false, 
  error = null, 
  onStepClick,
  aiNotes = [],
  isAnalyzing = false,
  analysisError = null,
  onRetryAnalysis
}) => {
  // ... istniejący kod ...

  // Funkcja pomocnicza do mapowania sekcji na nazwy
  const getSectionName = (section: string): string => {
    const sectionMap: Record<string, string> = {
      'szczegoly': 'Szczegóły wypadku',
      'poszkodowany': 'Dane poszkodowanego',
      'swiadkowie': 'Świadkowie',
      'adres_zamieszkania': 'Adres zamieszkania',
      'adres_dzialalnosci': 'Adres działalności',
    };
    return sectionMap[section] || section;
  };

  // Funkcja pomocnicza do mapowania severity na kolory
  const getSeverityStyles = (severity: 'warning' | 'critical') => {
    if (severity === 'critical') {
      return {
        bg: 'bg-destructive/10',
        border: 'border-destructive/20',
        icon: <XCircle className="w-5 h-5 text-destructive" />,
        text: 'text-destructive',
      };
    }
    return {
      bg: 'bg-warning/10',
      border: 'border-warning/20',
      icon: <AlertCircle className="w-5 h-5 text-warning" />,
      text: 'text-warning',
    };
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* NOWA SEKCJA: AI Notes */}
      {(aiNotes.length > 0 || isAnalyzing || analysisError) && (
        <div className="form-section">
          <h3 className="form-section-title">
            <AlertCircle className="w-4 h-4" />
            Analiza kompletności formularza
          </h3>
          <div className="form-section-content">
            {isAnalyzing && (
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Analizowanie formularza...
                </span>
              </div>
            )}

            {analysisError && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive mb-1">
                      Błąd analizy
                    </p>
                    <p className="text-sm text-destructive/80">{analysisError}</p>
                  </div>
                  {onRetryAnalysis && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onRetryAnalysis}
                      className="shrink-0"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Spróbuj ponownie
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisError && aiNotes.length === 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Formularz jest kompletny i spójny. Wszystkie wymagane dane zostały wprowadzone.
                  </p>
                </div>
              </div>
            )}

            {!isAnalyzing && !analysisError && aiNotes.length > 0 && (
              <div className="space-y-3">
                {aiNotes.map((note, index) => {
                  const styles = getSeverityStyles(note.severity);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}
                    >
                      <div className="flex items-start gap-3">
                        {styles.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              {getSectionName(note.section)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${styles.text} ${styles.bg}`}>
                              {note.severity === 'critical' ? 'Krytyczne' : 'Ostrzeżenie'}
                            </span>
                          </div>
                          <p className="text-sm mb-2">{note.message}</p>
                          
                          {note.fields.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                Dotyczy pól:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {note.fields.map((field, fieldIndex) => (
                                  <span
                                    key={fieldIndex}
                                    className="text-xs px-2 py-0.5 bg-background rounded border border-border"
                                  >
                                    {field}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {note.suggested_action && (
                            <div className="mt-2 p-2 bg-background rounded border border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Sugerowane działanie:
                              </p>
                              <p className="text-xs">{note.suggested_action}</p>
                            </div>
                          )}

                          {/* Przycisk do przejścia do sekcji */}
                          {onStepClick && note.section === 'szczegoly' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => onStepClick(5)}
                            >
                              Przejdź do szczegółów wypadku
                            </Button>
                          )}
                          {onStepClick && note.section === 'poszkodowany' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => onStepClick(1)}
                            >
                              Przejdź do danych poszkodowanego
                            </Button>
                          )}
                          {onStepClick && note.section === 'swiadkowie' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => onStepClick(7)}
                            >
                              Przejdź do świadków
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isAnalyzing && onRetryAnalysis && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryAnalysis}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Ponów analizę
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Istniejąca sekcja podsumowania */}
      <div className="form-section">
        {/* ... istniejący kod ... */}
      </div>

      {/* Istniejąca sekcja akcji */}
      <div className="form-section">
        {/* ... istniejący kod ... */}
      </div>
    </div>
  );
};
```

---

## 5. Opcjonalne: Obsługa analizy przy sync

### Plik: `frontend/src/components/accident-report/AccidentReportForm.tsx`

**W funkcji `syncElevenLabsForm` można dodać opcjonalną flagę:**

```typescript
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
```

---

## 6. Testowanie

### Scenariusze testowe:

1. **Wejście na Step 8 bez conversationId:**
   - Nie powinno wywołać analizy
   - Nie powinno wyświetlić sekcji AI Notes

2. **Wejście na Step 8 z conversationId:**
   - Powinno automatycznie wywołać analizę
   - Powinno wyświetlić stan ładowania
   - Po zakończeniu powinno wyświetlić notatki lub komunikat o kompletności

3. **Otrzymanie ai_notes przez SSE:**
   - Po wywołaniu analizy, notatki powinny przyjść przez SSE
   - Stan powinien się zaktualizować automatycznie

4. **Ponowna analiza:**
   - Przycisk "Ponów analizę" powinien wywołać analizę ponownie
   - Powinien nadpisać poprzednie notatki

5. **Obsługa błędów:**
   - Błąd analizy powinien być wyświetlony
   - Przycisk "Spróbuj ponownie" powinien działać

6. **Przejście do sekcji z notatki:**
   - Przyciski "Przejdź do..." powinny przenieść użytkownika do odpowiedniego kroku

---

## 7. Priorytetyzacja implementacji

### Faza 1 (MVP):
- ✅ Typy TypeScript
- ✅ Rozszerzenie API clienta
- ✅ Podstawowa obsługa SSE dla ai_notes
- ✅ Automatyczne wywołanie analizy przy wejściu na Step 8
- ✅ Podstawowe wyświetlenie notatek

### Faza 2 (Ulepszenia UX):
- ✅ Stan ładowania i błędy
- ✅ Przycisk ponownej analizy
- ✅ Przejście do sekcji z notatki
- ✅ Lepsze style i ikony

### Faza 3 (Opcjonalne):
- ✅ Grupowanie notatek według sekcji
- ✅ Filtrowanie według severity
- ✅ Collapse/expand dla długich list
- ✅ Historia zmian ai_notes

---

## 8. Uwagi techniczne

1. **SSE automatycznie aktualizuje ai_notes:**
   - Po wywołaniu analizy, backend wysyła aktualizację przez SSE
   - Frontend nie musi dodatkowo pobierać snapshotu (ale może jako fallback)

2. **Debouncing analizy:**
   - Można rozważyć debouncing przy szybkim przełączaniu między krokami
   - Obecnie analiza wywoływana jest przy każdym wejściu na Step 8

3. **Cache ai_notes:**
   - Można rozważyć cache w localStorage dla offline
   - Obecnie notatki są tylko w stanie React

4. **Accessibility:**
   - Upewnij się, że notatki są dostępne dla screen readerów
   - Użyj odpowiednich ARIA labels dla przycisków

---

## 9. Przykładowe użycie

```typescript
// Automatyczna analiza przy wejściu na Step 8
useEffect(() => {
  if (currentStep === 8 && conversationId) {
    triggerAnalysis();
  }
}, [currentStep, conversationId, triggerAnalysis]);

// Ręczne wywołanie analizy
const handleManualAnalysis = async () => {
  await triggerAnalysis();
};

// Sync z analizą
await syncElevenLabsForm(formData, true);
```

---

## 10. Checklist implementacji

- [ ] Dodanie typów TypeScript dla AINote
- [ ] Rozszerzenie apiClient.js o metody analizy
- [ ] Aktualizacja SSE handlera w AccidentReportForm
- [ ] Dodanie stanu dla ai_notes, isAnalyzing, analysisError
- [ ] Implementacja funkcji triggerAnalysis
- [ ] useEffect do automatycznego wywołania przy Step 8
- [ ] Przekazanie props do Step8Summary
- [ ] Implementacja wyświetlania notatek w Step8Summary
- [ ] Stylowanie notatek (critical/warning)
- [ ] Przyciski do przejścia do sekcji
- [ ] Obsługa błędów i stanu ładowania
- [ ] Testowanie wszystkich scenariuszy
- [ ] Accessibility improvements
- [ ] Dokumentacja dla deweloperów

