import uuid
from copy import deepcopy
from typing import Any, Dict

from app.models.schemas import AccidentReportFormData, Address, AccidentDetails, BusinessAddress, PersonData, Witness
from app.utils.validation import validate_pesel


def generate_session_id() -> str:
    """Generate a new session identifier."""
    return str(uuid.uuid4())


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

    # Basic required fields
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


def apply_form_updates(form_data: AccidentReportFormData, updates: Dict[str, Any]) -> AccidentReportFormData:
    """Apply updates to form data using dot notation paths or nested dictionaries."""
    form_dict = deepcopy(form_data.model_dump())

    def merge_nested_dict(target: Dict[str, Any], source: Dict[str, Any]) -> None:
        """Recursively merge source dict into target dict."""
        for key, value in source.items():
            if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                # Recursively merge nested dictionaries
                merge_nested_dict(target[key], value)
            else:
                # Replace or set the value
                target[key] = value

    def merge_witness_list(existing_list: list, new_list: list) -> list:
        """Merge a list of partial witness objects with existing witnesses."""
        result = deepcopy(existing_list)
        
        for idx, new_witness_data in enumerate(new_list):
            if isinstance(new_witness_data, dict):
                # If updating an existing witness at this index, merge the data
                if idx < len(result) and isinstance(result[idx], dict):
                    # Merge with existing witness
                    merged_witness = deepcopy(result[idx])
                    merge_nested_dict(merged_witness, new_witness_data)
                    result[idx] = merged_witness
                else:
                    # Creating a new witness - need to provide defaults for required fields
                    default_witness = {
                        "id": str(uuid.uuid4()),
                        "imie": "",
                        "nazwisko": "",
                        "ulica": "",
                        "nr_domu": "",
                        "nr_lokalu": "",
                        "kod_pocztowy": "",
                        "miejscowosc": "",
                        "panstwo": None,
                    }
                    # Merge provided data with defaults
                    merge_nested_dict(default_witness, new_witness_data)
                    # Ensure we have enough items in the list (fill with empty witnesses if needed)
                    while len(result) < idx:
                        empty_witness = {
                            "id": str(uuid.uuid4()),
                            "imie": "",
                            "nazwisko": "",
                            "ulica": "",
                            "nr_domu": "",
                            "nr_lokalu": "",
                            "kod_pocztowy": "",
                            "miejscowosc": "",
                            "panstwo": None,
                        }
                        result.append(empty_witness)
                    # Add or update the witness at this index
                    if idx < len(result):
                        result[idx] = default_witness
                    else:
                        result.append(default_witness)
        
        return result

    # Handle top-level updates that might be nested dictionaries
    for path, value in updates.items():
        if "." in path:
            # Dot notation path (e.g., "szczegoly.data")
            keys = path.split(".")
            current = form_dict
            for key in keys[:-1]:
                if isinstance(current, list):
                    try:
                        idx = int(key)
                    except ValueError:
                        break
                    if idx < 0 or idx >= len(current):
                        break
                    current = current[idx]
                else:
                    if key not in current:
                        break
                    current = current[key]
            else:
                if isinstance(current, list):
                    try:
                        idx = int(keys[-1])
                    except ValueError:
                        continue
                    if 0 <= idx < len(current):
                        current[idx] = value
                else:
                    current[keys[-1]] = value
        else:
            # Direct key (e.g., "szczegoly" with nested dict value)
            if path == "swiadkowie" and isinstance(value, list) and isinstance(form_dict.get(path), list):
                # Special handling for swiadkowie list - merge partial updates
                form_dict[path] = merge_witness_list(form_dict[path], value)
            elif path in form_dict and isinstance(form_dict[path], dict) and isinstance(value, dict):
                # Merge nested dictionary instead of replacing
                merge_nested_dict(form_dict[path], value)
            else:
                # Replace or set the value
                form_dict[path] = value

    return AccidentReportFormData(**form_dict)
