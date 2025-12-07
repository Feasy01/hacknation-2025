from dataclasses import dataclass
import json
import os
from google import genai
from google.genai import types
import pathlib
from dotenv import load_dotenv

# Load environment variables from app/.env
_env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(_env_path)

# Global client singleton - kept in memory to prevent garbage collection
_GENAI_CLIENT = None
_CLIENT_REFS = []  # Keep strong reference to prevent GC

def _get_client():
    """Get or create singleton GenAI client."""
    global _GENAI_CLIENT, _CLIENT_REFS
    if _GENAI_CLIENT is None:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        _GENAI_CLIENT = genai.Client(api_key=api_key)
        _CLIENT_REFS.append(_GENAI_CLIENT)  # Prevent garbage collection
    return _GENAI_CLIENT

@dataclass
class ZUSOpinion():
    grade: str
    justification: str
    circumstances: str | None = None
    anomalies: str | None = None

response_schema = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "grade": types.Schema(
            type=types.Type.STRING,
            description="Ocena, czy zdarzenie jest wypadkiem przy pracy czy nie.",
            enum=[
                "Tak, jest to wypadek przy pracy",
                "Nie, nie jest to wypadek przy pracy",
                "Brakuje dokumentów lub informacji, aby podjąć decyzję",
                "Wymaga dodatkowej analizy"
            ]
        ),
        "justification": types.Schema(
            type=types.Type.STRING,
            description="Uzasadnienie oceny. Powinno zawierać odniesienia do 4 przesłanek określonych w polskim prawie pracy tj. nagłe zdarzenie, przyczyna zewnętrzna, związek z pracą (przyczynowy, czasowy, miejscowy i funkcjonalny) oraz uszczerbek na zdrowiu. Należy unikać ogólników i podać konkretne fakty z opisu zdarzenia.",
        ),
        "circumstances": types.Schema(
            type=types.Type.STRING,
            description="Zwięzły opis okoliczności zdarzenia",
        ),
        "anomalies": types.Schema(
            type=types.Type.STRING,
            description="Nieprawidłowości lub rozbieżności w zgłoszeniu, jeśli występują np. niezgodne daty lub miejsca zdarzenia, niezgodności w opisie przyczyn lub skutków zdarzenia, itp. Brak świadków nie jest anomalią.",
        )
    },
    required=[
        "grade",
        "justification",
        "circumstances"
    ]
)

system_instruction_text = """
Jesteś asystentem ZUS wspierającym proces kwalifikacji zdarzeń jako wypadki przy pracy.
Twoim zadaniem jest analiza zgłoszenia i przygotowanie projektu opinii oraz kwalifikacji prawnej.

KRYTERIA OCENY (Zgodnie z ustawą wypadkową):
Aby uznać zdarzenie za wypadek przy pracy, muszą wystąpić ŁĄCZNIE wszystkie cztery elementy:

1. NAGŁOŚĆ:
   - Zdarzenie musi być nagłe.
   - Oznacza to natychmiastowe ujawnienie się przyczyny lub jej działanie nie dłużej niż przez jedną dniówkę roboczą.
   - Przykłady: wybuch, upadek, ale też kilkugodzinne działanie czadu.

2. PRZYCZYNA ZEWNĘTRZNA:
   - Czynnik musi pochodzić spoza organizmu poszkodowanego.
   - Przykłady: maszyny, prąd, śliska podłoga, siły natury.
   - UWAGA: Sam uraz wewnętrzny (np. zawał, wylew) bez czynnika zewnętrznego (np. stresu o nadzwyczajnym nasileniu) zazwyczaj nie spełnia tego warunku.

3. URAZ:
   - Musi nastąpić uszkodzenie tkanek ciała lub narządów wskutek działania czynnika zewnętrznego.
   - W przypadku śmierci - zgon poszkodowanego.

4. ZWIĄZEK Z PRACĄ:
   - Zdarzenie musi nastąpić w okresie ubezpieczenia wypadkowego (zakładamy, że tak jest, chyba że w zgłoszeniu podano inaczej).
   - Musi wystąpić podczas wykonywania zwykłych czynności związanych z prowadzeniem działalności.
   - Musi zachodzić związek przyczynowy, czasowy, miejscowy i funkcjonalny.
   - Powiązanie wypadku z wykonywaniem pracy zarobkowej musi być oczywiste i nie może opierać się na domysłach lub tłumaczeniu poszkodowanego. Zakładaj, że poszkodowany będzie kłamać lub kombinować w celu wyłudzenia świadczeń (np. opisując wypadek jako związany z pracą, gdy tak nie jest, bo robił coś dla siebie lub rodziny). Bądź bardzo krytyczny wobec podawanych okoliczności i jak coś nawet delikatnie wzbudza Twoje wątpliwości to daj ocenę "Wymaga dodatkowej analizy", nawet jak wszystkie 4 kryteria są spełnione, a poszkodowany próbuje to tłumaczyć.
   - Jeśli wykonywana czynność nie jest zwykłą, regularną czynnością związaną z wykonywaną działalnością gospodarczą (np. czynności pomocnicze, czynności nieregularne), to poszkodowany musi dostarczyć bardzo mocne dowody na związek z pracą (np. umowy świadczenia usług, dokumenty zlecenia, potwierdzenie umówienia wizyty u klienta, fakturę VAT, itp.). W przypadku braku takich dowodów daj ocenę "Wymaga dodatkowej analizy". - Brak świadków sam w sobie nie jest powodem do odrzucenia zgłoszenia, ale wymaga to bardzo dokładnej analizy pozostałych dowodów.
   - W przypadku, gdy zlecenie było wykonywane na rzecz rodziny, znajomych lub własnych celów/przedmiotów, to związek z pracą musi być bardzo dobrze udokumentowany (np. faktury, umowy, potwierdzenia przelewów, itp.). W przeciwnym razie daj ocenę "Nie, nie jest to wypadek przy pracy".

ZADANIA ANALITYCZNE:
1. Sprawdź spójność danych (rozbieżności w datach, miejscach, opisach).
2. Jeśli masz wątpliwości, wskaż konieczność dopytania poszkodowanego o dodatkowe informacje lub dokumenty (podaj jakie).
3. Przygotuj uzasadnienie decyzji (uznanie/odmowa) wskazując konkretne dowody.
4. Wypełnij schemat wyjściowy zgodnie z analizą.
5. Jeśli decyzja jest pozytywna, opisz w kilku zdaniach okoliczności zdarzenia.

WAŻNE WSKAZÓWKI:
- PAMIĘTAJ O FORMALNYM STYLU I PRECYZYJNYM JĘZYKU.
- Analiza musi być obiektywna i pozbawiona emocji.
- Jeśli nie jesteś w 100 % pewien, że zdarzenie spełnia wszystkie kryteria, wskaż to wyraźnie w opinii.
- Dane osobowe mają być pominięte (są celowo wymazywane).
- Przy odpowiedziach "tak" i "nie" przekreślenie słowa "tak" lub "nie" za pomocą "X" oznacza odrzucenie tej opcji. W przypadku pytania "tak" i "nie" z kwadratami [] obok, zaznaczenie kwadratu "X" oznacza wybór tej opcji. Zwróć uwagę, że opcja może być przekreślona linią (odrzucona), przekreśloną "X" (odrzucona) lub podkreślona (wybrana).
- W przypadku, gdy z opisu zdarzenia wynika, że byli obecni świadkowie, ale ich dane nie są podane (celowe wymazanie danych osobowych), należy uznać, że dane świadków zostały poprawnie podane i świadkowie istnieli. Nie powinno mieć to wpływu na ocenę zdarzenia, ale w "anomalies" należy zaznaczyć "założono istnienie świadków, ale ich dane osobowe zostały usunięte."

"""


def zus_accident_analyse(source_files_bytes: list, mime_types: list = None) -> dict:
    """
    Analyze accident case from source files.
    
    Args:
        source_files_bytes: List of file bytes
        mime_types: Optional list of MIME types corresponding to each file.
                    If not provided, defaults to 'application/pdf' for all files.
    
    Returns:
        JSON string with analysis results
    """
    # Use singleton client to prevent garbage collection issues
    client = _get_client()

    config = types.GenerateContentConfig(
        system_instruction=system_instruction_text,
        temperature=0.1,
        response_mime_type="application/json",
      response_schema=response_schema
    )

    contents = []
    for idx, file_bytes in enumerate(source_files_bytes):
        # Use provided MIME type or default to PDF
        mime_type = mime_types[idx] if mime_types and idx < len(mime_types) else 'application/pdf'
        contents.append(
            types.Part.from_bytes(
                data=file_bytes,
                mime_type=mime_type,
            )
        )

    prompt = "Przeanalizuj załączone dokumenty zgłoszenia wypadku przy pracy i wygeneruj opinię zgodnie z podanymi kryteriami oraz wypełnij schemat wyjściowy."

    contents.append(prompt)

    response = client.models.generate_content(
      model="gemini-2.5-flash",
      config = config,
      contents= contents
    )
    # print(response.text)
    return response.text

if __name__ == "__main__":
    from dotenv import load_dotenv
    from zus_card_generator import create_karta_wypadku
    load_dotenv()

    LOG_FILEPATH = pathlib.Path('zus_accident_analyse_log.txt')

    # files are in "karty/karty/wypadek i/zawiadomienie o wypadku i.pdf" and karty/karty/wypadek i/wyjaśnienia poszkodowanego i.pdf" for i in range 1-50

    # for i in [23, 33, 37, 38, 39, 54, 55, 56, 76, 79, 100, 111]:
    for i in [37, 38, 39, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 101, 102, 103, 104, 105]:
        filepath = pathlib.Path(f'karty/karty/wypadek {i}/zawiadomienie o wypadku {i}.pdf')
        filepath2 = pathlib.Path(f'karty/karty/wypadek {i}/wyjaśnienia poszkodowanego {i}.pdf')

        try:
            
          resp = zus_accident_analyse([filepath.read_bytes(), filepath2.read_bytes()])
          resp_dict = json.loads(resp)
          with LOG_FILEPATH.open('a', encoding='utf-8') as f:
              f.write(f'=== WYPADEK {i} ===\n')
              f.write(json.dumps(resp_dict, ensure_ascii=False, indent=2))
              f.write('\n\n')

          grade = resp_dict.get('grade', 'Brak oceny')

          print(f'Case {i}: {grade}')

          if i == 37:
              accident_description = resp_dict.get('circumstances', '')
              create_karta_wypadku(accident_description=accident_description)

        except Exception as e:
          print(f'Case {i} failed with error: {e}')

    # filepath = pathlib.Path('pw3.pdf')
    # filepath2 = pathlib.Path('pz3.pdf')

    # zus_accident_analyse([filepath.read_bytes(), filepath2.read_bytes()])