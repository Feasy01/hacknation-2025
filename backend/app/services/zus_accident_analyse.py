from dataclasses import dataclass
from google import genai



@dataclass
class ZUSOpinion():
    accident_type: str
    '''
    [
        "podczas wykonywania zwykłych czynności związanych z prowadzeniem pozarolniczej działalności",
        "podczas wykonywania zwykłych czynności związanych ze współpracą przy prowadzeniu pozarolniczej działalności",
        "podczas wykonywania pracy na podstawie umowy uaktywniającej, o której mowa w ustawie z dnia 4.02.2011 r. o opiece nad dziećmi w wieku do lat 3",
        "w drodze do lub z miejsca wykonywania pozarolniczej działalności",
        "w drodze do lub z miejsca współpracy przy prowadzeniu pozarolniczej działalności",
        "w drodze do lub z miejsca wykonywania pracy na podstawie umowy uaktywniającej, o której mowa w ustawie o opiece nad dziećmi w wieku do lat 3"
    ]
    '''
    conclusion: str
    justification: str


# Definicja schematu wyjściowego analizy
analiza_schema = {
  "type": "OBJECT",
  "properties": {
    "ZUSOpinion": {
      "type": "OBJECT",
      "properties": {
        "accident_type": {"type": "STRING", "enum": [
            "podczas wykonywania zwykłych czynności związanych z prowadzeniem pozarolniczej działalności",
            "podczas wykonywania zwykłych czynności związanych ze współpracą przy prowadzeniu pozarolniczej działalności",
            "podczas wykonywania pracy na podstawie umowy uaktywniającej, o której mowa w ustawie z dnia 4.02.2011 r. o opiece nad dziećmi w wieku do lat 3",
            "w drodze do lub z miejsca wykonywania pozarolniczej działalności",
            "w drodze do lub z miejsca współpracy przy prowadzeniu pozarolniczej działalności",
            "w drodze do lub z miejsca wykonywania pracy na podstawie umowy uaktywniającej, o której mowa w ustawie o opiece nad dziećmi w wieku do lat 3"
            ]
        },
        "conclusion": {"type": "STRING"},
        "justification": {"type": "STRING"}
      }
    }
  },
  "required": []
}


def zus_accident_analyse(accident_data: dict) -> dict:
    
    client = genai.Client()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Explain how AI works in a few words"
    )
    print(response.text)
    

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    sample_accident = {
        "date": "2023-01-15",
        "location": "Warsaw, Poland",
        "vehicles_involved": 2,
        "injuries": 1,
        "description": "Rear-end collision at traffic light."
    }
    zus_accident_analyse(sample_accident)