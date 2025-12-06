import json
import uuid
from copy import deepcopy
from typing import Dict, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from google import genai
from google.genai import types

from app.models.schemas import (
    AccidentReportFormData,
    ChatMessageRequest,
    ChatMessageResponse,
    ChatAction,
    FormStateResponse,
    PersonData,
    Address,
    BusinessAddress,
    AccidentDetails,
)
from app.utils.validation import validate_pesel

router = APIRouter(prefix="/api", tags=["chat"])

# In-memory session storage (MVP - simple dict)
sessions: Dict[str, dict] = {}


def get_initial_form_data() -> AccidentReportFormData:
    """Create initial empty form data."""
    return AccidentReportFormData(
        poszkodowany=PersonData(
            pesel="",
            dokument_typ="",
            dokument_seria="",
            dokument_numer="",
            imie="",
            nazwisko="",
            data_urodzenia="",
            miejsce_urodzenia="",
            telefon="",
        ),
        adres_zamieszkania=Address(
            ulica="",
            nr_domu="",
            nr_lokalu="",
            kod_pocztowy="",
            miejscowosc="",
        ),
        mieszka_za_granica=False,
        inny_adres_korespondencyjny=False,
        adres_dzialalnosci=BusinessAddress(
            ulica="",
            nr_domu="",
            nr_lokalu="",
            kod_pocztowy="",
            miejscowosc="",
        ),
        zglaszajacy_inny=False,
        szczegoly=AccidentDetails(
            data="",
            godzina="",
            miejsce="",
            godzina_rozpoczecia_pracy="",
            godzina_zakonczenia_pracy="",
            opis_urazow="",
            opis_okolicznosci="",
            pierwsza_pomoc=False,
            postepowanie_prowadzone=False,
            obsluga_maszyn=False,
            atest_deklaracja=False,
            ewidencja_srodkow_trwalych=False,
        ),
        swiadkowie=[],
    )


def validate_form_data(form_data: AccidentReportFormData) -> Dict[str, Any]:
    """Validate form data and return validation errors."""
    errors: Dict[str, Any] = {}
    
    # Validate PESEL
    if form_data.poszkodowany.pesel:
        pesel_valid, pesel_error = validate_pesel(form_data.poszkodowany.pesel)
        if not pesel_valid:
            errors["poszkodowany.pesel"] = pesel_error
    
    # Check required fields (basic validation)
    required_fields = [
        ("poszkodowany.imie", form_data.poszkodowany.imie),
        ("poszkodowany.nazwisko", form_data.poszkodowany.nazwisko),
        ("poszkodowany.pesel", form_data.poszkodowany.pesel),
        ("szczegoly.data", form_data.szczegoly.data),
        ("szczegoly.miejsce", form_data.szczegoly.miejsce),
    ]
    
    for field_path, value in required_fields:
        if not value or (isinstance(value, str) and not value.strip()):
            if field_path not in errors:
                errors[field_path] = "To pole jest wymagane"
    
    return errors


def is_form_complete(form_data: AccidentReportFormData) -> bool:
    """Check if form has all required fields filled."""
    validation = validate_form_data(form_data)
    return len(validation) == 0


# System prompt for the agent (hardcoded MVP)
SYSTEM_PROMPT = r"""
Jesteś asystentem AI, który zachowuje się jak spokojny, uprzejmy urzędnik
pomagający osobie poszkodowanej w wypadku przy pracy (lub w związku z pracą).

Rozmowa służy DO UZUPEŁNIANIA FORMULARZA ZGŁOSZENIA WYPADKU.

ZA KAŻDYM RAZEM DOSTAJESZ:
- FORMULARZ (aktualny stan) w JSON,
- OSTATNIE_PYTANIE (które zadałeś w poprzednim kroku – może być puste na początku),
- ODPOWIEDZ_UZYTKOWNIKA (ostatnia wiadomość użytkownika).

Twoje zadania w KAŻDEJ TURZE:
1. Na podstawie ODPOWIEDZ_UZYTKOWNIKA zaktualizuj tylko te pola formularza, których dotyczyło OSTATNIE_PYTANIE
   (lub ustal rozsądne pola, jeśli OSTATNIE_PYTANIE jest puste – początek rozmowy).
2. Przygotuj następne krótkie pytanie / komunikat dla użytkownika, aby zebrać kolejne brakujące informacje.
3. Jeśli odpowiedź użytkownika jest typu „co?”, „nie rozumiem” itp., nie aktualizuj formularza – po prostu
   uprzejmie powtórz lub doprecyzuj poprzednie pytanie.

STRUKTURA FORMULARZA (używaj ścieżek z kropkami):
- poszkodowany.imie, poszkodowany.nazwisko, poszkodowany.pesel, poszkodowany.data_urodzenia, poszkodowany.miejsce_urodzenia
- poszkodowany.dokument_typ, poszkodowany.dokument_seria, poszkodowany.dokument_numer, poszkodowany.telefon
- adres_zamieszkania.ulica, adres_zamieszkania.nr_domu, adres_zamieszkania.nr_lokalu, adres_zamieszkania.kod_pocztowy, adres_zamieszkania.miejscowosc
- mieszka_za_granica (boolean), ostatni_adres_pl (jeśli mieszka_za_granica=true)
- inny_adres_korespondencyjny (boolean), adres_korespondencyjny (jeśli inny_adres_korespondencyjny=true)
- adres_dzialalnosci.ulica, adres_dzialalnosci.nr_domu, adres_dzialalnosci.nr_lokalu, adres_dzialalnosci.kod_pocztowy, adres_dzialalnosci.miejscowosc, adres_dzialalnosci.telefon
- zglaszajacy_inny (boolean), zglaszajacy (jeśli zglaszajacy_inny=true)
- szczegoly.data, szczegoly.godzina, szczegoly.miejsce
- szczegoly.godzina_rozpoczecia_pracy, szczegoly.godzina_zakonczenia_pracy
- szczegoly.opis_urazow, szczegoly.opis_okolicznosci
- szczegoly.pierwsza_pomoc (boolean), szczegoly.pierwsza_pomoc_nazwa, szczegoly.pierwsza_pomoc_adres
- szczegoly.postepowanie_prowadzone (boolean), szczegoly.postepowanie_organ, szczegoly.postepowanie_adres
- szczegoly.obsluga_maszyn (boolean), szczegoly.maszyny_sprawne, szczegoly.maszyny_zgodnie_z_zasadami, szczegoly.maszyny_opis
- szczegoly.atest_deklaracja (boolean), szczegoly.ewidencja_srodkow_trwalych (boolean)
- swiadkowie (lista obiektów z: id, imie, nazwisko, ulica, nr_domu, nr_lokalu, kod_pocztowy, miejscowosc)

FORMAT ODPOWIEDZI (OBOWIĄZKOWY):

Zawsze zwracaj WYŁĄCZNIE poprawny JSON (bez dodatkowego tekstu) o strukturze:

{
  "message_for_user": "Krótkie pytanie lub komunikat po polsku, maks. 1–2 zdania.",
  "form_update": {
    "poszkodowany.imie": "Jan",
    "poszkodowany.nazwisko": "Kowalski",
    ...
  },
  "actions": [
    {"type": "set_field", "field": "poszkodowany.imie", "value": "Jan"},
    {"type": "confirm_field", "field": "poszkodowany.imie"}
  ]
}

ZASADY:
- Jeśli z odpowiedzi użytkownika nic sensownego nie wynika (np. „co?”), użyj pustego obiektu:
    "form_update": {}
  i powtórz / doprecyzuj poprzednie pytanie w "message_for_user".
- Nie nadpisuj pól losowo – tylko wtedy, gdy odpowiedź naprawdę zawiera dane do danego pola.
- Możesz w jednym kroku zaktualizować więcej niż jedno pole (np. imię i nazwisko).
- Nie zadawaj kilku pytań naraz – jedno główne pytanie na raz.
- Styl: krótko, uprzejmie, rzeczowo.
- Gdy formularz jest kompletny, poinformuj użytkownika i zakończ rozmowę.
"""


def parse_model_json(raw: str) -> dict:
    """Parse JSON from model response."""
    raw = raw.strip()
    try:
        return json.loads(raw)
    except Exception:
        pass
    
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        snippet = raw[start : end + 1]
        try:
            return json.loads(snippet)
        except Exception:
            pass
    
    return {}


def call_model(form_data: dict, last_question: str, user_text: str) -> dict:
    """Call Gemini model to process user message."""
    try:
        client = genai.Client(api_key="AIzaSyBJqwO9RY5tmvCBaXemukSrC9qnvHG24bg")
        
        payload = {
            "FORMULARZ": form_data,
            "OSTATNIE_PYTANIE": last_question,
            "ODPOWIEDZ_UZYTKOWNIKA": user_text,
        }
        
        contents = [json.dumps(payload, ensure_ascii=False)]
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
            ),
        )
        
        raw = response.text or ""
        data = parse_model_json(raw)
        
        if not isinstance(data, dict) or "message_for_user" not in data:
            data = {
                "message_for_user": (
                    "Przepraszam, spróbujmy dalej. Proszę podać kolejną informację "
                    "dotyczącą wypadku (np. imię i nazwisko poszkodowanego)."
                ),
                "form_update": {},
                "actions": [],
            }
        
        if "form_update" not in data or not isinstance(data["form_update"], dict):
            data["form_update"] = {}
        
        if "actions" not in data or not isinstance(data["actions"], list):
            data["actions"] = []
        
        return data
    except Exception as e:
        print(f"Error calling model: {e}")
        return {
            "message_for_user": "Przepraszam, wystąpił błąd. Spróbujmy dalej. Proszę podać kolejną informację.",
            "form_update": {},
            "actions": [],
        }


def apply_form_updates(form_data: AccidentReportFormData, updates: Dict[str, Any]) -> AccidentReportFormData:
    """Apply updates to form data using dot notation paths."""
    form_dict = form_data.model_dump()
    
    for path, value in updates.items():
        keys = path.split(".")
        current = form_dict
        for key in keys[:-1]:
            if key not in current:
                break
            current = current[key]
        else:
            current[keys[-1]] = value
    
    return AccidentReportFormData(**form_dict)


@router.get("/form/state", response_model=FormStateResponse)
async def get_form_state(sessionId: Optional[str] = None):
    """Get current form state for a session."""
    if not sessionId or sessionId not in sessions:
        # Return initial empty state
        form_data = get_initial_form_data()
        validation = validate_form_data(form_data)
        return FormStateResponse(
            fields=form_data,
            validation=validation,
            readyToSkip=False,
        )
    
    session = sessions[sessionId]
    form_data = session["form_data"]
    validation = validate_form_data(form_data)
    ready_to_skip = session.get("ready_to_skip", False)
    
    return FormStateResponse(
        fields=form_data,
        validation=validation,
        readyToSkip=ready_to_skip,
    )


@router.post("/chat/message", response_model=ChatMessageResponse)
async def chat_message(request: ChatMessageRequest):
    """Process chat message and return agent response with actions."""
    # Get or create session
    session_id = request.sessionId
    if not session_id:
        session_id = str(uuid.uuid4())
    
    if session_id not in sessions:
        sessions[session_id] = {
            "form_data": get_initial_form_data(),
            "last_question": "",
            "created_at": datetime.now(),
        }
    
    session = sessions[session_id]
    form_data = session["form_data"]
    last_question = session.get("last_question", "")
    
    # Convert form data to dict for model
    form_dict = form_data.model_dump()
    
    # Call model
    model_response = call_model(form_dict, last_question, request.message)
    
    # Apply form updates
    form_updates = model_response.get("form_update", {})
    if form_updates:
        form_data = apply_form_updates(form_data, form_updates)
        session["form_data"] = form_data
    
    # Update last question
    message_for_user = model_response.get("message_for_user", "Proszę podać kolejną informację.")
    session["last_question"] = message_for_user
    
    # Check if form is complete
    validation = validate_form_data(form_data)
    if len(validation) == 0:
        session["ready_to_skip"] = True
        message_for_user = (
            "Dziękuję za wszystkie informacje. Formularz został uzupełniony. "
            "Możesz teraz przejść do ekranu akceptacji, aby sprawdzić i ewentualnie poprawić dane."
        )
    
    # Build actions from model response
    actions = []
    for action_data in model_response.get("actions", []):
        actions.append(ChatAction(
            type=action_data.get("type", "set_field"),
            field=action_data.get("field", ""),
            value=action_data.get("value"),
        ))
    
    # Also add actions from form_updates
    for field_path, value in form_updates.items():
        actions.append(ChatAction(
            type="set_field",
            field=field_path,
            value=value,
        ))
    
    ready_to_skip = session.get("ready_to_skip", False)
    
    return ChatMessageResponse(
        reply=message_for_user,
        actions=actions,
        updatedState=form_data,
        sessionId=session_id,
        readyToSkip=ready_to_skip,
    )


@router.post("/form/skip")
async def skip_to_acceptance(sessionId: str):
    """Mark session as ready to skip to acceptance screen."""
    if sessionId not in sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    
    sessions[sessionId]["ready_to_skip"] = True
    return {"success": True, "readyToSkip": True}

