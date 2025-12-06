from dataclasses import dataclass
import json
from google import genai
from google.genai import types
import pathlib

@dataclass
class ZUSOpinion():
    grade: int # 0-10
    justification: str
    circumstances: str | None = None
    anomalies: str | None = None

response_schema = types.Schema(
    type=types.Type.OBJECT,
    properties={
        "grade": types.Schema(
            type=types.Type.STRING,
            description="Ocena, czy zdarzenie jest wypadkiem przy pracy",
            enum=[
                "Tak, jest to wypadek przy pracy",
                "Nie, nie jest to wypadek przy pracy",
                "Nie mam wystarczających informacji, aby ocenić, czy jest to wypadek przy pracy",
                "Nie mam 100% pewności, przypadek jest wątpliwy"
            ]
        ),
        "justification": types.Schema(
            type=types.Type.STRING,
            description="Uzasadnienie oceny. Powinno zawierać odniesienia do 4 przesłanek określonych w polskim prawie pracy tj. nagłe zdarzenie, przyczyna zewnętrzna, związek z pracą (przyczynowy, czasowy, miejscowy i funkcjonalny) oraz uszczerbek na zdrowiu. Należy unikać ogólników i podać konkretne fakty z opisu zdarzenia.",
        ),
        "circumstances": types.Schema(
            type=types.Type.STRING,
            description="Okoliczności zdarzenia, jeśli był to wypadek przy pracy",
        ),
        "anomalies": types.Schema(
            type=types.Type.STRING,
            description="Nieprawidłowości lub rozbieżności w zgłoszeniu, jeśli występują np. niezgodne daty lub miejsca zdarzenia, niezgodności w opisie przyczyn lub skutków zdarzenia, itp. Brak świadków nie jest anomalią.",
        )
    },
    required=[
        "grade",
        "justification"
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
   - Powiązanie wypadku z wykonywaniem pracy zarobkowej musi być oczywiste i nie może opierać się na domysłach lub tłumaczeniu poszkodowanego. Zakładaj, że poszkodowany będzie kłamać lub kombinować w celu wyłudzenia świadczeń (np. opisując wypadek jako związany z pracą, gdy tak nie jest, bo robił coś dla siebie lub rodziny). Bądź bardzo krytyczny wobec podawanych okoliczności i jak coś nawet delikatnie wzbudza Twoje wątpliwości to daj ocenę "Nie mam 100% pewności, przypadek jest wątpliwy", nawet jak wszystkie 4 kryteria są spełnione, a poszkodowany próbuje to tłumaczyć.

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


"""


def zus_accident_analyse(source_files_bytes: list) -> dict:
    
    client = genai.Client()

    config = types.GenerateContentConfig(
        system_instruction=system_instruction_text,
        temperature=0.5,
        response_mime_type="application/json",
      response_schema=response_schema
    )

    # Retrieve and encode the PDF byte
    # filepath = pathlib.Path('pw3.pdf')
    # filepath2 = pathlib.Path('pz3.pdf')

    contents = []
    for file in source_files_bytes:
        contents.append(
            types.Part.from_bytes(
                data=file,
                mime_type='application/pdf',
            )
        )

    prompt = "Przeanalizuj załączone dokumenty zgłoszenia wypadku przy pracy i wygeneruj opinię zgodnie z podanymi kryteriami oraz wypełnij schemat wyjściowy."

    contents.append(prompt)

    response = client.models.generate_content(
      model="gemini-2.5-pro",
      config = config,
      contents= contents
    )
    print(response.text)
    

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    filepath = pathlib.Path('pw3.pdf')
    filepath2 = pathlib.Path('pz3.pdf')

    zus_accident_analyse([filepath.read_bytes(), filepath2.read_bytes()])