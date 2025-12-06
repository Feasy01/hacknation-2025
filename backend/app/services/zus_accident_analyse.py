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
            type=types.Type.INTEGER,
            description="Ocena, czy zdarzenie było wypadkiem przy pracy. 0 - nie było wypadkiem przy pracy, 10 - zdecydowanie było wypadkiem przy pracy. Ocena powinna być oparta na analizie czterech przesłanek określonych w polskim prawie pracy tj. nagłe zdarzenie, przyczyna zewnętrzna, związek z pracą (przyczynowy, czasowy, miejscowy i funkcjonalny) oraz uszczerbek na zdrowiu. Należy unikać ogólników i podać konkretne fakty z opisu zdarzenia. Jeśli nie jesteś w 100% pewien, że zdarzenie spełnia wszystkie kryteria, obniż ocenę odpowiednio.",
            minimum=0,
            maximum=10,
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
            description="Nieprawidłowości lub rozbieżności w zgłoszeniu, jeśli występują np. niezgodne daty lub miejsca zdarzenia, niezgodności w opisie przyczyn lub skutków zdarzenia, itp.",
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

ZADANIA ANALITYCZNE:
1. Sprawdź spójność danych (rozbieżności w datach, miejscach, opisach).
2. Jeśli masz wątpliwości, wskaż konieczność dopytania poszkodowanego o dodatkowe informacje lub dokumenty (podaj jakie).
3. Przygotuj uzasadnienie decyzji (uznanie/odmowa) wskazując konkretne dowody.
4. Wypełnij schemat wyjściowy zgodnie z analizą.
5. Jeśli decyzja jest pozytywna, opisz w kilku zdaniach okoliczności zdarzenia.
PAMIĘTAJ O FORMALNYM STYLU I PRECYZYJNYM JĘZYKU.
Analiza musi być obiektywna i pozbawiona emocji.
Jeśli nie jesteś w 100 % pewien, że zdarzenie spełnia wszystkie kryteria, wskaż to wyraźnie w opinii.
WAŻNE! Zakładaj, że poszkodowany może kłamać lub kombinować w celu wyłudzenia świadczeń.
"""


def zus_accident_analyse() -> dict:
    
    client = genai.Client()

    # TEN POWINIEN BYĆ GIT
    # zgloszenie = f"""Data i Godzina Wypadku: Zdarzenie miało miejsce 22 września 2025 r. o godzinie 14:30. Poszkodowana, będąca współwłaścicielką firmy , rozpoczęła pracę tego dnia o godzinie 08:00, a planowane zakończenie pracy miało nastąpić o 16:00.
    # Okoliczności i Czynności Wykonywane Przed Wypadkiem: Poszkodowana jest współwłaścicielem firmy, która zajmuje się produkcją desek, drewna budowlanego, palet itp.. Do jej obowiązków należy obsługa działu zajmującego się przyjmowaniem i realizacją zleceń dotyczących zamówień, jak również kontrola i weryfikacja produkcji.
    # W dniu wypadku, do momentu zdarzenia, poszkodowana zajmowała się weryfikacją i przygotowaniem zamówień na dany dzień oraz bieżącą kontrolą przebiegu procesu produkcji. Biuro, w którym znajduje się jej stanowisko pracy, umiejscowione jest na piętrze budynku.
    # Około godziny 14:00, po weryfikacji, przyjęciu i wydaniu zamówień do realizacji, poszkodowana udała się na halę produkcyjną. Jej celem było sprawdzenie gotowych wyrobów pod kątem ilości i jakości oraz zweryfikowanie stanu magazynu w celu podjęcia decyzji dotyczącej dalszej produkcji.
    # Przebieg Wypadku: Aby dostać się na halę produkcyjną z biura, poszkodowana musiała zejść po schodach. Schodząc szybkim krokiem , na skutek pośpiechu , pominęła ostatni stopień schodów , w wyniku czego straciła równowagę i upadła na twarde podłoże. Ratując się, odruchowo podparła się rękoma.
    # Konsekwencje i Urazy: Natychmiast po upadku poszkodowana poczuła ból w prawej dłoni. Początkowo sądziła, że ból jest chwilowym efektem uderzenia i udała się na halę produkcyjną, kontynuując pracę. Po powrocie do biura ból był nadal odczuwalny, o czym poinformowała współpracownicę (i jednocześnie wspólniczkę).
    # Po zakończonej pracy udała się do domu. Zastosowała zimne okłady w nadziei, że ból minie. Ponieważ ból utrzymywał się, a w godzinach wieczornych pojawił się obrzęk , podjęła decyzję o udaniu się na Izbę Przyjęć do Szpitala w [brak nazwy placówki].
    # W szpitalu lekarz dyżurujący zalecił wykonanie badania RTG prawej ręki. Na podstawie wyniku postawiono diagnozę: Złamanie 4 kości śródręcza z przemieszczeniem.
    # Leczenie i Niezdolność do Pracy: Lekarz zalecił założenie szyny gipsowej oraz wystawił skierowanie do Poradni Ortopedyczno-Urazowej w celu dalszej konsultacji i ewentualnej decyzji o leczeniu operacyjnym.
    # Poszkodowana otrzymała zwolnienie lekarskie na okres od 22.09.2025 do 03.10.2025 r.."""

    # TUTAJ POWINNO BRAKOWAĆ URAZU
    # zgloszenie = f"""Data i Godzina Wypadku: Zdarzenie miało miejsce 22 września 2025 r. o godzinie 14:30. Poszkodowana, będąca współwłaścicielką firmy , rozpoczęła pracę tego dnia o godzinie 08:00, a planowane zakończenie pracy miało nastąpić o 16:00.
    # Okoliczności i Czynności Wykonywane Przed Wypadkiem: Poszkodowana jest współwłaścicielem firmy, która zajmuje się produkcją desek, drewna budowlanego, palet itp.. Do jej obowiązków należy obsługa działu zajmującego się przyjmowaniem i realizacją zleceń dotyczących zamówień, jak również kontrola i weryfikacja produkcji.
    # Przebieg Wypadku: Aby dostać się na halę produkcyjną z biura, poszkodowana musiała zejść po schodach. Schodząc szybkim krokiem , na skutek pośpiechu , pominęła ostatni stopień schodów , w wyniku czego straciła równowagę i upadła na twarde podłoże. Ratując się, odruchowo podparła się rękoma.
    # Konsekwencje i Urazy: Natychmiast po upadku poszkodowana poczuła ból w prawej dłoni. Początkowo sądziła, że ból jest chwilowym efektem uderzenia i udała się na halę produkcyjną, kontynuując pracę. Po powrocie do biura ból był nadal odczuwalny, o czym poinformowała współpracownicę (i jednocześnie wspólniczkę)."""

    zgloszenie = """
Wypadek miał miejsce w dniu 20.06.2025 r., około godziny 12:15. Poszkodowany, prowadzący jednoosobową działalność gospodarczą, świadczył usługę remontową polegającą na remoncie balkonu, co obejmowało usuwanie odpadających płytek, skuwanie tynku frontowego balkonu oraz usuwanie kamienia elewacyjnego.

Prace były wykonywane na wysokości około 3 metrów. W celu zachowania zasad BHP i bezpieczeństwa, miejsce pracy zostało przygotowane poprzez ustawienie profesjonalnego rusztowania i profesjonalnej drabiny. Prace musiały być prowadzone z rusztowania po zewnętrznej stronie balkonu, ponieważ poręcze uniemożliwiały skucie krańcowych płytek i usunięcie frontowej elewacji.

Drabina, która stanowiła część zestawu (rusztowanie + drabina do wejścia/zejścia), osunęła się podczas schodzenia. W konsekwencji poszkodowany upadł na kostkę brukową z wysokości około 2,50-2,75 metra. Poszkodowany spadł, uderzając przede wszystkim głową oraz plecami o podłoże.

Świadkiem wypadku była Pani Urszula, zleceniodawca usługi i prywatnie mama małżonki poszkodowanego. Po upadku u poszkodowanego wystąpiło mocne krwawienie z nosa, narastający ból głowy, odruch wymiotny i mocne zawroty głowy. Po wezwaniu pomocy, poszkodowany został zabezpieczony, założono mu kołnierz ortopedyczny i przewieziono do Szpitala Specjalistycznego.

Rozpoznane urazy na podstawie dokumentacji lekarskiej (Karty Informacyjnej z dnia 25.06.2025 r.) obejmują:

Stan po urazie głowy na skutek upadku.

Krwiak nadtwardówkowy w okolicy ciemieniowo-skroniowej.

Stłuczenie mózgu w płacie skroniowym lewym i prawym.

Złamanie prawej kości ciemieniowej przechodzące na szew wieńcowy, skrzydło większe prawej kości klinowej i na ścianę zatoki klinowej prawej.

Złamanie ściany bocznej oczodołu prawego.

Złamanie wyrostka kłykciowego prawej kości skroniowej.

Złamanie stawowe paliczka bliższego palca IV ręki lewej.

Poszkodowany przebywał w szpitalu od 20.06.2025 r. do 25.06.2025 r. na Oddziale Chirurgii Ogólnej i Onkologicznej z Pododdziałem Urologii. Orzeczona niezdolność do świadczenia pracy (zwolnienie lekarskie) trwała do 03.08.2025 r..

Wypadek nie powstał podczas obsługi maszyn lub urządzeń. Stosowane środki zabezpieczające to buty i kask, które były właściwe i sprawne. Nie istniał obowiązek wykonywania pracy przez co najmniej 2 osoby. Poszkodowany twierdzi, że przestrzegał zasad BHP i posiada przygotowanie do wykonywania zadań związanych z prowadzeniem działalności oraz odbył stosowne szkolenie z BHP dla pracodawców. W chwili wypadku poszkodowany nie był w stanie nietrzeźwości lub pod wpływem środków odurzających lub psychotropowych, a stan trzeźwości nie był badany.

Umowa na wykonanie usługi została zawarta ustnie, praca nie została zakończona i nie został wystawiony żaden rachunek."""


    config = types.GenerateContentConfig(
        system_instruction=system_instruction_text,
        temperature=0.1,
        response_mime_type="application/json",
      response_schema=response_schema
    )

    # Retrieve and encode the PDF byte
    filepath = pathlib.Path('pinput2.pdf')

    prompt = "Przeanalizuj załączony dokument zgłoszenia wypadku przy pracy i wygeneruj opinię zgodnie z podanymi kryteriami oraz wypełnij schemat wyjściowy."
    response = client.models.generate_content(
      model="gemini-2.5-flash",
      config = config,
      contents=[
          types.Part.from_bytes(
            data=filepath.read_bytes(),
            mime_type='application/pdf',
          ),
          prompt])
    print(response.text)

    # response = client.models.generate_content(
    #   contents = json.dumps(zgloszenie),
    #   model = "gemini-2.5-flash",
    #   config = config
    # )

    print(response.text)
    

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    zus_accident_analyse()