import os
import json
from copy import deepcopy
from google import genai
from google.genai import types

# ------------------------------------------------------------
# 1. SZABLON FORMULARZA – POLA DO UZUPEŁNIENIA
# ------------------------------------------------------------

FORM_TEMPLATE = {
    # dane osobowe
    "imie": "",
    "nazwisko": "",
    "pesel": "",
    "data_urodzenia": "",
    "miejsce_urodzenia": "",
    "dokument_tozsamosci": "",
    "adres_zamieszkania": "",
    "adres_korespondencyjny": "",
    "telefon": "",
    "obywatelstwo": "",
    # praca / działalność
    "forma_zatrudnienia": "",
    "pracodawca": "",
    "adres_pracodawcy": "",
    "stanowisko": "",
    "rodzaj_umowy": "",
    "zakres_prac": "",
    # osoba zgłaszająca (jeśli nie poszkodowany)
    "osoba_zglaszajaca_imie_nazwisko": "",
    "osoba_zglaszajaca_pesel": "",
    "osoba_zglaszajaca_data_urodzenia": "",
    "osoba_zglaszajaca_miejsce_urodzenia": "",
    "osoba_zglaszajaca_obywatelstwo": "",
    "osoba_zglaszajaca_dokument_tozsamosci": "",
    "osoba_zglaszajaca_adres": "",
    "osoba_zglaszajaca_adres_korespondencyjny": "",
    "osoba_zglaszajaca_telefon": "",
    # czas i miejsce wypadku
    "data_wypadku": "",
    "godzina_wypadku": "",
    "miejsce_wypadku": "",
    "wojewodztwo": "",
    "powiat": "",
    "gmina": "",
    "miejsce_wykonywania_pracy": "",
    # godziny pracy
    "godzina_rozpoczecia_pracy_plan": "",
    "godzina_zakonczenia_pracy_plan": "",
    "godzina_rozpoczecia_pracy_fakt": "",
    "nadgodziny_opis": "",
    # przebieg zdarzenia
    "czynnosci_przed_wypadkiem": "",
    "czynnosci_bezposrednio_przed": "",
    "opis_przebiegu_wypadku": "",
    "przyczyny_techniczne": "",
    "przyczyny_ludzkie": "",
    "przyczyny_organizacyjne": "",
    # maszyny / urządzenia
    "maszyna_nazwa_typ": "",
    "maszyna_rok": "",
    "maszyna_sprawnosc": "",
    "maszyna_sposob_uzytkowania": "",
    # środki ochrony / asekuracja
    "srodki_ochrony": "",
    "srodki_ochrony_sprawnosc": "",
    "obowiazek_srodkow_ochrony": "",
    "asekuracja_powinna_byc": "",
    "asekuracja_rzeczywista": "",
    # BHP / przygotowanie
    "kwalifikacje_uprawnienia": "",
    "szkolenie_bhp": "",
    "szkolenie_bhp_data": "",
    "ocena_ryzyka": "",
    "ocena_ryzyka_srodki": "",
    "przestrzeganie_bhp": "",
    "naruszone_zasady_bhp": "",
    # trzeźwość / środki odurzające
    "stan_trzezwosci": "",
    "badanie_trzezwosci": "",
    "badanie_trzezwosci_szczegoly": "",
    "badania_inne": "",
    # organy / zgłoszenia
    "policja_wezwana": "",
    "inne_organy": "",
    "status_postepowan": "",
    "protokol_powypadkowy": "",
    "data_pierwszego_zgloszenia": "",
    "pierwsze_zgloszenie_do_kogo": "",
    # świadkowie
    "swiadkowie_opis": "",
    # urazy / pierwsza pomoc / leczenie
    "urazy_opis": "",
    "pierwsza_pomoc_opis": "",
    "placowka_medyczna": "",
    "godzina_zgloszenia_do_placowki": "",
    "hospitalizacja_opis": "",
    "rozpoznania_medyczne": "",
    "zwolnienia_lekarskie_okres": "",
    "zwolnienie_przed_wypadkiem": "",
    "nastepstwa_dlugo_trwale": "",
    # dokumenty / oświadczenia
    "uwagi_do_dokumentow": "",
    "dokumenty_dodatkowe_opis": "",
    "potwierdzenie_prawdziwosci": "",
    "pouczenie_o_odpowiedzialnosci": "",
}

# ------------------------------------------------------------
# 2. SYSTEM PROMPT – MODEL PYTA I AKTUALIZUJE FORMULARZ
# ------------------------------------------------------------

SYSTEM_PROMPT = r"""
Jesteś asystentem AI, który zachowuje się jak spokojny, uprzejmy urzędnik
pomagający osobie poszkodowanej w wypadku przy pracy (lub w związku z pracą).

Rozmowa służy DO UZUPEŁNIANIA FORMULARZA (słownik z polami, np. imie, nazwisko, pesel, itd.).

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

KLUCZE FORMULARZA:
Możesz uzupełniać tylko klucze, które są w słowniku formularza, m.in.:
imie, nazwisko, pesel, data_urodzenia, miejsce_urodzenia, dokument_tozsamosci,
adres_zamieszkania, adres_korespondencyjny, telefon, obywatelstwo,
forma_zatrudnienia, pracodawca, adres_pracodawcy, stanowisko, rodzaj_umowy, zakres_prac,
osoba_zglaszajaca_imie_nazwisko, osoba_zglaszajaca_pesel, osoba_zglaszajaca_data_urodzenia,
osoba_zglaszajaca_miejsce_urodzenia, osoba_zglaszajaca_obywatelstwo,
osoba_zglaszajaca_dokument_tozsamosci, osoba_zglaszajaca_adres,
osoba_zglaszajaca_adres_korespondencyjny, osoba_zglaszajaca_telefon,
data_wypadku, godzina_wypadku, miejsce_wypadku, wojewodztwo, powiat, gmina,
miejsce_wykonywania_pracy,
godzina_rozpoczecia_pracy_plan, godzina_zakonczenia_pracy_plan,
godzina_rozpoczecia_pracy_fakt, nadgodziny_opis,
czynnosci_przed_wypadkiem, czynnosci_bezposrednio_przed, opis_przebiegu_wypadku,
przyczyny_techniczne, przyczyny_ludzkie, przyczyny_organizacyjne,
maszyna_nazwa_typ, maszyna_rok, maszyna_sprawnosc, maszyna_sposob_uzytkowania,
srodki_ochrony, srodki_ochrony_sprawnosc, obowiazek_srodkow_ochrony,
asekuracja_powinna_byc, asekuracja_rzeczywista,
kwalifikacje_uprawnienia, szkolenie_bhp, szkolenie_bhp_data,
ocena_ryzyka, ocena_ryzyka_srodki, przestrzeganie_bhp, naruszone_zasady_bhp,
stan_trzezwosci, badanie_trzezwosci, badanie_trzezwosci_szczegoly, badania_inne,
policja_wezwana, inne_organy, status_postepowan, protokol_powypadkowy,
data_pierwszego_zgloszenia, pierwsze_zgloszenie_do_kogo,
swiadkowie_opis,
urazy_opis, pierwsza_pomoc_opis, placowka_medyczna, godzina_zgloszenia_do_placowki,
hospitalizacja_opis, rozpoznania_medyczne, zwolnienia_lekarskie_okres,
zwolnienie_przed_wypadkiem, nastepstwa_dlugo_trwale,
uwagi_do_dokumentow, dokumenty_dodatkowe_opis,
potwierdzenie_prawdziwosci, pouczenie_o_odpowiedzialnosci.

FORMAT ODPOWIEDZI (OBOWIĄZKOWY):

Zawsze zwracaj WYŁĄCZNIE poprawny JSON (bez dodatkowego tekstu) o strukturze:

{
  "message_for_user": "Krótkie pytanie lub komunikat po polsku, maks. 1–2 zdania.",
  "form_update": {
    "nazwa_pola_1": "nowa wartość",
    "nazwa_pola_2": "nowa wartość"
  }
}

ZASADY:
- Jeśli z odpowiedzi użytkownika nic sensownego nie wynika (np. „co?”), użyj pustego obiektu:
    "form_update": {}
  i powtórz / doprecyzuj poprzednie pytanie w "message_for_user".
- Nie nadpisuj pól losowo – tylko wtedy, gdy odpowiedź naprawdę zawiera dane do danego pola.
- Możesz w jednym kroku zaktualizować więcej niż jedno pole (np. imię i nazwisko).
- Nie zadawaj kilku pytań naraz – jedno główne pytanie na raz.
- Styl: krótko, uprzejmie, rzeczowo.

PRZYKŁAD (SCHEMAT):

Jeśli OSTATNIE_PYTANIE brzmiało „Proszę podać imię i nazwisko”,
a ODPOWIEDZ_UZYTKOWNIKA: „Jakub Kiernozek”

to odpowiedź powinna wyglądać np. tak:

{
  "message_for_user": "Dziękuję. Jaki jest Pana PESEL?",
  "form_update": {
    "imie": "Jakub",
    "nazwisko": "Kiernozek"
  }
}

Jeśli użytkownik napisał „co?” i nie odpowiada na pytanie:

{
  "message_for_user": "Chodzi mi o Pana imię i nazwisko. Proszę je podać.",
  "form_update": {}
}
"""


client = genai.Client(api_key="AIzaSyBJqwO9RY5tmvCBaXemukSrC9qnvHG24bg")

# ------------------------------------------------------------
# 4. POMOCNICZA FUNKCJA: BEZPIECZNE PARSOWANIE JSON Z ODPOWIEDZI
# ------------------------------------------------------------


def parse_model_json(raw: str) -> dict:
    """
    Próbuje sparsować JSON z tekstu modelu.
    1. json.loads na całym tekście,
    2. jak się nie uda – wycinamy fragment od pierwszej '{' do ostatniej '}'.
    Jak dalej się nie uda, zwracamy {}.
    """
    raw = raw.strip()
    # próba 1
    try:
        return json.loads(raw)
    except Exception:
        pass

    # próba 2 – wycięcie fragmentu { ... }
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1 and end > start:
        snippet = raw[start : end + 1]
        try:
            return json.loads(snippet)
        except Exception:
            pass

    return {}


# ------------------------------------------------------------
# 5. WYWOŁANIE MODELU – PODAJEMY FORMULARZ + OSTATNIE PYTANIE + ODPOWIEDŹ
# ------------------------------------------------------------


def call_model(form_data: dict, last_question: str, user_text: str) -> dict:
    """
    Wywołuje Gemini:
    - przekazuje aktualny formularz (JSON),
    - ostatnie pytanie,
    - odpowiedź użytkownika.

    Zwraca dict:
        {
          "message_for_user": "...",
          "form_update": { ... }
        }
    """
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
        # fallback – nie wywalaj programu, tylko bezpieczny komunikat
        print("UWAGA: model zwrócił niepoprawny JSON, używam fallback.")
        print("Otrzymana odpowiedź:\n", raw, "\n")

        data = {
            "message_for_user": (
                "Przepraszam, spróbujmy dalej. Proszę podać kolejną informację "
                "dotyczącą wypadku (np. imię i nazwisko poszkodowanego)."
            ),
            "form_update": {},
        }

    if "form_update" not in data or not isinstance(data["form_update"], dict):
        data["form_update"] = {}

    return data


# ------------------------------------------------------------
# 6. GŁÓWNA PĘTLA CZATU – FORMULARZ + PYTANIA
# ------------------------------------------------------------


def main():
    print("Asystent ZUS (Gemini 2.5 Flash). Wpisz 'exit' aby zakończyć.\n")

    form_data = deepcopy(FORM_TEMPLATE)
    last_question = ""  # ostatnie pytanie zadane przez model

    while True:
        try:
            user_input = input("Ty: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nPrzerwano przez użytkownika.\n")
            break

        # Wyjście: drukujemy zebrany formularz
        if user_input.lower() in ("exit", "quit", "koniec"):
            print("\n--- ZEBRANE INFORMACJE (FORMULARZ) ---\n")
            non_empty = False
            for key, value in form_data.items():
                if value:
                    non_empty = True
                    print(f"{key}: {value}")
            if not non_empty:
                print("Brak uzupełnionych danych.")
            print("\nZakończono.\n")
            break

        # Wywołanie modelu z aktualnym formularzem + ostatnim pytaniem
        data = call_model(form_data, last_question, user_input)

        # Aktualizacja formularza
        for k, v in data.get("form_update", {}).items():
            if k in form_data:
                form_data[k] = v

        # Nowe pytanie / komunikat dla użytkownika
        message_for_user = data.get("message_for_user", "").strip()
        if not message_for_user:
            message_for_user = "Proszę podać kolejną informację dotyczącą wypadku."

        print(f"\nAsystent: {message_for_user}\n")
        last_question = message_for_user  # zapisujemy, żeby wiedzieć, do czego jest kolejna odpowiedź


if __name__ == "__main__":
    main()
