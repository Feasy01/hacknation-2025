# Dokumentacja systemu

## Architektura ogólna
- System składa się z frontendu (Vite + React/TS) oraz backendu (FastAPI) komunikujących się po HTTPS (`/api/*`).
- Dane formularza wypadku mogą być wprowadzane klasycznym wizardem lub przez agenta głosowego ElevenLabs; obie ścieżki synchronizują się przez SSE i webhook na backendzie.
- Analiza merytoryczna dokumentów z wypadku wykonywana jest przez model Gemini (endpoint `/api/zus-accidents/analyse`), a generowanie karty wypadku odbywa się on-demand z backendu.

## Frontend
- Stos: Vite + React + TypeScript + Tailwind/shadcn UI, React Router i React Query (`frontend/src`).
- Główne widoki: kreator zgłoszenia (`Index.tsx`), lista zgłoszeń (`ApplicationsList.tsx`), szczegóły zgłoszenia (`ApplicationDetail.tsx`), tryb urzędnika (`OfficerView`).
- Kreator ma trzy tryby: wizard (kroki 1–8), chat oraz ekran akceptacji po czacie; dane trzymane lokalnie w `AccidentReportForm` i mapowane do modelu backendu.
- Integracja ElevenLabs: widget głosowy (`ElevenLabsWidget`) otwiera rozmowę z agentem, który wysyła aktualizacje formularza na webhook backendu; frontend nasłuchuje na SSE (`/api/elevenlabs/stream/{conversationId}`), dzięki czemu podpowiedzi i poprawki pojawiają się na bieżąco.
- Tryb urzędnika wymusza widok analityczny (kontekst `OfficerViewContext`), co pozwala prezentować scenariusze oceny zgłoszenia.

## Backend
- Stos: FastAPI z modułami routingu w `app/routes`. Obsługiwane obszary: zdrowie (`/api/health`), zgłoszenia (`/api/applications` + załączniki), chat/stan formularza (`/api/elevenlabs/*`), analiza wypadków (`/api/zus-accidents`).
- Przechowywanie: na potrzeby demo używany jest wątkowo-bezpieczny `InMemoryStore` (`database/store.py`) dla zgłoszeń i załączników; indeksuje zgłoszenia po PESEL, pozwala na CRUD i paginację.
- Integracje: moduł `zus_accident_analyse` korzysta z Google Gemini (model `gemini-2.5-flash`) z wymuszonym schematem JSON dla oceny, uzasadnienia i anomalii; generator kart wypadku (`zus_card_generator`) tworzy dokument DOCX strumieniowo (`/api/zus-accidents/generate-card`).
- ElevenLabs: webhook `/api/elevenlabs/webhook` odbiera diff pól z agenta, zapisuje sesję w pamięci i publikuje SSE; manualne zmiany z frontu synchronizowane są przez `/api/elevenlabs/conversation/{conversationId}/sync`, a analiza spójności/kompletności formularza przez `/api/elevenlabs/conversation/{conversationId}/analyse`.

## Dane z ZUS – wypadki
- Dane testowe pochodzą z 111 zgłoszeń wypadków (po 4 pliki na przypadek). Zakres przypadków jest zróżnicowany, ale opisy nie zawsze są wystarczająco precyzyjne, by jednoznacznie wyprowadzić reguły; część spraw wymagała interpretacji kontekstu.
- Wśród 111 przypadków tylko wypadki nr 37, 38, 39 i 54 otrzymały ocenę negatywną, co wskazuje na znaczący bias – dane są mocno dodatnio spolaryzowane i mogą zawyżać skuteczność w testach.

## ElevenLabs i infrastruktura
- Posiadamy agenta ElevenLabs obsługującego rozmowy głosowe; jego identyfikator i adres webhooka są wstrzykiwane z env (`VITE_ELEVENLABS_AGENT_ID`, `VITE_ELEVENLABS_WEBHOOK_URL`).
- Całość (frontend, backend, SSE, webhooki) działa na naszej maszynie/instancji z docker-compose; ElevenLabs korzysta z wystawionego endpointu `/api/elevenlabs/webhook`, a frontend łączy się do tego samego hosta.
