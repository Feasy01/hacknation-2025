import { AINote } from '@/types/accident-report';

/**
 * Mapuje ścieżki dot notation z backendu (np. szczegoly.opis_okolicznosci) 
 * do nazw pól w frontendzie (np. opisOkolicznosci)
 */
export const mapBackendFieldToFrontend = (backendPath: string): string => {
  // Rozdziel ścieżkę na części
  const parts = backendPath.split('.');
  
  if (parts.length < 2) {
    return parts[0];
  }
  
  // Pierwsza część to sekcja (szczegoly, poszkodowany, etc.)
  const section = parts[0];
  const field = parts[1];
  
  // Konwersja snake_case do camelCase
  // np. opis_okolicznosci -> opisOkolicznosci
  // np. godzina_rozpoczecia_pracy -> godzinaRozpoczeciaPracy
  const camelCaseField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  
  // Mapowanie specjalnych przypadków
  const fieldMapping: Record<string, string> = {
    // szczegoly
    'opis_okolicznosci': 'opisOkolicznosci',
    'opis_urazow': 'opisUrazow',
    'godzina_rozpoczecia_pracy': 'godzinaRozpoczeciaPracy',
    'godzina_zakonczenia_pracy': 'godzinaZakonczeniaPracy',
    'pierwsza_pomoc': 'pierwszaPomoc',
    'pierwsza_pomoc_nazwa': 'pierwszaPomocNazwa',
    'pierwsza_pomoc_adres': 'pierwszaPomocAdres',
    'postepowanie_prowadzone': 'postepowanieProwadzone',
    'postepowanie_organ': 'postepowanieOrgan',
    'postepowanie_adres': 'postepowanieAdres',
    'obsluga_maszyn': 'obslugaMaszyn',
    'maszyny_sprawne': 'maszynySprawne',
    'maszyny_zgodnie_z_zasadami': 'maszynyZgodnieZZasadami',
    'maszyny_opis': 'maszynyOpis',
    'atest_deklaracja': 'atestDeklaracja',
    'ewidencja_srodkow_trwalych': 'ewidencjaSrodkowTrwalych',
    // poszkodowany
    'data_urodzenia': 'dataUrodzenia',
    'miejsce_urodzenia': 'miejsceUrodzenia',
    'dokument_typ': 'dokumentTyp',
    'dokument_seria': 'dokumentSeria',
    'dokument_numer': 'dokumentNumer',
  };
  
  // Sprawdź czy jest specjalne mapowanie
  if (fieldMapping[field]) {
    return fieldMapping[field];
  }
  
  // Domyślnie zwróć camelCase
  return camelCaseField;
};

/**
 * Sprawdza czy pole ma błąd na podstawie aiNotes
 */
export const hasFieldError = (fieldName: string, aiNotes: AINote[], section?: string): boolean => {
  return aiNotes.some(note => {
    // Jeśli sekcja ma błąd i nie ma konkretnych pól, zwróć true dla wszystkich pól w tej sekcji
    if (note.section === section && note.fields.length === 0) {
      return true;
    }
    
    // Sprawdź konkretne pola
    return note.fields.some(backendPath => {
      const frontendField = mapBackendFieldToFrontend(backendPath);
      return frontendField === fieldName;
    });
  });
};

/**
 * Zwraca wszystkie błędy dla danego pola
 */
export const getFieldErrors = (fieldName: string, aiNotes: AINote[]): AINote[] => {
  return aiNotes.filter(note => 
    note.fields.some(backendPath => {
      const frontendField = mapBackendFieldToFrontend(backendPath);
      return frontendField === fieldName;
    })
  );
};

