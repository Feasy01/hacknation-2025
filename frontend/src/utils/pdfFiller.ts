import { PDFDocument } from 'pdf-lib';
import { AccidentReportFormData } from '@/types/accident-report';

/**
 * Maps frontend form data to PDF form field names
 * Uses exact field keys from EWYP form specification
 */
const createFieldMapping = (data: AccidentReportFormData): Record<string, string> => {
  const mapping: Record<string, string> = {};

  // 1. dane_poszkodowanego - Dane osobowe
  if (data.poszkodowany) {
    mapping['poszkodowany_pesel'] = data.poszkodowany.pesel || '';
    mapping['poszkodowany_dokument_typ'] = data.poszkodowany.dokumentTyp || '';
    mapping['poszkodowany_dokument_seria_numer'] = [
      data.poszkodowany.dokumentSeria,
      data.poszkodowany.dokumentNumer
    ].filter(Boolean).join(' ') || '';
    mapping['poszkodowany_imie'] = data.poszkodowany.imie || '';
    mapping['poszkodowany_nazwisko'] = data.poszkodowany.nazwisko || '';
    mapping['poszkodowany_data_urodzenia'] = formatDate(data.poszkodowany.dataUrodzenia) || '';
    mapping['poszkodowany_miejsce_urodzenia'] = data.poszkodowany.miejsceUrodzenia || '';
    mapping['poszkodowany_telefon'] = data.poszkodowany.telefon || '';
  }

  // Adres zamieszkania poszkodowanego
  if (data.adresZamieszkania) {
    mapping['poszkodowany_adres_ulica'] = data.adresZamieszkania.ulica || '';
    mapping['poszkodowany_adres_nr_domu'] = data.adresZamieszkania.nrDomu || '';
    mapping['poszkodowany_adres_nr_lokalu'] = data.adresZamieszkania.nrLokalu || '';
    mapping['poszkodowany_adres_kod'] = data.adresZamieszkania.kodPocztowy || '';
    mapping['poszkodowany_adres_miejscowosc'] = data.adresZamieszkania.miejscowosc || '';
    mapping['poszkodowany_adres_panstwo'] = data.adresZamieszkania.panstwo || 'Polska';
  }

  // Adres ostatniego zamieszkania / pobytu poszkodowanego
  if (data.ostatniAdresPL) {
    mapping['poszkodowany_ostatni_adres_ulica'] = data.ostatniAdresPL.ulica || '';
    mapping['poszkodowany_ostatni_adres_nr_domu'] = data.ostatniAdresPL.nrDomu || '';
    mapping['poszkodowany_ostatni_adres_nr_lokalu'] = data.ostatniAdresPL.nrLokalu || '';
    mapping['poszkodowany_ostatni_adres_kod'] = data.ostatniAdresPL.kodPocztowy || '';
    mapping['poszkodowany_ostatni_adres_miejscowosc'] = data.ostatniAdresPL.miejscowosc || '';
  }

  // 2. adres_korespondencyjny_poszkodowanego
  if (data.innyAdresKorespondencyjny && data.adresKorespondencyjny) {
    const korresp = data.adresKorespondencyjny;
    
    // Map typ: 'adres' -> 'standard', 'poste-restante' -> 'poste_restante', 'skrytka' -> 'skrytka'
    if (korresp.typ === 'adres') {
      mapping['poszkodowany_korresp_typ'] = 'standard';
      if (korresp.adres) {
        mapping['poszkodowany_korresp_ulica'] = korresp.adres.ulica || '';
        mapping['poszkodowany_korresp_nr_domu'] = korresp.adres.nrDomu || '';
        mapping['poszkodowany_korresp_nr_lokalu'] = korresp.adres.nrLokalu || '';
        mapping['poszkodowany_korresp_kod'] = korresp.adres.kodPocztowy || '';
        mapping['poszkodowany_korresp_miejscowosc'] = korresp.adres.miejscowosc || '';
        mapping['poszkodowany_korresp_panstwo'] = korresp.adres.panstwo || 'Polska';
      }
    } else if (korresp.typ === 'poste-restante') {
      mapping['poszkodowany_korresp_typ'] = 'poste_restante';
      // For poste-restante, we might need to handle differently
      // This depends on how the PDF form handles this type
    } else if (korresp.typ === 'skrytka') {
      mapping['poszkodowany_korresp_typ'] = 'skrytka';
      // For skrytka, we might need to handle differently
    }
  }

  // 3. adres_dzialalnosci
  if (data.adresDzialalnosci) {
    mapping['dzialalnosc_ulica'] = data.adresDzialalnosci.ulica || '';
    mapping['dzialalnosc_nr_domu'] = data.adresDzialalnosci.nrDomu || '';
    mapping['dzialalnosc_nr_lokalu'] = data.adresDzialalnosci.nrLokalu || '';
    mapping['dzialalnosc_kod'] = data.adresDzialalnosci.kodPocztowy || '';
    mapping['dzialalnosc_miejscowosc'] = data.adresDzialalnosci.miejscowosc || '';
    mapping['dzialalnosc_telefon'] = data.adresDzialalnosci.telefon || '';
  }

  // 4. adres_sprawowania_opieki (niania) - Not in current form data structure
  // This would need to be added to the form if needed

  // 5. dane_zglaszajacego (gdy nie poszkodowany)
  if (data.zglaszajacyInny && data.zglaszajacy) {
    // Dane osobowe
    mapping['zglaszajacy_pesel'] = data.zglaszajacy.pesel || '';
    mapping['zglaszajacy_dokument_typ'] = data.zglaszajacy.dokumentTyp || '';
    mapping['zglaszajacy_dokument_seria_numer'] = [
      data.zglaszajacy.dokumentSeria,
      data.zglaszajacy.dokumentNumer
    ].filter(Boolean).join(' ') || '';
    mapping['zglaszajacy_imie'] = data.zglaszajacy.imie || '';
    mapping['zglaszajacy_nazwisko'] = data.zglaszajacy.nazwisko || '';
    mapping['zglaszajacy_data_urodzenia'] = formatDate(data.zglaszajacy.dataUrodzenia) || '';
    mapping['zglaszajacy_telefon'] = data.zglaszajacy.telefon || '';

    // Adres zamieszkania zgłaszającego
    if (data.zglaszajacyAdresZamieszkania) {
      mapping['zglaszajacy_adres_ulica'] = data.zglaszajacyAdresZamieszkania.ulica || '';
      mapping['zglaszajacy_adres_nr_domu'] = data.zglaszajacyAdresZamieszkania.nrDomu || '';
      mapping['zglaszajacy_adres_nr_lokalu'] = data.zglaszajacyAdresZamieszkania.nrLokalu || '';
      mapping['zglaszajacy_adres_kod'] = data.zglaszajacyAdresZamieszkania.kodPocztowy || '';
      mapping['zglaszajacy_adres_miejscowosc'] = data.zglaszajacyAdresZamieszkania.miejscowosc || '';
      mapping['zglaszajacy_adres_panstwo'] = data.zglaszajacyAdresZamieszkania.panstwo || 'Polska';
    }

    // Adres ostatniego zamieszkania / pobytu zgłaszającego
    if (data.zglaszajacyOstatniAdresPL) {
      mapping['zglaszajacy_ostatni_adres_ulica'] = data.zglaszajacyOstatniAdresPL.ulica || '';
      mapping['zglaszajacy_ostatni_adres_nr_domu'] = data.zglaszajacyOstatniAdresPL.nrDomu || '';
      mapping['zglaszajacy_ostatni_adres_nr_lokalu'] = data.zglaszajacyOstatniAdresPL.nrLokalu || '';
      mapping['zglaszajacy_ostatni_adres_kod'] = data.zglaszajacyOstatniAdresPL.kodPocztowy || '';
      mapping['zglaszajacy_ostatni_adres_miejscowosc'] = data.zglaszajacyOstatniAdresPL.miejscowosc || '';
    }

    // Adres korespondencyjny zgłaszającego
    if (data.zglaszajacyInnyAdresKorespondencyjny && data.zglaszajacyAdresKorespondencyjny) {
      const korresp = data.zglaszajacyAdresKorespondencyjny;
      
      if (korresp.typ === 'adres') {
        mapping['zglaszajacy_korresp_typ'] = 'standard';
        if (korresp.adres) {
          mapping['zglaszajacy_korresp_ulica'] = korresp.adres.ulica || '';
          mapping['zglaszajacy_korresp_nr_domu'] = korresp.adres.nrDomu || '';
          mapping['zglaszajacy_korresp_nr_lokalu'] = korresp.adres.nrLokalu || '';
          mapping['zglaszajacy_korresp_kod'] = korresp.adres.kodPocztowy || '';
          mapping['zglaszajacy_korresp_miejscowosc'] = korresp.adres.miejscowosc || '';
          mapping['zglaszajacy_korresp_panstwo'] = korresp.adres.panstwo || 'Polska';
        }
      } else if (korresp.typ === 'poste-restante') {
        mapping['zglaszajacy_korresp_typ'] = 'poste_restante';
      } else if (korresp.typ === 'skrytka') {
        mapping['zglaszajacy_korresp_typ'] = 'skrytka';
      }
    }
  }

  // 6. informacje_o_wypadku
  if (data.szczegoly) {
    const szczegoly = data.szczegoly;
    mapping['wypadek_data'] = formatDate(szczegoly.data) || '';
    mapping['wypadek_godzina'] = szczegoly.godzina || '';
    mapping['wypadek_miejsce'] = szczegoly.miejsce || '';
    mapping['wypadek_plan_start'] = szczegoly.godzinaRozpoczeciaPracy || '';
    mapping['wypadek_plan_koniec'] = szczegoly.godzinaZakonczeniaPracy || '';
    mapping['wypadek_rodzaj_urazow'] = szczegoly.opisUrazow || '';
    mapping['wypadek_opis'] = szczegoly.opisOkolicznosci || '';
    
    // Pierwsza pomoc
    mapping['wypadek_pierwsza_pomoc'] = szczegoly.pierwszaPomoc ? 'TAK' : 'NIE';
    if (szczegoly.pierwszaPomoc) {
      mapping['wypadek_pierwsza_pomoc_placowka'] = szczegoly.pierwszaPomocNazwa || '';
      // If pierwszaPomocAdres is provided, it might need to be combined with nazwa
      if (szczegoly.pierwszaPomocAdres) {
        mapping['wypadek_pierwsza_pomoc_placowka'] = [
          szczegoly.pierwszaPomocNazwa,
          szczegoly.pierwszaPomocAdres
        ].filter(Boolean).join(', ') || '';
      }
    }
    
    // Postępowanie prowadzone
    if (szczegoly.postepowanieProwadzone) {
      mapping['wypadek_prowadzone_postepowanie_organ'] = szczegoly.postepowanieOrgan || '';
      // If postepowanieAdres is provided, it might need to be combined
      if (szczegoly.postepowanieAdres) {
        mapping['wypadek_prowadzone_postepowanie_organ'] = [
          szczegoly.postepowanieOrgan,
          szczegoly.postepowanieAdres
        ].filter(Boolean).join(', ') || '';
      }
    }
    
    // Maszyny
    mapping['wypadek_czy_maszyny'] = szczegoly.obslugaMaszyn ? 'TAK' : 'NIE';
    if (szczegoly.obslugaMaszyn) {
      mapping['wypadek_maszyny_szczegoly'] = szczegoly.maszynyOpis || '';
      mapping['wypadek_maszyny_atest'] = szczegoly.atestDeklaracja ? 'TAK' : 'NIE';
      mapping['wypadek_maszyny_ewidencja'] = szczegoly.ewidencjaSrodkowTrwalych ? 'TAK' : 'NIE';
    }
  }

  // 7. swiadkowie[] - Array of 0-3 witnesses
  // Each witness has: imie, nazwisko, ulica, nr_domu, nr_lokalu, kod, miejscowosc, panstwo
  if (data.swiadkowie && data.swiadkowie.length > 0) {
    // PDF forms typically use numbered field names (swiadek_1_imie) or array notation (swiadkowie[0].imie)
    // We'll provide both patterns to ensure compatibility
    data.swiadkowie.slice(0, 3).forEach((swiadek, index) => {
      const baseIndex = index; // 0-based for array notation
      const displayIndex = index + 1; // 1-based for numbered fields
      
      // Array notation (e.g., swiadkowie[0].imie)
      mapping[`swiadkowie[${baseIndex}].imie`] = swiadek.imie || '';
      mapping[`swiadkowie[${baseIndex}].nazwisko`] = swiadek.nazwisko || '';
      mapping[`swiadkowie[${baseIndex}].ulica`] = swiadek.ulica || '';
      mapping[`swiadkowie[${baseIndex}].nr_domu`] = swiadek.nrDomu || '';
      mapping[`swiadkowie[${baseIndex}].nr_lokalu`] = swiadek.nrLokalu || '';
      mapping[`swiadkowie[${baseIndex}].kod`] = swiadek.kodPocztowy || '';
      mapping[`swiadkowie[${baseIndex}].miejscowosc`] = swiadek.miejscowosc || '';
      mapping[`swiadkowie[${baseIndex}].panstwo`] = swiadek.panstwo || 'Polska';
      
      // Numbered notation as fallback (e.g., swiadek_1_imie)
      mapping[`swiadek_${displayIndex}_imie`] = swiadek.imie || '';
      mapping[`swiadek_${displayIndex}_nazwisko`] = swiadek.nazwisko || '';
      mapping[`swiadek_${displayIndex}_ulica`] = swiadek.ulica || '';
      mapping[`swiadek_${displayIndex}_nr_domu`] = swiadek.nrDomu || '';
      mapping[`swiadek_${displayIndex}_nr_lokalu`] = swiadek.nrLokalu || '';
      mapping[`swiadek_${displayIndex}_kod`] = swiadek.kodPocztowy || '';
      mapping[`swiadek_${displayIndex}_miejscowosc`] = swiadek.miejscowosc || '';
      mapping[`swiadek_${displayIndex}_panstwo`] = swiadek.panstwo || 'Polska';
    });
  }

  // 8. zalaczniki - Not in current form data structure
  // These would need to be added if needed:
  // mapping['zalacznik_karta_informacyjna'] = false;
  // mapping['zalacznik_postanowienie_prokuratury'] = false;
  // mapping['zalacznik_dokumenty_dot_zgonu'] = false;
  // mapping['zalacznik_dokumenty_prawa_do_karty'] = false;
  // mapping['zalacznik_inne'] = '';
  // mapping['do_dnia_data'] = '';
  // mapping['zobowiazanie_dokumenty'] = ['', '', '', '', '', '', '', ''];

  // 9. sposob_odbioru - Not in current form data structure
  // mapping['odbior_w_placowce'] = false;
  // mapping['odbior_poczta_pue'] = false;
  // mapping['odbior_przez_upowazniona'] = false;

  // 10. podpis - Not in current form data structure
  // mapping['data_podpisu'] = '';
  // mapping['podpis'] = '';

  return mapping;
};

/**
 * Formats date from YYYY-MM-DD to DD.MM.YYYY
 */
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Fills PDF form with form data and returns the filled PDF as a blob
 */
export async function fillPdfForm(
  pdfTemplatePath: string,
  formData: AccidentReportFormData
): Promise<Blob> {
  try {
    // Load the PDF template
    const pdfBytes = await fetch(pdfTemplatePath).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the form
    const form = pdfDoc.getForm();
    
    // Get all field names from the PDF
    const fields = form.getFields();
    const fieldNames = fields.map(field => field.getName());
    
    // Log available fields for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log('Available PDF form fields:', fieldNames);
    }
    
    // Create mapping from form data
    const fieldMapping = createFieldMapping(formData);
    
    // Helper function to find field by name (case-insensitive, partial match)
    const findFieldByName = (searchName: string) => {
      const lowerSearch = searchName.toLowerCase().replace(/[_\s]/g, '');
      return fieldNames.find(fieldName => {
        const lowerField = fieldName.toLowerCase().replace(/[_\s]/g, '');
        return lowerField === lowerSearch || lowerField.includes(lowerSearch) || lowerSearch.includes(lowerField);
      });
    };
    
    // Helper function to set field value
    const setFieldValue = (fieldName: string, value: string) => {
      try {
        const field = form.getTextField(fieldName);
        field.setText(String(value));
        return true;
      } catch {
        try {
          const field = form.getCheckBox(fieldName);
          if (value === 'X' || value === 'Tak' || value === 'true') {
            field.check();
          } else {
            field.uncheck();
          }
          return true;
        } catch {
          try {
            const field = form.getRadioGroup(fieldName);
            // For radio groups, we'd need to know the option value
            // This is a simplified approach
            return false;
          } catch {
            // Field might not exist or be of different type
            return false;
          }
        }
      }
    };
    
    // Try to fill fields using various naming patterns
    // First, try exact matches (case-insensitive)
    for (const [mapKey, value] of Object.entries(fieldMapping)) {
      if (!value) continue;
      
      // Try exact match first
      const exactMatch = findFieldByName(mapKey);
      if (exactMatch && setFieldValue(exactMatch, value)) {
        continue;
      }
      
      // Try without underscores
      const noUnderscore = mapKey.replace(/_/g, '');
      const matchNoUnderscore = findFieldByName(noUnderscore);
      if (matchNoUnderscore && setFieldValue(matchNoUnderscore, value)) {
        continue;
      }
    }
    
    // Try common field name variations (fallback patterns for PDF forms with different naming)
    const commonMappings: Record<string, string[]> = {
      'poszkodowany_imie': ['imie', 'imię', 'imie_poszkodowanego'],
      'poszkodowany_nazwisko': ['nazwisko', 'nazwisko_poszkodowanego'],
      'poszkodowany_pesel': ['pesel', 'pesel_poszkodowanego', 'numer_pesel'],
      'poszkodowany_data_urodzenia': ['data_urodzenia', 'data_urodzenia_poszkodowanego'],
      'poszkodowany_dokument_typ': ['dokument_typ', 'typ_dokumentu'],
      'poszkodowany_dokument_seria_numer': ['dokument_seria_numer', 'dokument_seria', 'dokument_numer'],
      'wypadek_data': ['data_wypadku', 'data', 'data_zdarzenia'],
      'wypadek_godzina': ['godzina_wypadku', 'godzina', 'godzina_zdarzenia'],
      'wypadek_miejsce': ['miejsce_wypadku', 'miejsce', 'miejsce_zdarzenia'],
      'wypadek_plan_start': ['godzina_rozpoczecia', 'plan_start', 'rozpoczecie'],
      'wypadek_plan_koniec': ['godzina_zakonczenia', 'plan_koniec', 'zakonczenie'],
      'wypadek_opis': ['opis_okolicznosci', 'opis_wypadku', 'okolicznosci', 'przebieg'],
      'wypadek_rodzaj_urazow': ['opis_urazow', 'urazy', 'szkody', 'rodzaj_urazow'],
      'wypadek_pierwsza_pomoc': ['pierwsza_pomoc', 'pierwsza_pomoc_tak', 'pierwsza_pomoc_nie'],
      'zglaszajacy_imie': ['imie_zglaszajacego', 'imie'],
      'zglaszajacy_nazwisko': ['nazwisko_zglaszajacego', 'nazwisko'],
    };
    
    // Try alternative field names from common mappings
    for (const [key, alternatives] of Object.entries(commonMappings)) {
      const value = fieldMapping[key];
      if (!value) continue;
      
      // Check if we already filled this field
      let filled = false;
      for (const altName of alternatives) {
        const match = findFieldByName(altName);
        if (match && setFieldValue(match, value)) {
          filled = true;
          break;
        }
      }
      
      // If not filled, try partial matching
      if (!filled) {
        for (const fieldName of fieldNames) {
          const lowerFieldName = fieldName.toLowerCase().replace(/[_\s]/g, '');
          const lowerKey = key.toLowerCase().replace(/[_\s]/g, '');
          
          if (lowerFieldName.includes(lowerKey) || lowerKey.includes(lowerFieldName)) {
            if (setFieldValue(fieldName, value)) {
              break;
            }
          }
        }
      }
    }
    
    // Final pass: try to match any remaining fields by partial name matching
    for (const [mapKey, mapValue] of Object.entries(fieldMapping)) {
      if (!mapValue) continue;
      
      // Skip if already processed
      let alreadyFilled = false;
      for (const fieldName of fieldNames) {
        const lowerFieldName = fieldName.toLowerCase().replace(/[_\s]/g, '');
        const lowerKey = mapKey.toLowerCase().replace(/[_\s]/g, '');
        
        // Check if this field might match
        if (lowerFieldName.includes(lowerKey) || lowerKey.includes(lowerFieldName)) {
          if (setFieldValue(fieldName, mapValue)) {
            alreadyFilled = true;
            break;
          }
        }
      }
    }
    
    // Save the PDF
    const pdfBytesFilled = await pdfDoc.save();
    return new Blob([pdfBytesFilled], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error filling PDF form:', error);
    throw new Error('Nie udało się wypełnić formularza PDF. Sprawdź konsolę przeglądarki.');
  }
}

/**
 * Downloads a PDF blob as a file
 */
export function downloadPdf(blob: Blob, filename: string = 'zawiadomienie_wypadek.pdf'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

