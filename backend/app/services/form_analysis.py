"""
Service for analyzing AccidentReportFormData completeness, consistency, and quality.
Generates AI notes (warnings/suggestions) in Polish, formal tone, without personal data.
"""
import json
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types

from app.models.schemas import AccidentReportFormData


# Schema for AI notes response
ai_notes_schema = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "notes": types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "section": types.Schema(
                        type=types.Type.STRING,
                        description="Sekcja formularza, np. 'szczegoly', 'poszkodowany', 'swiadkowie'",
                    ),
                    "message": types.Schema(
                        type=types.Type.STRING,
                        description="Wiadomość po polsku, formalnym tonem, bez danych osobowych, odnosząca się do pól formularza",
                    ),
                    "severity": types.Schema(
                        type=types.Type.STRING,
                        enum=["warning", "critical"],
                        description="Poziom ważności: 'warning' dla sugestii, 'critical' dla braków uniemożliwiających kwalifikację",
                    ),
                    "fields": types.Schema(
                        type=types.Type.ARRAY,
                        items=types.Schema(type=types.Type.STRING),
                        description="Lista ścieżek pól w notacji dot-notation (np. ['szczegoly.opis_okolicznosci', 'szczegoly.data'])",
                    ),
                    "reason": types.Schema(
                        type=types.Type.STRING,
                        enum=["missing", "insufficient", "inconsistent"],
                        description="Typ problemu: 'missing' - brak danych, 'insufficient' - niewystarczające dane, 'inconsistent' - niespójność",
                    ),
                    "suggested_action": types.Schema(
                        type=types.Type.STRING,
                        description="Opcjonalna sugestia działania, np. 'Dopytaj o dokumentację medyczną' lub 'Wymagane potwierdzenie zlecenia'",
                    ),
                },
                required=["section", "message", "severity", "fields", "reason"],
            ),
        ),
    },
    required=["notes"],
)

system_instruction_text = """
Jesteś asystentem analizującym kompletność, spójność i jakość formularza zgłoszenia wypadku przy pracy.

ZADANIE:
Przeanalizuj formularz AccidentReportFormData i wygeneruj listę notatek (ai_notes) wskazujących:
- Braki i niewystarczające dane w poszczególnych sekcjach
- Niespójności (np. daty/godziny, brak opisu urazów przy pierwszej pomocy, brak związku z pracą w opisie okoliczności)
- Pokrycie 4 kryteriów wypadku przy pracy (nagłość, przyczyna zewnętrzna, uraz, związek z pracą)
- Sugestie dopytania/dokumentów

KRYTERIA WYPADKU PRZY PRACY (4 przesłanki):
1. NAGŁOŚĆ - zdarzenie nagłe (natychmiastowe lub nie dłużej niż jedna dniówka robocza)
2. PRZYCZYNA ZEWNĘTRZNA - czynnik spoza organizmu poszkodowanego
3. URAZ - uszkodzenie tkanek ciała lub narządów
4. ZWIĄZEK Z PRACĄ - związek przyczynowy, czasowy, miejscowy i funkcjonalny

WAŻNE ZASADY:
- Brak świadków NIE jest automatyczną anomalią, ale wymaga mocnych dowodów związku z pracą
- Jeśli brak szczegoly.opis_okolicznosci i brak świadków → co najmniej jedna notatka severity=critical
- Notatki w języku polskim, formalnym tonem
- NIE używaj danych osobowych (imion, nazwisk, PESEL) - odwołuj się tylko do pól formularza
- Każda luka lub słabe uzasadnienie kryteriów → notatka z konkretnym polem/dowodem do uzupełnienia
- Może być 0/1/wiele notatek na sekcję
- Jeśli dane są kompletne i spójne → zwróć pustą listę notes

SEKCJE FORMULARZA:
- szczegoly: data, godzina, miejsce, godzina_rozpoczecia_pracy, godzina_zakonczenia_pracy, opis_urazow, opis_okolicznosci, pierwsza_pomoc, postepowanie_prowadzone, obsluga_maszyn, atest_deklaracja, ewidencja_srodkow_trwalych
- poszkodowany: dane osobowe (imie, nazwisko, pesel, data_urodzenia, miejsce_urodzenia, telefon, dokument_typ, dokument_seria, dokument_numer)
- swiadkowie: lista świadków (imie, nazwisko, adres)
- adres_zamieszkania, adres_dzialalnosci: adresy

PRZYKŁADY NOTATEK:
1. Brak opisu okoliczności + brak świadków:
   {
     "section": "szczegoly",
     "message": "Brak opisu okoliczności zdarzenia oraz brak świadków. Wymagane jest uzupełnienie pola 'opis_okolicznosci' z dokładnym opisem zdarzenia oraz dostarczenie mocnych dowodów związku z pracą (np. dokumentacja zlecenia, potwierdzenie umówienia wizyty u klienta).",
     "severity": "critical",
     "fields": ["szczegoly.opis_okolicznosci", "swiadkowie"],
     "reason": "missing",
     "suggested_action": "Dopytaj o szczegółowy opis okoliczności zdarzenia oraz dostarcz dokumenty potwierdzające związek z pracą"
   }

2. Niespójność dat:
   {
     "section": "szczegoly",
     "message": "Niespójność w datach: data zdarzenia nie jest zgodna z godziną rozpoczęcia pracy. Wymagana weryfikacja.",
     "severity": "warning",
     "fields": ["szczegoly.data", "szczegoly.godzina_rozpoczecia_pracy"],
     "reason": "inconsistent"
   }

3. Brak opisu urazów przy pierwszej pomocy:
   {
     "section": "szczegoly",
     "message": "Zaznaczono pierwszą pomoc, ale brak opisu urazów. Wymagane uzupełnienie pola 'opis_urazow'.",
     "severity": "warning",
     "fields": ["szczegoly.opis_urazow", "szczegoly.pierwsza_pomoc"],
     "reason": "insufficient"
   }

4. Brak związku z pracą w opisie:
   {
     "section": "szczegoly",
     "message": "Opis okoliczności nie zawiera wyraźnego związku z wykonywaniem pracy. Wymagane doprecyzowanie związku przyczynowego, czasowego, miejscowego i funkcjonalnego z pracą.",
     "severity": "critical",
     "fields": ["szczegoly.opis_okolicznosci"],
     "reason": "insufficient",
     "suggested_action": "Dopytaj o szczegóły wykonywanej pracy w momencie zdarzenia oraz potwierdzenie zlecenia/umowy"
   }

FORMAT WYJŚCIA:
Zwróć JSON z listą notes. Każda notatka musi mieć: section, message (PL, formalny), severity (warning/critical), fields (lista ścieżek dot-notation), reason (missing/insufficient/inconsistent), opcjonalnie suggested_action.
"""


def analyze_form_data(
    form_data: AccidentReportFormData,
    validation_errors: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Analyze form data completeness, consistency, and quality.
    Returns list of AI notes (warnings/suggestions).
    
    Args:
        form_data: Current AccidentReportFormData
        validation_errors: Current validation errors from validate_form_data
        
    Returns:
        List of AI notes, each with: section, message, severity, fields, reason, optional suggested_action
    """
    client = genai.Client()
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction_text,
        temperature=0.3,  # Low temperature for determinism
        response_mime_type="application/json",
        response_schema=ai_notes_schema
    )
    
    # Prepare form data as JSON for analysis
    # We include actual content for analysis, but system instruction ensures
    # that personal data is not used in the output notes
    form_dict = form_data.model_dump()
    
    # Prepare analysis data with actual content for consistency checking
    # Personal data is included for analysis but won't appear in ai_notes due to system instruction
    analysis_data = {
        "szczegoly": {
            "data": form_dict["szczegoly"]["data"],
            "godzina": form_dict["szczegoly"]["godzina"],
            "miejsce": form_dict["szczegoly"]["miejsce"],
            "godzina_rozpoczecia_pracy": form_dict["szczegoly"]["godzina_rozpoczecia_pracy"],
            "godzina_zakonczenia_pracy": form_dict["szczegoly"]["godzina_zakonczenia_pracy"],
            "opis_urazow": form_dict["szczegoly"]["opis_urazow"],
            "opis_okolicznosci": form_dict["szczegoly"]["opis_okolicznosci"],
            "pierwsza_pomoc": form_dict["szczegoly"]["pierwsza_pomoc"],
            "pierwsza_pomoc_nazwa": form_dict["szczegoly"].get("pierwsza_pomoc_nazwa"),
            "pierwsza_pomoc_adres": form_dict["szczegoly"].get("pierwsza_pomoc_adres"),
            "postepowanie_prowadzone": form_dict["szczegoly"]["postepowanie_prowadzone"],
            "postepowanie_organ": form_dict["szczegoly"].get("postepowanie_organ"),
            "postepowanie_adres": form_dict["szczegoly"].get("postepowanie_adres"),
            "obsluga_maszyn": form_dict["szczegoly"]["obsluga_maszyn"],
            "maszyny_sprawne": form_dict["szczegoly"].get("maszyny_sprawne"),
            "maszyny_zgodnie_z_zasadami": form_dict["szczegoly"].get("maszyny_zgodnie_z_zasadami"),
            "maszyny_opis": form_dict["szczegoly"].get("maszyny_opis"),
            "atest_deklaracja": form_dict["szczegoly"]["atest_deklaracja"],
            "ewidencja_srodkow_trwalych": form_dict["szczegoly"]["ewidencja_srodkow_trwalych"],
        },
        "poszkodowany": {
            "imie_wypelnione": bool(form_dict["poszkodowany"]["imie"]),
            "nazwisko_wypelnione": bool(form_dict["poszkodowany"]["nazwisko"]),
            "pesel_wypelnione": bool(form_dict["poszkodowany"]["pesel"]),
            "data_urodzenia_wypelnione": bool(form_dict["poszkodowany"]["data_urodzenia"]),
            "telefon_wypelnione": bool(form_dict["poszkodowany"]["telefon"]),
            "dokument_typ_wypelnione": bool(form_dict["poszkodowany"]["dokument_typ"]),
        },
        "swiadkowie": {
            "liczba": len(form_dict["swiadkowie"]),
            "wszyscy_wypelnieni": all(
                w.get("imie") and w.get("nazwisko") 
                for w in form_dict["swiadkowie"]
            ) if form_dict["swiadkowie"] else False,
        },
        "validation_errors": validation_errors,
    }
    
    prompt = f"""
Przeanalizuj poniższy formularz zgłoszenia wypadku przy pracy i wygeneruj listę notatek (ai_notes) wskazujących braki, niespójności i sugestie uzupełnienia.

Dane formularza:
{json.dumps(analysis_data, ensure_ascii=False, indent=2)}

Błędy walidacji:
{json.dumps(validation_errors, ensure_ascii=False, indent=2)}

Przeanalizuj:
1. Kompletność danych w każdej sekcji
2. Spójność (daty, godziny, opisy)
3. Pokrycie 4 kryteriów wypadku przy pracy (nagłość, przyczyna zewnętrzna, uraz, związek z pracą)
4. Sugestie dopytania/dokumentów

Zwróć listę notatek zgodnie ze schematem. Jeśli formularz jest kompletny i spójny, zwróć pustą listę.
"""
    
    contents = [prompt]
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            config=config,
            contents=contents
        )
        
        result = json.loads(response.text)
        return result.get("notes", [])
    except Exception as e:
        print(f"[Form Analysis] Error: {e}")
        # Return empty list on error
        return []

