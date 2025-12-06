export interface Address {
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  panstwo?: string;
}

export interface CorrespondenceAddress {
  typ: 'adres' | 'poste-restante' | 'skrytka';
  // For 'adres' type
  adres?: Address;
  // For 'poste-restante' type
  kodPocztowyPlacowki?: string;
  nazwaPlacowki?: string;
  // For 'skrytka' type
  numerSkrytki?: string;
  kodPocztowySkrytki?: string;
  nazwaPlacowkiSkrytki?: string;
}

export interface PersonData {
  pesel: string;
  dokumentTyp: string;
  dokumentSeria: string;
  dokumentNumer: string;
  imie: string;
  nazwisko: string;
  dataUrodzenia: string;
  miejsceUrodzenia: string;
  telefon: string;
}

export interface Witness {
  id: string;
  imie: string;
  nazwisko: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  panstwo?: string;
}

export interface AccidentDetails {
  data: string;
  godzina: string;
  miejsce: string;
  godzinaRozpoczeciaPracy: string;
  godzinaZakonczeniaPracy: string;
  opisUrazow: string;
  opisOkolicznosci: string;
  pierwszaPomoc: boolean;
  pierwszaPomocNazwa?: string;
  pierwszaPomocAdres?: string;
  postepowanieProwadzone: boolean;
  postepowanieOrgan?: string;
  postepowanieAdres?: string;
  obslugaMaszyn: boolean;
  maszynySprawne?: boolean;
  maszynyZgodnieZZasadami?: boolean;
  maszynyOpis?: string;
  atestDeklaracja: boolean;
  ewidencjaSrodkowTrwalych: boolean;
}

export interface AccidentReportFormData {
  // Poszkodowany
  poszkodowany: PersonData;
  adresZamieszkania: Address;
  mieszkaZaGranica: boolean;
  ostatniAdresPL?: Address;
  innyAdresKorespondencyjny: boolean;
  adresKorespondencyjny?: CorrespondenceAddress;
  adresDzialalnosci: Address & { telefon?: string };
  
  // Zgłaszający (if different from poszkodowany)
  zglaszajacyInny: boolean;
  zglaszajacy?: PersonData;
  zglaszajacyAdresZamieszkania?: Address;
  zglaszajacyMieszkaZaGranica?: boolean;
  zglaszajacyOstatniAdresPL?: Address;
  zglaszajacyInnyAdresKorespondencyjny?: boolean;
  zglaszajacyAdresKorespondencyjny?: CorrespondenceAddress;
  
  // Accident details
  szczegoly: AccidentDetails;
  
  // Witnesses
  swiadkowie: Witness[];
}

export const initialFormData: AccidentReportFormData = {
  poszkodowany: {
    pesel: '',
    dokumentTyp: '',
    dokumentSeria: '',
    dokumentNumer: '',
    imie: '',
    nazwisko: '',
    dataUrodzenia: '',
    miejsceUrodzenia: '',
    telefon: '',
  },
  adresZamieszkania: {
    ulica: '',
    nrDomu: '',
    nrLokalu: '',
    kodPocztowy: '',
    miejscowosc: '',
    panstwo: '',
  },
  mieszkaZaGranica: false,
  adresDzialalnosci: {
    ulica: '',
    nrDomu: '',
    nrLokalu: '',
    kodPocztowy: '',
    miejscowosc: '',
    telefon: '',
  },
  zglaszajacyInny: false,
  innyAdresKorespondencyjny: false,
  szczegoly: {
    data: '',
    godzina: '',
    miejsce: '',
    godzinaRozpoczeciaPracy: '',
    godzinaZakonczeniaPracy: '',
    opisUrazow: '',
    opisOkolicznosci: '',
    pierwszaPomoc: false,
    postepowanieProwadzone: false,
    obslugaMaszyn: false,
    atestDeklaracja: false,
    ewidencjaSrodkowTrwalych: false,
  },
  swiadkowie: [],
};
