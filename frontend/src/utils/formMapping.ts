import {
  AccidentDetails,
  AccidentReportFormData,
  Address,
  CorrespondenceAddress,
  PersonData,
  Witness,
  initialFormData,
} from '@/types/accident-report';

const cloneInitialFormData = (): AccidentReportFormData =>
  JSON.parse(JSON.stringify(initialFormData));

const mapAddress = (address?: any): Address => ({
  ulica: address?.ulica || '',
  nrDomu: address?.nr_domu || '',
  nrLokalu: address?.nr_lokalu || '',
  kodPocztowy: address?.kod_pocztowy || '',
  miejscowosc: address?.miejscowosc || '',
  panstwo: address?.panstwo || '',
});

const mapBusinessAddress = (address?: any): Address & { telefon?: string } => ({
  ...mapAddress(address),
  telefon: address?.telefon || '',
});

const mapCorrespondenceAddress = (address?: any): CorrespondenceAddress | undefined => {
  if (!address) return undefined;

  return {
    typ: address.typ || 'adres',
    adres: address.adres ? mapAddress(address.adres) : undefined,
    kodPocztowyPlacowki: address.kod_pocztowy_placowki || '',
    nazwaPlacowki: address.nazwa_placowki || '',
    numerSkrytki: address.numer_skrytki || '',
    kodPocztowySkrytki: address.kod_pocztowy_skrytki || '',
    nazwaPlacowkiSkrytki: address.nazwa_placowki_skrytki || '',
  };
};

const mapPersonData = (person?: any): PersonData => ({
  pesel: person?.pesel || '',
  dokumentTyp: person?.dokument_typ || '',
  dokumentSeria: person?.dokument_seria || '',
  dokumentNumer: person?.dokument_numer || '',
  imie: person?.imie || '',
  nazwisko: person?.nazwisko || '',
  dataUrodzenia: person?.data_urodzenia || '',
  miejsceUrodzenia: person?.miejsce_urodzenia || '',
  telefon: person?.telefon || '',
});

const mapAccidentDetails = (details?: any): AccidentDetails => ({
  data: details?.data || '',
  godzina: details?.godzina || '',
  miejsce: details?.miejsce || '',
  godzinaRozpoczeciaPracy: details?.godzina_rozpoczecia_pracy || '',
  godzinaZakonczeniaPracy: details?.godzina_zakonczenia_pracy || '',
  opisUrazow: details?.opis_urazow || '',
  opisOkolicznosci: details?.opis_okolicznosci || '',
  pierwszaPomoc: Boolean(details?.pierwsza_pomoc),
  pierwszaPomocNazwa: details?.pierwsza_pomoc_nazwa || '',
  pierwszaPomocAdres: details?.pierwsza_pomoc_adres || '',
  postepowanieProwadzone: Boolean(details?.postepowanie_prowadzone),
  postepowanieOrgan: details?.postepowanie_organ || '',
  postepowanieAdres: details?.postepowanie_adres || '',
  obslugaMaszyn: Boolean(details?.obsluga_maszyn),
  maszynySprawne: details?.maszyny_sprawne,
  maszynyZgodnieZZasadami: details?.maszyny_zgodnie_z_zasadami,
  maszynyOpis: details?.maszyny_opis || '',
  atestDeklaracja: Boolean(details?.atest_deklaracja),
  ewidencjaSrodkowTrwalych: Boolean(details?.ewidencja_srodkow_trwalych),
});

const mapWitness = (witness?: any): Witness => ({
  id: witness?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
  imie: witness?.imie || '',
  nazwisko: witness?.nazwisko || '',
  ulica: witness?.ulica || '',
  nrDomu: witness?.nr_domu || '',
  nrLokalu: witness?.nr_lokalu || '',
  kodPocztowy: witness?.kod_pocztowy || '',
  miejscowosc: witness?.miejscowosc || '',
  panstwo: witness?.panstwo || '',
});

const mapAddressToBackend = (address?: Address) => ({
  ulica: address?.ulica || '',
  nr_domu: address?.nrDomu || '',
  nr_lokalu: address?.nrLokalu || '',
  kod_pocztowy: address?.kodPocztowy || '',
  miejscowosc: address?.miejscowosc || '',
  ...(address?.panstwo ? { panstwo: address.panstwo } : {}),
});

const mapBusinessAddressToBackend = (address?: Address & { telefon?: string }) => ({
  ...mapAddressToBackend(address),
  ...(address?.telefon ? { telefon: address.telefon } : { telefon: '' }),
});

const mapCorrespondenceAddressToBackend = (address?: CorrespondenceAddress) => {
  if (!address) return undefined;

  return {
    typ: address.typ || 'adres',
    adres: address.adres ? mapAddressToBackend(address.adres) : undefined,
    kod_pocztowy_placowki: address.kodPocztowyPlacowki || '',
    nazwa_placowki: address.nazwaPlacowki || '',
    numer_skrytki: address.numerSkrytki || '',
    kod_pocztowy_skrytki: address.kodPocztowySkrytki || '',
    nazwa_placowki_skrytki: address.nazwaPlacowkiSkrytki || '',
  };
};

const mapPersonDataToBackend = (person?: PersonData) => ({
  pesel: person?.pesel || '',
  dokument_typ: person?.dokumentTyp || '',
  dokument_seria: person?.dokumentSeria || '',
  dokument_numer: person?.dokumentNumer || '',
  imie: person?.imie || '',
  nazwisko: person?.nazwisko || '',
  data_urodzenia: person?.dataUrodzenia || '',
  miejsce_urodzenia: person?.miejsceUrodzenia || '',
  telefon: person?.telefon || '',
});

const mapAccidentDetailsToBackend = (details?: AccidentDetails) => ({
  data: details?.data || '',
  godzina: details?.godzina || '',
  miejsce: details?.miejsce || '',
  godzina_rozpoczecia_pracy: details?.godzinaRozpoczeciaPracy || '',
  godzina_zakonczenia_pracy: details?.godzinaZakonczeniaPracy || '',
  opis_urazow: details?.opisUrazow || '',
  opis_okolicznosci: details?.opisOkolicznosci || '',
  pierwsza_pomoc: Boolean(details?.pierwszaPomoc),
  pierwsza_pomoc_nazwa: details?.pierwszaPomocNazwa || '',
  pierwsza_pomoc_adres: details?.pierwszaPomocAdres || '',
  postepowanie_prowadzone: Boolean(details?.postepowanieProwadzone),
  postepowanie_organ: details?.postepowanieOrgan || '',
  postepowanie_adres: details?.postepowanieAdres || '',
  obsluga_maszyn: Boolean(details?.obslugaMaszyn),
  maszyny_sprawne: details?.maszynySprawne,
  maszyny_zgodnie_z_zasadami: details?.maszynyZgodnieZZasadami,
  maszyny_opis: details?.maszynyOpis || '',
  atest_deklaracja: Boolean(details?.atestDeklaracja),
  ewidencja_srodkow_trwalych: Boolean(details?.ewidencjaSrodkowTrwalych),
});

const mapWitnessToBackend = (witness: Witness) => ({
  id: witness.id,
  imie: witness.imie || '',
  nazwisko: witness.nazwisko || '',
  ulica: witness.ulica || '',
  nr_domu: witness.nrDomu || '',
  nr_lokalu: witness.nrLokalu || '',
  kod_pocztowy: witness.kodPocztowy || '',
  miejscowosc: witness.miejscowosc || '',
  ...(witness.panstwo ? { panstwo: witness.panstwo } : {}),
});

export const mapBackendFormToFrontend = (data: any): AccidentReportFormData => {
  if (!data) {
    return cloneInitialFormData();
  }

  return {
    poszkodowany: mapPersonData(data.poszkodowany),
    adresZamieszkania: mapAddress(data.adres_zamieszkania),
    mieszkaZaGranica: Boolean(data.mieszka_za_granica),
    ostatniAdresPL: data.ostatni_adres_pl ? mapAddress(data.ostatni_adres_pl) : undefined,
    innyAdresKorespondencyjny: Boolean(data.inny_adres_korespondencyjny),
    adresKorespondencyjny: mapCorrespondenceAddress(data.adres_korespondencyjny),
    adresDzialalnosci: mapBusinessAddress(data.adres_dzialalnosci),

    zglaszajacyInny: Boolean(data.zglaszajacy_inny),
    zglaszajacy: data.zglaszajacy ? mapPersonData(data.zglaszajacy) : undefined,
    zglaszajacyAdresZamieszkania: data.zglaszajacy_adres_zamieszkania
      ? mapAddress(data.zglaszajacy_adres_zamieszkania)
      : undefined,
    zglaszajacyMieszkaZaGranica: data.zglaszajacy_mieszka_za_granica,
    zglaszajacyOstatniAdresPL: data.zglaszajacy_ostatni_adres_pl
      ? mapAddress(data.zglaszajacy_ostatni_adres_pl)
      : undefined,
    zglaszajacyInnyAdresKorespondencyjny: data.zglaszajacy_inny_adres_korespondencyjny,
    zglaszajacyAdresKorespondencyjny: mapCorrespondenceAddress(data.zglaszajacy_adres_korespondencyjny),

    szczegoly: mapAccidentDetails(data.szczegoly),
    swiadkowie: Array.isArray(data.swiadkowie) ? data.swiadkowie.map(mapWitness) : [],
  };
};

export const mapFrontendFormToBackend = (data: AccidentReportFormData) => ({
  poszkodowany: mapPersonDataToBackend(data.poszkodowany),
  adres_zamieszkania: mapAddressToBackend(data.adresZamieszkania),
  mieszka_za_granica: Boolean(data.mieszkaZaGranica),
  ostatni_adres_pl: data.ostatniAdresPL ? mapAddressToBackend(data.ostatniAdresPL) : undefined,
  inny_adres_korespondencyjny: Boolean(data.innyAdresKorespondencyjny),
  adres_korespondencyjny: mapCorrespondenceAddressToBackend(data.adresKorespondencyjny),
  adres_dzialalnosci: mapBusinessAddressToBackend(data.adresDzialalnosci),
  zglaszajacy_inny: Boolean(data.zglaszajacyInny),
  zglaszajacy: data.zglaszajacy ? mapPersonDataToBackend(data.zglaszajacy) : undefined,
  zglaszajacy_adres_zamieszkania: data.zglaszajacyAdresZamieszkania
    ? mapAddressToBackend(data.zglaszajacyAdresZamieszkania)
    : undefined,
  zglaszajacy_mieszka_za_granica: data.zglaszajacyMieszkaZaGranica,
  zglaszajacy_ostatni_adres_pl: data.zglaszajacyOstatniAdresPL
    ? mapAddressToBackend(data.zglaszajacyOstatniAdresPL)
    : undefined,
  zglaszajacy_inny_adres_korespondencyjny: data.zglaszajacyInnyAdresKorespondencyjny,
  zglaszajacy_adres_korespondencyjny: mapCorrespondenceAddressToBackend(
    data.zglaszajacyAdresKorespondencyjny
  ),
  szczegoly: mapAccidentDetailsToBackend(data.szczegoly),
  swiadkowie: Array.isArray(data.swiadkowie) ? data.swiadkowie.map(mapWitnessToBackend) : [],
});
