from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


# Address models
class Address(BaseModel):
    ulica: str
    nr_domu: str
    nr_lokalu: str
    kod_pocztowy: str
    miejscowosc: str
    panstwo: Optional[str] = None


class BusinessAddress(Address):
    """Address with optional telefon field for business address."""
    telefon: Optional[str] = None


class CorrespondenceAddress(BaseModel):
    typ: str  # 'adres' | 'poste-restante' | 'skrytka'
    adres: Optional[Address] = None
    kod_pocztowy_placowki: Optional[str] = None
    nazwa_placowki: Optional[str] = None
    numer_skrytki: Optional[str] = None
    kod_pocztowy_skrytki: Optional[str] = None
    nazwa_placowki_skrytki: Optional[str] = None


class PersonData(BaseModel):
    pesel: str
    dokument_typ: str
    dokument_seria: str
    dokument_numer: str
    imie: str
    nazwisko: str
    data_urodzenia: str
    miejsce_urodzenia: str
    telefon: str


class Witness(BaseModel):
    id: str
    imie: str
    nazwisko: str
    ulica: str
    nr_domu: str
    nr_lokalu: str
    kod_pocztowy: str
    miejscowosc: str
    panstwo: Optional[str] = None


class AccidentDetails(BaseModel):
    data: str
    godzina: str
    miejsce: str
    godzina_rozpoczecia_pracy: str
    godzina_zakonczenia_pracy: str
    opis_urazow: str
    opis_okolicznosci: str
    pierwsza_pomoc: bool
    pierwsza_pomoc_nazwa: Optional[str] = None
    pierwsza_pomoc_adres: Optional[str] = None
    postepowanie_prowadzone: bool
    postepowanie_organ: Optional[str] = None
    postepowanie_adres: Optional[str] = None
    obsluga_maszyn: bool
    maszyny_sprawne: Optional[bool] = None
    maszyny_zgodnie_z_zasadami: Optional[bool] = None
    maszyny_opis: Optional[str] = None
    atest_deklaracja: bool
    ewidencja_srodkow_trwalych: bool


class AccidentReportFormData(BaseModel):
    poszkodowany: PersonData
    adres_zamieszkania: Address
    mieszka_za_granica: bool
    ostatni_adres_pl: Optional[Address] = None
    inny_adres_korespondencyjny: bool
    adres_korespondencyjny: Optional[CorrespondenceAddress] = None
    adres_dzialalnosci: BusinessAddress
    zglaszajacy_inny: bool
    zglaszajacy: Optional[PersonData] = None
    zglaszajacy_adres_zamieszkania: Optional[Address] = None
    zglaszajacy_mieszka_za_granica: Optional[bool] = None
    zglaszajacy_ostatni_adres_pl: Optional[Address] = None
    zglaszajacy_inny_adres_korespondencyjny: Optional[bool] = None
    zglaszajacy_adres_korespondencyjny: Optional[CorrespondenceAddress] = None
    szczegoly: AccidentDetails
    swiadkowie: List[Witness]


# Application models
class ApplicationBase(BaseModel):
    form_data: AccidentReportFormData
    status: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    attachments: Optional[List[Dict[str, Any]]] = None  # {title, mime_type, data(base64)}


class ApplicationUpdate(BaseModel):
    form_data: Optional[AccidentReportFormData] = None
    ai_suggestion: Optional[float] = None
    ai_comments: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

    @field_validator("ai_suggestion")
    @classmethod
    def validate_ai_suggestion(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < 0 or v > 1):
            raise ValueError("ai_suggestion must be between 0 and 1")
        return v


class ApplicationResponse(BaseModel):
    id: str
    created_at: datetime
    updated_at: datetime
    pesel: str
    form_data: AccidentReportFormData
    ai_suggestion: Optional[float] = None
    ai_comments: Optional[Dict[str, Any]] = None
    status: Optional[str] = None
    attachment_ids: List[str] = []


class ApplicationListItem(BaseModel):
    id: str
    pesel: str
    created_at: datetime
    status: Optional[str] = None
    ai_suggestion: Optional[float] = None
    summary: Optional[str] = None  # Brief summary
    attachment_count: int = 0


class ApplicationListResponse(BaseModel):
    items: List[ApplicationListItem]
    total: int
    page: int
    page_size: int


# Attachment models
class AttachmentCreate(BaseModel):
    title: str
    mime_type: str
    data: str  # base64 encoded


class AttachmentMetadata(BaseModel):
    id: str
    title: str
    mime_type: str
    size_bytes: int
    created_at: datetime


class AttachmentListResponse(BaseModel):
    attachments: List[AttachmentMetadata]


# Chat/Form state models
class FormStateResponse(BaseModel):
    fields: AccidentReportFormData
    validation: Dict[str, Any]  # Field errors and validation status
    readyToSkip: bool


class ChatAction(BaseModel):
    type: str  # 'set_field', 'confirm_field', 'ask_clarification'
    field: str
    value: Optional[Any] = None


class ChatMessageRequest(BaseModel):
    sessionId: Optional[str] = None
    message: str


class ChatMessageResponse(BaseModel):
    reply: str
    actions: List[ChatAction]
    updatedState: AccidentReportFormData
    sessionId: Optional[str] = None
    readyToSkip: Optional[bool] = None

