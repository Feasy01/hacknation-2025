import { PDFDocument, StandardFonts } from 'pdf-lib';
import { AccidentReportFormData } from '@/types/accident-report';

/**
 * Maps frontend form data to exact PDF form field names from EWYP PDF
 * Uses the actual field names discovered from the PDF form
 */
const createFieldMapping = (data: AccidentReportFormData): Record<string, string | boolean> => {
  const mapping: Record<string, string | boolean> = {};

  // ============================================
  // PAGE 1: Dane poszkodowanego (Victim Data)
  // ============================================
  if (data.poszkodowany) {
    mapping['topmostSubform[0].Page1[0].PESEL[0]'] = data.poszkodowany.pesel || '';
    mapping['topmostSubform[0].Page1[0].Imię[0]'] = data.poszkodowany.imie || '';
    mapping['topmostSubform[0].Page1[0].Nazwisko[0]'] = data.poszkodowany.nazwisko || '';
    mapping['topmostSubform[0].Page1[0].Dataurodzenia[0]'] = formatDate(data.poszkodowany.dataUrodzenia) || '';
    mapping['topmostSubform[0].Page1[0].Miejsceurodzenia[0]'] = data.poszkodowany.miejsceUrodzenia || '';
    mapping['topmostSubform[0].Page1[0].Numertelefonu[0]'] = data.poszkodowany.telefon || '';
    
    // Document type and number combined
    const dokumentInfo = [
      data.poszkodowany.dokumentTyp,
      data.poszkodowany.dokumentSeria,
      data.poszkodowany.dokumentNumer
    ].filter(Boolean).join(' ') || '';
    mapping['topmostSubform[0].Page1[0].Rodzajseriainumerdokumentu[0]'] = dokumentInfo;
  }

  // Adres zamieszkania poszkodowanego (Page1)
  if (data.adresZamieszkania) {
    mapping['topmostSubform[0].Page1[0].Ulica[0]'] = data.adresZamieszkania.ulica || '';
    mapping['topmostSubform[0].Page1[0].Numerdomu[0]'] = data.adresZamieszkania.nrDomu || '';
    mapping['topmostSubform[0].Page1[0].Numerlokalu[0]'] = data.adresZamieszkania.nrLokalu || '';
    mapping['topmostSubform[0].Page1[0].Kodpocztowy[0]'] = data.adresZamieszkania.kodPocztowy || '';
    mapping['topmostSubform[0].Page1[0].Poczta[0]'] = data.adresZamieszkania.miejscowosc || '';
    mapping['topmostSubform[0].Page1[0].Nazwapaństwa[0]'] = data.adresZamieszkania.panstwo || 'Polska';
  }

  // Adres ostatniego zamieszkania / pobytu poszkodowanego w Polsce (Page1 - Ulica2A)
  if (data.ostatniAdresPL) {
    mapping['topmostSubform[0].Page1[0].Ulica2A[0]'] = data.ostatniAdresPL.ulica || '';
    mapping['topmostSubform[0].Page1[0].Numerdomu2A[0]'] = data.ostatniAdresPL.nrDomu || '';
    mapping['topmostSubform[0].Page1[0].Numerlokalu2A[0]'] = data.ostatniAdresPL.nrLokalu || '';
    mapping['topmostSubform[0].Page1[0].Kodpocztowy2A[0]'] = data.ostatniAdresPL.kodPocztowy || '';
    mapping['topmostSubform[0].Page1[0].Poczta2A[0]'] = data.ostatniAdresPL.miejscowosc || '';
  }

  // ============================================
  // PAGE 2: Dane zgłaszającego (Reporter Data)
  // ============================================
  if (data.zglaszajacyInny && data.zglaszajacy) {
    mapping['topmostSubform[0].Page2[0].PESEL[0]'] = data.zglaszajacy.pesel || '';
    mapping['topmostSubform[0].Page2[0].Imię[0]'] = data.zglaszajacy.imie || '';
    mapping['topmostSubform[0].Page2[0].Nazwisko[0]'] = data.zglaszajacy.nazwisko || '';
    
    // Document type and number combined
    const zglaszajacyDokumentInfo = [
      data.zglaszajacy.dokumentTyp,
      data.zglaszajacy.dokumentSeria,
      data.zglaszajacy.dokumentNumer
    ].filter(Boolean).join(' ') || '';
    mapping['topmostSubform[0].Page2[0].Rodzajseriainumerdokumentu[0]'] = zglaszajacyDokumentInfo;

    // Adres zamieszkania zgłaszającego (Page2)
    if (data.zglaszajacyAdresZamieszkania) {
      mapping['topmostSubform[0].Page2[0].Ulica[0]'] = data.zglaszajacyAdresZamieszkania.ulica || '';
      mapping['topmostSubform[0].Page2[0].Numerdomu[0]'] = data.zglaszajacyAdresZamieszkania.nrDomu || '';
      mapping['topmostSubform[0].Page2[0].Numerlokalu[0]'] = data.zglaszajacyAdresZamieszkania.nrLokalu || '';
      mapping['topmostSubform[0].Page2[0].Kodpocztowy[0]'] = data.zglaszajacyAdresZamieszkania.kodPocztowy || '';
      mapping['topmostSubform[0].Page2[0].Poczta[0]'] = data.zglaszajacyAdresZamieszkania.miejscowosc || '';
      mapping['topmostSubform[0].Page2[0].Numertelefonu[0]'] = data.zglaszajacy.telefon || '';
      mapping['topmostSubform[0].Page2[0].Nazwapaństwa2[0]'] = data.zglaszajacyAdresZamieszkania.panstwo || 'Polska';
    }

    // Adres ostatniego zamieszkania / pobytu zgłaszającego w Polsce (Page2 - Ulica2[1])
    if (data.zglaszajacyOstatniAdresPL) {
      mapping['topmostSubform[0].Page2[0].Ulica2[1]'] = data.zglaszajacyOstatniAdresPL.ulica || '';
      mapping['topmostSubform[0].Page2[0].Numerdomu2[1]'] = data.zglaszajacyOstatniAdresPL.nrDomu || '';
      mapping['topmostSubform[0].Page2[0].Numerlokalu2[1]'] = data.zglaszajacyOstatniAdresPL.nrLokalu || '';
      mapping['topmostSubform[0].Page2[0].Kodpocztowy2[1]'] = data.zglaszajacyOstatniAdresPL.kodPocztowy || '';
      mapping['topmostSubform[0].Page2[0].Poczta2[1]'] = data.zglaszajacyOstatniAdresPL.miejscowosc || '';
    }

    // Adres korespondencyjny zgłaszającego (Page2 - Ulica2[0])
    if (data.zglaszajacyInnyAdresKorespondencyjny && data.zglaszajacyAdresKorespondencyjny) {
      const korresp = data.zglaszajacyAdresKorespondencyjny;
      
      // Set checkboxes for correspondence address type
      mapping['topmostSubform[0].Page2[0].adres[0]'] = korresp.typ === 'adres';
      mapping['topmostSubform[0].Page2[0].posterestante[0]'] = korresp.typ === 'poste-restante';
      mapping['topmostSubform[0].Page2[0].skrytkapocztowa[0]'] = korresp.typ === 'skrytka';
      mapping['topmostSubform[0].Page2[0].przegrodkapocztowa[0]'] = false; // Not used in our form
      
      if (korresp.typ === 'adres' && korresp.adres) {
        mapping['topmostSubform[0].Page2[0].Ulica2[0]'] = korresp.adres.ulica || '';
        mapping['topmostSubform[0].Page2[0].Numerdomu2[0]'] = korresp.adres.nrDomu || '';
        mapping['topmostSubform[0].Page2[0].Numerlokalu2[0]'] = korresp.adres.nrLokalu || '';
        mapping['topmostSubform[0].Page2[0].Kodpocztowy2[0]'] = korresp.adres.kodPocztowy || '';
        mapping['topmostSubform[0].Page2[0].Poczta2[0]'] = korresp.adres.miejscowosc || '';
        mapping['topmostSubform[0].Page2[0].Numertelefonu2[0]'] = ''; // Not in our form data
      }
    }
  }

  // ============================================
  // PAGE 3: Informacje o wypadku (Accident Details)
  // ============================================
  if (data.szczegoly) {
    const szczegoly = data.szczegoly;
    
    mapping['topmostSubform[0].Page3[0].Datawyp[0]'] = formatDate(szczegoly.data) || '';
    mapping['topmostSubform[0].Page3[0].Godzina[0]'] = szczegoly.godzina || '';
    mapping['topmostSubform[0].Page3[0].Miejscewyp[0]'] = szczegoly.miejsce || '';
    mapping['topmostSubform[0].Page3[0].Godzina3A[0]'] = szczegoly.godzinaRozpoczeciaPracy || '';
    mapping['topmostSubform[0].Page3[0].Godzina3B[0]'] = szczegoly.godzinaZakonczeniaPracy || '';
    
    // Adres działalności (Page3)
    if (data.adresDzialalnosci) {
      mapping['topmostSubform[0].Page3[0].Ulica3[0]'] = data.adresDzialalnosci.ulica || '';
      mapping['topmostSubform[0].Page3[0].Numerdomu3[0]'] = data.adresDzialalnosci.nrDomu || '';
      mapping['topmostSubform[0].Page3[0].Numerlokalu3[0]'] = data.adresDzialalnosci.nrLokalu || '';
      mapping['topmostSubform[0].Page3[0].Kodpocztowy3[0]'] = data.adresDzialalnosci.kodPocztowy || '';
      mapping['topmostSubform[0].Page3[0].Poczta3[0]'] = data.adresDzialalnosci.miejscowosc || '';
      mapping['topmostSubform[0].Page3[0].Numertelefonu3[0]'] = data.adresDzialalnosci.telefon || '';
    }

    // Adres korespondencyjny poszkodowanego (Page3)
    if (data.innyAdresKorespondencyjny && data.adresKorespondencyjny) {
      const korresp = data.adresKorespondencyjny;
      
      // Set checkboxes for correspondence address type
      mapping['topmostSubform[0].Page3[0].adres[0]'] = korresp.typ === 'adres';
      mapping['topmostSubform[0].Page3[0].posterestante[0]'] = korresp.typ === 'poste-restante';
      mapping['topmostSubform[0].Page3[0].skrytkapocztowa[0]'] = korresp.typ === 'skrytka';
      mapping['topmostSubform[0].Page3[0].przegrodkapocztowa[0]'] = false; // Not used in our form
      
      if (korresp.typ === 'adres' && korresp.adres) {
        mapping['topmostSubform[0].Page3[0].Ulica2[0]'] = korresp.adres.ulica || '';
        mapping['topmostSubform[0].Page3[0].Numerdomu2[0]'] = korresp.adres.nrDomu || '';
        mapping['topmostSubform[0].Page3[0].Numerlokalu2[0]'] = korresp.adres.nrLokalu || '';
        mapping['topmostSubform[0].Page3[0].Kodpocztowy2[0]'] = korresp.adres.kodPocztowy || '';
        mapping['topmostSubform[0].Page3[0].Poczta2[0]'] = korresp.adres.miejscowosc || '';
      }
      
      // Ulica2A fields for poszkodowany correspondence (if different from main address)
      if (korresp.typ === 'adres' && korresp.adres) {
        mapping['topmostSubform[0].Page3[0].Ulica2A[0]'] = korresp.adres.ulica || '';
        mapping['topmostSubform[0].Page3[0].Numerdomu2A[0]'] = korresp.adres.nrDomu || '';
        mapping['topmostSubform[0].Page3[0].Numerlokalu2A[0]'] = korresp.adres.nrLokalu || '';
        mapping['topmostSubform[0].Page3[0].Kodpocztowy2A[0]'] = korresp.adres.kodPocztowy || '';
        mapping['topmostSubform[0].Page3[0].Poczta2A[0]'] = korresp.adres.miejscowosc || '';
      }
    }
    
    mapping['topmostSubform[0].Page3[0].Dataurodzenia[0]'] = formatDate(data.poszkodowany?.dataUrodzenia) || '';
    mapping['topmostSubform[0].Page3[0].Nazwapaństwa3[0]'] = data.adresZamieszkania?.panstwo || 'Polska';
    mapping['topmostSubform[0].Page3[0].Nazwapaństwa2[0]'] = data.adresDzialalnosci?.panstwo || 'Polska';
  }

  // ============================================
  // PAGE 4: Szczegóły wypadku (Accident Details Continued)
  // ============================================
  if (data.szczegoly) {
    const szczegoly = data.szczegoly;
    
    // Opis urazów i okoliczności
    mapping['topmostSubform[0].Page4[0].Tekst4[0]'] = szczegoly.opisUrazow || '';
    mapping['topmostSubform[0].Page4[0].Tekst5[0]'] = szczegoly.opisOkolicznosci || '';
    
    // Pierwsza pomoc medyczna
    mapping['topmostSubform[0].Page4[0].TAK6[0]'] = szczegoly.pierwszaPomoc;
    mapping['topmostSubform[0].Page4[0].NIE6[0]'] = !szczegoly.pierwszaPomoc;
    if (szczegoly.pierwszaPomoc) {
      const pierwszaPomocInfo = [
        szczegoly.pierwszaPomocNazwa,
        szczegoly.pierwszaPomocAdres
      ].filter(Boolean).join(', ') || '';
      mapping['topmostSubform[0].Page4[0].Tekst6[0]'] = pierwszaPomocInfo;
    }
    
    // Postępowanie prowadzone
    mapping['topmostSubform[0].Page4[0].TAK8[0]'] = szczegoly.postepowanieProwadzone;
    mapping['topmostSubform[0].Page4[0].NIE8[0]'] = !szczegoly.postepowanieProwadzone;
    if (szczegoly.postepowanieProwadzone) {
      const postepowanieInfo = [
        szczegoly.postepowanieOrgan,
        szczegoly.postepowanieAdres
      ].filter(Boolean).join(', ') || '';
      mapping['topmostSubform[0].Page4[0].Tekst7[0]'] = postepowanieInfo;
    }
    
    // Obsługa maszyn
    mapping['topmostSubform[0].Page4[0].TAK9[0]'] = szczegoly.obslugaMaszyn;
    mapping['topmostSubform[0].Page4[0].NIE9[0]'] = !szczegoly.obslugaMaszyn;
    if (szczegoly.obslugaMaszyn) {
      mapping['topmostSubform[0].Page4[0].Tekst8[0]'] = szczegoly.maszynyOpis || '';
    }
    
    // Atest/deklaracja zgodności
    mapping['topmostSubform[0].Page4[0].TAK10[0]'] = szczegoly.atestDeklaracja;
    mapping['topmostSubform[0].Page4[0].NIE10[0]'] = !szczegoly.atestDeklaracja;
  }

  // ============================================
  // PAGE 5: Świadkowie (Witnesses)
  // ============================================
  if (data.swiadkowie && data.swiadkowie.length > 0) {
    // Witness 1 (index 0)
    if (data.swiadkowie[0]) {
      const sw1 = data.swiadkowie[0];
      mapping['topmostSubform[0].Page5[0].Imię[0]'] = sw1.imie || '';
      mapping['topmostSubform[0].Page5[0].Nazwisko[0]'] = sw1.nazwisko || '';
      mapping['topmostSubform[0].Page5[0].Ulica[0]'] = sw1.ulica || '';
      mapping['topmostSubform[0].Page5[0].Numerdomu[0]'] = sw1.nrDomu || '';
      mapping['topmostSubform[0].Page5[0].Numerlokalu[0]'] = sw1.nrLokalu || '';
      mapping['topmostSubform[0].Page5[0].Kodpocztowy[0]'] = sw1.kodPocztowy || '';
      mapping['topmostSubform[0].Page5[0].Poczta[0]'] = sw1.miejscowosc || '';
      mapping['topmostSubform[0].Page5[0].Nazwapaństwa[0]'] = sw1.panstwo || 'Polska';
    }
    
    // Witness 2 (index 1)
    if (data.swiadkowie[1]) {
      const sw2 = data.swiadkowie[1];
      mapping['topmostSubform[0].Page5[0].Imię[1]'] = sw2.imie || '';
      mapping['topmostSubform[0].Page5[0].Nazwisko[1]'] = sw2.nazwisko || '';
      mapping['topmostSubform[0].Page5[0].Ulica[1]'] = sw2.ulica || '';
      mapping['topmostSubform[0].Page5[0].Numerdomu[1]'] = sw2.nrDomu || '';
      mapping['topmostSubform[0].Page5[0].Numerlokalu[1]'] = sw2.nrLokalu || '';
      mapping['topmostSubform[0].Page5[0].Kodpocztowy[1]'] = sw2.kodPocztowy || '';
      mapping['topmostSubform[0].Page5[0].Poczta[1]'] = sw2.miejscowosc || '';
      mapping['topmostSubform[0].Page5[0].Nazwapaństwa[1]'] = sw2.panstwo || 'Polska';
    }
    
    // Witness 3 (index 2)
    if (data.swiadkowie[2]) {
      const sw3 = data.swiadkowie[2];
      mapping['topmostSubform[0].Page5[0].Imię2[0]'] = sw3.imie || '';
      mapping['topmostSubform[0].Page5[0].Nazwisko2[0]'] = sw3.nazwisko || '';
      mapping['topmostSubform[0].Page5[0].Ulica2[0]'] = sw3.ulica || '';
      mapping['topmostSubform[0].Page5[0].Numerdomu2[0]'] = sw3.nrDomu || '';
      mapping['topmostSubform[0].Page5[0].Numerlokalu2[0]'] = sw3.nrLokalu || '';
      mapping['topmostSubform[0].Page5[0].Kodpocztowy2[0]'] = sw3.kodPocztowy || '';
      mapping['topmostSubform[0].Page5[0].Poczta2[0]'] = sw3.miejscowosc || '';
      mapping['topmostSubform[0].Page5[0].Nazwapaństwa2[0]'] = sw3.panstwo || 'Polska';
    }
  }

  // ============================================
  // PAGE 6: Załączniki i sposób odbioru (Attachments & Delivery)
  // ============================================
  // Note: These fields are not in our current form data structure
  // They would need to be added if needed:
  // - wplacowce[0], poczta[0], PUE[0] (delivery method checkboxes)
  // - ZaznaczX1[0] through ZaznaczX5[0] (attachment checkboxes)
  // - Inne[0], Inne1[0] through Inne8[0] (other fields)
  // - Data[0], Data[1] (date fields)

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
 * Uses exact field names from the PDF form
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
    
    // Optional: embed a font and update appearances for better rendering
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
    
    // Create mapping from form data (returns exact PDF field names)
    const fieldMapping = createFieldMapping(formData);
    
    // Fill each field using exact field names
    for (const [fieldName, value] of Object.entries(fieldMapping)) {
      // Skip empty strings and undefined/null values
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      try {
        // Try to get the field (will throw if doesn't exist)
        let field;
        try {
          field = form.getField(fieldName);
        } catch {
          // Field doesn't exist - skip it (might be optional)
          if (import.meta.env.DEV) {
            console.warn(`Field not found: ${fieldName}`);
          }
          continue;
        }
        
        const fieldType = field.constructor.name;
        
        // Handle different field types (including variants like PDFTextField2, PDFCheckBox2)
        if (fieldType.startsWith('PDFTextField')) {
          const textField = field as any;
          textField.setText(String(value));
        } else if (fieldType.startsWith('PDFCheckBox')) {
          const checkBox = field as any;
          if (typeof value === 'boolean') {
            if (value) {
              checkBox.check();
            } else {
              checkBox.uncheck();
            }
          } else if (typeof value === 'string') {
            // Handle string values like 'true', 'false', 'X', etc.
            const shouldCheck = value === 'true' || value === 'X' || value.toLowerCase() === 'tak';
            if (shouldCheck) {
              checkBox.check();
            } else {
              checkBox.uncheck();
            }
          }
        } else if (fieldType.startsWith('PDFRadioGroup')) {
          const radioGroup = field as any;
          // For radio groups, select the option value
          radioGroup.select(String(value));
        } else {
          // Unknown field type - try to set as text as fallback
          try {
            const textField = field as any;
            if (typeof textField.setText === 'function') {
              textField.setText(String(value));
            } else {
              if (import.meta.env.DEV) {
                console.warn(`Unknown field type ${fieldType} for field: ${fieldName}`);
              }
            }
          } catch {
            if (import.meta.env.DEV) {
              console.warn(`Unknown field type ${fieldType} for field: ${fieldName}`);
            }
          }
        }
      } catch (error) {
        // Field might not exist or be of different type - log in dev mode
        if (import.meta.env.DEV) {
          console.warn(`Error setting field ${fieldName}:`, error);
        }
      }
    }
    
    // Optional: Flatten the form to make fields non-editable
    // form.flatten();
    
    // Save the PDF
    const pdfBytesFilled = await pdfDoc.save();
    // Convert to standard Uint8Array for Blob compatibility
    const bytes = new Uint8Array(pdfBytesFilled);
    return new Blob([bytes], { type: 'application/pdf' });
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

/**
 * Logs all field names from the EWYP PDF form
 * Run this in browser console to see all available field names
 * 
 * Usage:
 *   import { logEwypFieldNames } from '@/utils/pdfFiller';
 *   logEwypFieldNames();
 */
export async function logEwypFieldNames(): Promise<void> {
  try {
    const templateBytes = await fetch('/EWYP_wypelnij_i_wydrukuj.pdf')
      .then(r => r.arrayBuffer());
    
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    const fields = form.getFields();
    
    console.group('📋 EWYP PDF Form Fields');
    console.log(`Total fields: ${fields.length}\n`);
    
    // Group fields by type
    const fieldsByType: Record<string, Array<{ name: string; type: string }>> = {};
    
    fields.forEach(field => {
      const type = field.constructor.name;
      const name = field.getName();
      
      if (!fieldsByType[type]) {
        fieldsByType[type] = [];
      }
      
      fieldsByType[type].push({ name, type });
    });
    
    // Log each type group
    Object.entries(fieldsByType).forEach(([type, fieldList]) => {
      console.group(`${type} (${fieldList.length})`);
      fieldList.forEach(({ name }) => {
        console.log(`  "${name}"`);
      });
      console.groupEnd();
    });
    
    // Also log as a flat array for easy copying
    console.group('📋 All Field Names (for copying)');
    const allNames = fields.map(f => f.getName());
    console.log(JSON.stringify(allNames, null, 2));
    console.groupEnd();
    
    // Log as a mapping object template
    console.group('📋 Field Mapping Template');
    const mappingTemplate: Record<string, string> = {};
    fields.forEach(field => {
      const name = field.getName();
      const type = field.constructor.name;
      
      if (type === 'PDFTextField') {
        mappingTemplate[name] = '';
      } else if (type === 'PDFCheckBox') {
        mappingTemplate[name] = 'false'; // or true
      } else if (type === 'PDFRadioGroup') {
        mappingTemplate[name] = ''; // value of option to select
      }
    });
    console.log(JSON.stringify(mappingTemplate, null, 2));
    console.groupEnd();
    
    console.groupEnd();
    
    return;
  } catch (error) {
    console.error('Error reading PDF fields:', error);
    throw error;
  }
}

