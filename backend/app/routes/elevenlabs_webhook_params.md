# ElevenLabs Webhook Body Parameters Configuration

This document defines all body parameters for the `/api/elevenlabs/webhook` route that the LLM should extract from conversation transcripts.

## Required Parameters

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `poszkodowany.pesel` | `poszkodowany_pesel` | Extract the PESEL (Polish national identification number) of the injured person (poszkodowany) from the conversation. PESEL is an 11-digit number. Look for phrases like 'mój PESEL to', 'numer PESEL', 'PESEL', or when the user provides their identification number. | Yes | string |
| `poszkodowany.imie` | `poszkodowany_imie` | Extract the first name (imię) of the injured person from the conversation. Look for phrases like 'mam na imię', 'nazywam się', 'imię', or when the user introduces themselves. | Yes | string |
| `poszkodowany.nazwisko` | `poszkodowany_nazwisko` | Extract the last name (nazwisko) of the injured person from the conversation. Look for phrases like 'nazywam się', 'moje nazwisko', 'nazwisko', or when the user provides their full name. | Yes | string |
| `szczegoly.data` | `szczegoly_data` | Extract the date (data) when the accident occurred. Format should be YYYY-MM-DD or DD.MM.YYYY. Look for phrases like 'wypadek wydarzył się', 'data wypadku', 'kiedy miał miejsce wypadek', or when the user mentions the accident date. | Yes | string |
| `szczegoly.miejsce` | `szczegoly_miejsce` | Extract the location/place (miejsce) where the accident occurred. This should include the full address or description of where the accident happened. Look for phrases like 'gdzie miał miejsce wypadek', 'miejsce wypadku', or when the user describes where the accident occurred. | Yes | string |

## Optional Parameters - Personal Information

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `poszkodowany.data_urodzenia` | `poszkodowany_data_urodzenia` | Extract the date of birth (data urodzenia) of the injured person. Format should be YYYY-MM-DD or DD.MM.YYYY. Look for phrases like 'urodziłem się', 'data urodzenia', 'urodzony', or when the user mentions their birth date. | No | string |
| `poszkodowany.miejsce_urodzenia` | `poszkodowany_miejsce_urodzenia` | Extract the place of birth (miejsce urodzenia) of the injured person. Look for phrases like 'urodziłem się w', 'miejsce urodzenia', or when the user mentions where they were born. | No | string |
| `poszkodowany.dokument_typ` | `poszkodowany_dokument_typ` | Extract the type of identity document (typ dokumentu) - typically 'dowód osobisty' (ID card) or 'paszport' (passport). Look for phrases mentioning document type. | No | string |
| `poszkodowany.dokument_seria` | `poszkodowany_dokument_seria` | Extract the series (seria) of the identity document. This is usually 3 letters for Polish ID cards. Look for document series information. | No | string |
| `poszkodowany.dokument_numer` | `poszkodowany_dokument_numer` | Extract the number (numer) of the identity document. Look for document number information. | No | string |
| `poszkodowany.telefon` | `poszkodowany_telefon` | Extract the phone number (telefon) of the injured person. Look for phrases like 'mój numer telefonu', 'telefon', 'kontakt', or when the user provides their phone number. | No | string |

## Optional Parameters - Residential Address

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `adres_zamieszkania.ulica` | `adres_zamieszkania_ulica` | Extract the street name (ulica) of the residential address (adres zamieszkania). Look for street names mentioned in the conversation. | No | string |
| `adres_zamieszkania.nr_domu` | `adres_zamieszkania_nr_domu` | Extract the house number (numer domu) of the residential address. Look for house numbers mentioned with the address. | No | string |
| `adres_zamieszkania.nr_lokalu` | `adres_zamieszkania_nr_lokalu` | Extract the apartment/flat number (numer lokalu) of the residential address if applicable. Look for apartment numbers mentioned. | No | string |
| `adres_zamieszkania.kod_pocztowy` | `adres_zamieszkania_kod_pocztowy` | Extract the postal code (kod pocztowy) of the residential address. Format is typically XX-XXX (e.g., 00-001). Look for postal codes in the address information. | No | string |
| `adres_zamieszkania.miejscowosc` | `adres_zamieszkania_miejscowosc` | Extract the city/town name (miejscowość) of the residential address. Look for city names mentioned in the address. | No | string |
| `adres_zamieszkania.panstwo` | `adres_zamieszkania_panstwo` | Extract the country (państwo) of the residential address if different from Poland. Default is Poland if not mentioned. | No | string |
| `mieszka_za_granica` | `mieszka_za_granica` | Extract whether the injured person lives abroad (mieszka za granicą). Set to true if the user mentions living outside Poland, false otherwise. Look for phrases like 'mieszkam za granicą', 'mieszkam w [foreign country]'. | No | boolean |

## Optional Parameters - Accident Details

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `szczegoly.godzina` | `szczegoly_godzina` | Extract the time (godzina) when the accident occurred. Format should be HH:MM (24-hour format). Look for phrases like 'o której godzinie', 'godzina wypadku', or when the user mentions the time of the accident. | No | string |
| `szczegoly.godzina_rozpoczecia_pracy` | `szczegoly_godzina_rozpoczecia_pracy` | Extract the work start time (godzina rozpoczęcia pracy) on the day of the accident. Format should be HH:MM. Look for phrases like 'rozpocząłem pracę o', 'praca zaczęła się o', or when the user mentions when they started work. | No | string |
| `szczegoly.godzina_zakonczenia_pracy` | `szczegoly_godzina_zakonczenia_pracy` | Extract the work end time (godzina zakończenia pracy) on the day of the accident, or the scheduled end time. Format should be HH:MM. Look for phrases like 'praca miała się zakończyć o', 'planowane zakończenie pracy', or when the user mentions work schedule. | No | string |
| `szczegoly.opis_urazow` | `szczegoly_opis_urazow` | Extract the description of injuries (opis urazów) sustained in the accident. This should be a detailed description of what injuries occurred. Look for phrases like 'jakie urazy', 'co się stało', 'zraniony', 'złamany', or when the user describes their injuries. | No | string |
| `szczegoly.opis_okolicznosci` | `szczegoly_opis_okolicznosci` | Extract the description of circumstances (opis okoliczności) of how the accident happened. This should describe what led to the accident and how it occurred. Look for phrases like 'jak doszło do wypadku', 'okoliczności wypadku', 'co się wydarzyło', or when the user describes the accident sequence. | No | string |
| `szczegoly.pierwsza_pomoc` | `szczegoly_pierwsza_pomoc` | Extract whether first aid (pierwsza pomoc) was provided. Set to true if first aid was given, false otherwise. Look for phrases like 'udzielono pierwszej pomocy', 'pierwsza pomoc', 'ratownicy', or when the user mentions medical assistance. | No | boolean |
| `szczegoly.pierwsza_pomoc_nazwa` | `szczegoly_pierwsza_pomoc_nazwa` | Extract the name (nazwa) of the first aid provider if first aid was provided. Look for names of medical facilities, ambulance services, or individuals who provided first aid. | No | string |
| `szczegoly.pierwsza_pomoc_adres` | `szczegoly_pierwsza_pomoc_adres` | Extract the address (adres) of the first aid provider if first aid was provided. Look for addresses of medical facilities or locations where first aid was given. | No | string |
| `szczegoly.postepowanie_prowadzone` | `szczegoly_postepowanie_prowadzone` | Extract whether legal proceedings (postępowanie) are being conducted regarding the accident. Set to true if any legal proceedings are mentioned, false otherwise. Look for phrases like 'postępowanie', 'prokuratura', 'policja prowadzi', or mentions of legal actions. | No | boolean |
| `szczegoly.postepowanie_organ` | `szczegoly_postepowanie_organ` | Extract the authority/organ (organ) conducting the proceedings if postepowanie_prowadzone is true. Look for names of authorities like 'policja', 'prokuratura', 'inspekcja pracy', or other official bodies. | No | string |
| `szczegoly.postepowanie_adres` | `szczegoly_postepowanie_adres` | Extract the address (adres) of the authority conducting the proceedings if applicable. Look for addresses of police stations, prosecutor's offices, or other official bodies. | No | string |
| `szczegoly.obsluga_maszyn` | `szczegoly_obsluga_maszyn` | Extract whether machinery/equipment (obsługa maszyn) was involved in the accident. Set to true if machines or equipment were involved, false otherwise. Look for mentions of machines, equipment, tools, or mechanical devices. | No | boolean |
| `szczegoly.maszyny_sprawne` | `szczegoly_maszyny_sprawne` | Extract whether the machinery was in working order (maszyny sprawne) if obsluga_maszyn is true. Set to true if machines were functional, false if they were defective. Look for mentions of machine condition, functionality, or defects. | No | boolean |
| `szczegoly.maszyny_zgodnie_z_zasadami` | `szczegoly_maszyny_zgodnie_z_zasadami` | Extract whether machinery was used according to regulations (zgodnie z zasadami) if obsluga_maszyn is true. Set to true if used properly, false otherwise. Look for mentions of proper usage, safety procedures, or violations. | No | boolean |
| `szczegoly.maszyny_opis` | `szczegoly_maszyny_opis` | Extract the description (opis) of the machinery involved if obsluga_maszyn is true. This should describe what machines or equipment were involved in the accident. | No | string |
| `szczegoly.atest_deklaracja` | `szczegoly_atest_deklaracja` | Extract whether certificates/declarations (atest/deklaracja) exist for the machinery or workplace. Set to true if certificates are mentioned, false otherwise. Look for mentions of certificates, declarations, or compliance documents. | No | boolean |
| `szczegoly.ewidencja_srodkow_trwalych` | `szczegoly_ewidencja_srodkow_trwalych` | Extract whether there is a register of fixed assets (ewidencja środków trwałych) for the machinery. Set to true if such register exists, false otherwise. Look for mentions of asset registers or equipment records. | No | boolean |

## Optional Parameters - Business Address

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `adres_dzialalnosci.ulica` | `adres_dzialalnosci_ulica` | Extract the street name (ulica) of the business/activity address (adres działalności) where the accident occurred. This is the address of the workplace or business location. | No | string |
| `adres_dzialalnosci.nr_domu` | `adres_dzialalnosci_nr_domu` | Extract the house number (numer domu) of the business/activity address. | No | string |
| `adres_dzialalnosci.nr_lokalu` | `adres_dzialalnosci_nr_lokalu` | Extract the apartment/flat number (numer lokalu) of the business/activity address if applicable. | No | string |
| `adres_dzialalnosci.kod_pocztowy` | `adres_dzialalnosci_kod_pocztowy` | Extract the postal code (kod pocztowy) of the business/activity address. Format is typically XX-XXX. | No | string |
| `adres_dzialalnosci.miejscowosc` | `adres_dzialalnosci_miejscowosc` | Extract the city/town name (miejscowość) of the business/activity address. | No | string |
| `adres_dzialalnosci.telefon` | `adres_dzialalnosci_telefon` | Extract the phone number (telefon) of the business/activity location if mentioned. | No | string |

## Optional Parameters - Reporter Information

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `zglaszajacy_inny` | `zglaszajacy_inny` | Extract whether someone other than the injured person is reporting the accident (zgłaszający inny). Set to true if a different person is reporting, false if the injured person is reporting themselves. Look for phrases indicating who is making the report. | No | boolean |
| `zglaszajacy.pesel` | `zglaszajacy_pesel` | Extract the PESEL of the person reporting the accident (zgłaszający) if zglaszajacy_inny is true. Look for the reporter's identification number. | No | string |
| `zglaszajacy.imie` | `zglaszajacy_imie` | Extract the first name of the person reporting the accident if zglaszajacy_inny is true. | No | string |
| `zglaszajacy.nazwisko` | `zglaszajacy_nazwisko` | Extract the last name of the person reporting the accident if zglaszajacy_inny is true. | No | string |

## Optional Parameters - Correspondence Address

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `inny_adres_korespondencyjny` | `inny_adres_korespondencyjny` | Extract whether a different correspondence address (inny adres korespondencyjny) should be used. Set to true if the user wants correspondence sent to a different address than the residential address, false otherwise. | No | boolean |
| `adres_korespondencyjny.typ` | `adres_korespondencyjny_typ` | Extract the type (typ) of correspondence address if inny_adres_korespondencyjny is true. Should be 'adres' (regular address), 'poste-restante' (poste restante), or 'skrytka' (PO box). | No | string |

## Optional Parameters - Witnesses

| Property ID | Variable Name | Description | Required | Value Type |
|------------|---------------|-------------|----------|------------|
| `swiadkowie` | `swiadkowie` | Extract information about witnesses (świadkowie) to the accident. This should be an array of witness objects, each containing: id, imie, nazwisko, ulica, nr_domu, nr_lokalu, kod_pocztowy, miejscowosc, and optionally panstwo. Look for mentions of witnesses, people who saw the accident, or bystanders. | No | array |

## Usage Notes

- All parameters use dot notation (e.g., `poszkodowany.pesel`) to represent nested object paths
- The webhook expects these parameters to be sent in a `form_data` object in the request body
- Boolean values should be `true` or `false`
- Date formats should be YYYY-MM-DD or DD.MM.YYYY
- Time formats should be HH:MM (24-hour format)
- Postal codes should be in format XX-XXX (e.g., 00-001)
- The `swiadkowie` parameter should be an array of objects with witness information

