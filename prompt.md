# SOPOT – „Ławeczka / Sopockie Ławeczki” – SPECYFIKACJA + PROMPT DLA AGENTA AI (MVP)

## 0) Cel i filozofia
Zbudować realną, miejską aplikację „Ławeczka” dla Sopotu: mapa ławek + spotkania na ławkach + trasy spacerowe, z naciskiem na prostotę i senior-friendly UX. Zgodnie z dokumentacją: „Bezpieczeństwo > prostota > lokalność > użyteczność”, ale w MVP pomijamy moderację AI i powiadomienia. (Źródło: dokumentacja funkcjonalna i plansze UI)

Ważne założenia:
- MVP jako aplikacja webowa **React (Vite) + Tailwind** w trybie mobile-first (docelowo później React Native).
- Backend projektujemy od zera: **Node.js + Express.js**.
- Autoryzacja Kartą Mieszkańca (QB Mobile) jest **ostatnim etapem** – na teraz robimy architekturę pod podmianę auth, ale w MVP działa login zastępczy (mock).
- Aplikacja jest w pełni darmowa, bez reklam.
- Tylko online (brak trybu offline).
- Mapy: **MapLibre + OpenStreetMap** (dokładne lokalizacje ławek na mapie).
- Ławki miejskie NIE mają źródła GIS – są dodawane przez zalogowanych użytkowników (w przyszłości punkty/rewardy; w MVP punkty tylko się naliczają, nic nie dają).
- Panel admina istnieje, ale jako **osobna aplikacja webowa desktopowa** (nie w MVP mobile web).

## 1) Role użytkownika i dostęp
### 1.1 Gość (niezalogowany)
Może:
- przeglądać mapę ławek,
- przeglądać trasy oficjalne,
- przeglądać trasy publiczne użytkowników,
- widzieć publiczne ławki biznesowe (ale w MVP i tak robimy je jako część funkcji – uproszczenie: „ławka biznesowa” to typ ławki; widoczność zależy od flagi `isPublic`).

Nie może:
- widzieć modułu Spotkania (zakładka może przekierować do logowania),
- tworzyć spotkań, dołączać,
- dodawać tras, ławek,
- używać SOS.

### 1.2 Zalogowany (w przyszłości: Karta Mieszkańca; w MVP: mock login)
Może:
- dodawać ławki,
- tworzyć spotkania i dołączać do istniejących,
- dodawać trasy,
- ulubione (ławki/trasy),
- SOS.

Źródło modelu dostępu: dokumentacja funkcjonalna + tabela dostępu.

## 2) Moduły MVP
### 2.1 HOME
- 3 duże kafelki: Spotkania, Trasy, Ławeczki (senior-friendly, duże elementy).
- Header: profil, tytuł/logo aplikacji, SOS (tylko zalogowany).
- Bottom bar: Home, Trasy, Ławeczki, Spotkania (Spotkania dla gościa -> logowanie).
- Dla gościa: informacja „Aby korzystać ze Spotkań, zaloguj się Kartą Mieszkańca”.

### 2.2 ŁAWEczKI
W MVP:
- widok z kaflami:
  - „Lista ławek”
  - „Mapa ławek”
- Lista ławek: filtrowanie minimalne (np. search po nazwie), typy: miejskie/tematyczne/biznesowe (tematyczne opcjonalnie – można traktować jako tag).
- Mapa: MapLibre/OSM z pinami:
  - miejskie (np. zielone),
  - tematyczne (np. niebieskie),
  - biznesowe (np. pomarańczowe).
- Kliknięcie pinu -> mini popup (nazwa, typ) + „Szczegóły”.
- Szczegóły ławki: opis, zdjęcia (w MVP zdjęcia opcjonalne, bez moderacji), dane dodatkowe (cień/oświetlenie/dostępność jeśli istnieją).

Dodawanie ławki (zalogowany):
- formularz: nazwa, typ, lokalizacja GPS (wybór na mapie), opis, tagi/atrybuty.
- w przyszłości punkty, w MVP: `pointsEarned += X` za dodanie.

### 2.3 SPOTKANIA (tylko zalogowani)
W MVP realizujemy logikę:
- Spotkanie jest powiązane z ławką i przedziałem czasu (`startAt`, `durationMin`, `endAt`).
- W danym czasie **ławka może mieć tylko jedno aktywne spotkanie**.
- Jeśli na ławce istnieje aktywne lub nadchodzące spotkanie w tym przedziale:
  - w UI zamiast „Utwórz spotkanie” pokazujemy „Dołącz do spotkania”.
  - (czyli: użytkownik wybiera ławkę -> system sprawdza dostępność -> decyduje, czy create czy join).

Ekrany:
1) Lista spotkań:
- filtry: Wszystkie / Nadchodzące / Moje
- karty spotkań: tytuł, status (Nadchodzące / W trakcie), ławka, czas, limit uczestników, organizator (w MVP może być nick, później inicjał+wiek).
- akcje: Szczegóły + Dołącz/Opuść

2) Utwórz spotkanie (formularz):
- tytuł (3–80)
- opis (opcjonalny)
- wybór ławki (dropdown + opcja wyboru na mapie)
- data + godzina
- czas trwania 15–180 min (to determinuje auto-zakończenie)
- maks. uczestników (obowiązkowe)
- spotkanie publiczne (checkbox) — UWAGA: zgodnie z polityką z dokumentacji spotkania są niewidoczne dla gości, ale checkbox może oznaczać: „publiczne dla zalogowanych” (nie dla gości). W MVP: `visibility = LOGGED_ONLY` lub `PRIVATE`.
Walidacja i błędy:
- konflikt terminu na ławce: „Wybrana ławka jest zajęta w podanym terminie.”

Auto-zakończenie:
- spotkanie kończy się po `endAt`, backend aktualizuje status (cron/job) albo liczone dynamicznie na read.

### 2.4 TRASY
W MVP:
- Trasy oficjalne: dodane przez admina (ale admin panel jest osobny; w MVP możemy seedować przykładowe trasy w DB).
- Trasy użytkowników: użytkownik dodaje „metadane” (bez nagrywania GPS w MVP):
  - nazwa, opis, czas, kroki, (opcjonalnie dystans), (opcjonalnie zdjęcia max 3)
  - widoczność: prywatna / tylko zalogowani / publiczna
- Gość widzi: oficjalne + publiczne
- Zalogowany widzi: wszystko + swoje

Ekran listy tras:
- karty: nazwa, czas, kroki, mini-opis, etykieta typu (oficjalna/społeczności/moje)
- klik -> szczegóły trasy
Szczegóły trasy:
- opis, metryki, zdjęcia, przyciski: „Dodaj do ulubionych”, „Zgłoś” (w MVP zgłoszenie zapisujemy jako rekord).

## 3) SOS
- widoczny tylko dla zalogowanych.
- w MVP: ekran SOS z wyborem kontaktu (nazwa + numer telefonu) i przycisk „Wyślij alert”.
- Implementacja MVP: zapis „zdarzenia SOS” w backend + opcjonalnie `mailto:`/`tel:` (bez SMS integracji). Integracje przyszłe jako TODO.

## 4) UX / UI (senior-friendly)
- duże kafle, duża typografia, proste komunikaty.
- w ustawieniach:
  - przełącznik wysokiego kontrastu,
  - suwak/wybór rozmiaru czcionki (np. 100% / 115% / 130%).
- brak onboardingu.
- minimalna liczba kroków w formularzach.

Tailwind:
- zdefiniować CSS variables dla trybów:
  - `--font-scale`
  - `--contrast-mode`
- bazowo jasny motyw, mocne przyciski (CTA).

## 5) Technologia – decyzje architektoniczne
### 5.1 Repo: monorepo (zalecane)
- `/apps/web` – React + Vite + Tailwind
- `/apps/api` – Node + Express
- `/packages/shared` – typy DTO, walidacje (np. Zod), helpery

### 5.2 Frontend (apps/web)
- React Router
- stan:
  - TanStack Query do danych (cache, refetch)
  - globalnie: Zustand (ustawienia UI, auth session)
- Mapy:
  - `maplibre-gl` + OSM tiles
- Komponenty:
  - najprościej: Tailwind + własne komponenty + headless (np. Radix) jeśli potrzebne
  - bez ciężkich bibliotek UI, bo senior-friendly i lekko.

### 5.3 Backend (apps/api)
- Express.js
- DB: MySQL (bo łatwo hostować i popularne w twoim stacku)
- ORM: Prisma
- Walidacja: Zod
- Auth:
  - MVP: mock login (np. „Zaloguj testowo” -> backend wydaje JWT)
  - Docelowo: adapter pod QB Mobile (TODO)
- Job/cron:
  - aktualizacja statusów spotkań albo liczenie statusu w runtime

### 5.4 Hosting
- API i web gotowe do wdrożenia na VPS/OVH (docker-compose).
- Web jako statyczny build + Nginx.

## 6) Modele danych (propozycja, Prisma)
### 6.1 User
- id (uuid)
- displayName (string) — MVP
- birthYear (int|null) — docelowo do anonimizacji wieku
- cardExternalId (string|null) — TODO QB Mobile
- role (USER|ADMIN)
- points (int) — punkty za dodawanie ławek (MVP: naliczamy)
- createdAt, updatedAt

### 6.2 Bench
- id (uuid)
- name
- type (CITY|THEMATIC|BUSINESS)
- isPublic (bool) — dla business, widoczne dla gościa tylko gdy true
- lat, lng (decimal)
- description
- attributes (json) — np. shade, lighting, accessible
- createdByUserId
- createdAt

### 6.3 Meeting
- id
- benchId
- createdByUserId
- title
- description
- startAt (datetime)
- durationMin (int)
- maxParticipants (int)
- visibility (PRIVATE|LOGGED_ONLY) — w MVP nie ma „dla gościa”
- createdAt

### 6.4 MeetingParticipant
- meetingId
- userId
- joinedAt

### 6.5 Route
- id
- type (OFFICIAL|COMMUNITY)
- createdByUserId (nullable dla OFFICIAL)
- title
- description
- durationMin
- steps
- distanceKm (nullable)
- visibility (PRIVATE|LOGGED_ONLY|PUBLIC)
- createdAt

### 6.6 Media (zdjęcia do ławek i tras)
- id
- ownerType (BENCH|ROUTE)
- ownerId
- url
- createdAt
W MVP: bez moderacji.

### 6.7 Favorite
- id
- userId
- targetType (BENCH|ROUTE)
- targetId

### 6.8 Report (zgłoszenia)
- id
- reporterUserId
- targetType (BENCH|ROUTE|MEETING)
- targetId
- reason (string)
- createdAt

### 6.9 SosEvent
- id
- userId
- contactName
- contactPhone
- createdAt

## 7) API kontrakt (Express)
Prefix: `/api`

### 7.1 Auth (MVP mock)
- POST `/auth/mock-login` -> { token, user }
- POST `/auth/logout` (opcjonalnie)
TODO: `/auth/qb/callback` itp. po QB Mobile

### 7.2 Users
- GET `/me`
- PATCH `/me/settings` -> { fontScale, highContrast }
- PATCH `/me/profile` -> { displayName, birthYear? }

### 7.3 Benches
- GET `/benches?bbox=&type=&q=`
- GET `/benches/:id`
- POST `/benches` (auth)
- POST `/benches/:id/favorite` (auth)
- DELETE `/benches/:id/favorite` (auth)

### 7.4 Meetings
- GET `/meetings?status=ALL|UPCOMING|MINE`
- GET `/meetings/:id`
- POST `/meetings` (auth)
- POST `/meetings/:id/join` (auth)
- POST `/meetings/:id/leave` (auth)
- GET `/benches/:id/meeting-availability?startAt=&durationMin=` (auth) -> { canCreate, meetingId? }

### 7.5 Routes
- GET `/routes?tab=ALL|OFFICIAL|COMMUNITY|MINE` (tab MINE wymaga auth)
- GET `/routes/:id`
- POST `/routes` (auth)
- POST `/routes/:id/favorite` (auth)
- DELETE `/routes/:id/favorite` (auth)

### 7.6 Reports
- POST `/reports` (auth)

### 7.7 SOS
- POST `/sos` (auth)

## 8) Ekrany i nawigacja (frontend)
Bottom tabs:
- Home
- Trasy
- Ławeczki
- Spotkania (gość -> ekran logowania)

Routes:
- `/` Home
- `/login` (mock)
- `/benches` (kafle)
- `/benches/list`
- `/benches/map`
- `/benches/:id`
- `/benches/add` (auth)
- `/meetings` (auth)
- `/meetings/new` (auth)
- `/meetings/:id` (auth)
- `/routes`
- `/routes/:id`
- `/routes/new` (auth)
- `/settings`

## 9) Najważniejsze reguły biznesowe (MVP)
- Spotkania niewidoczne dla gościa.
- Jedno spotkanie na ławce na dany przedział czasu.
- Automatyczne zakończenie spotkania po czasie trwania.
- Dokładna lokalizacja ławek na mapie.
- Dodawanie ławek tylko dla zalogowanych i naliczanie punktów.
- Brak powiadomień push i przypomnień w MVP.
- Brak moderacji w MVP (zdjęcia mogą być dodane, ale najlepiej limit + proste zasady w UI).
- Całość senior-friendly: duże elementy, prosta nawigacja, ustawienia kontrastu i czcionki.

## 10) Wymagania jakościowe
- szybkie ładowanie mapy (lazy load mapy dopiero w widokach mapy),
- pagination/lazy load dla list,
- obsługa stanów: loading/empty/error,
- basic security: rate limit, CORS, helmet, walidacje Zod,
- logowanie błędów po stronie API.

## 11) Deliverables (co agent AI ma wygenerować)
1) Monorepo z `apps/web` i `apps/api` + `packages/shared`
2) Web:
- pełny UI wg opisanych ekranów
- Tailwind + ustawienia dostępności (fontScale + highContrast)
- MapLibre map view
- integracja z API (TanStack Query)
- mock login
3) API:
- Express + Prisma + MySQL
- migracje + seed (kilka ławek i tras oficjalnych)
- endpointy wg kontraktu
- logika spotkań (availability, join/leave, maxParticipants)
4) Docker Compose (mysql + api + web)
5) README:
- jak uruchomić lokalnie
- jak ustawić ENV
- jak deployować

## 12) TODO po MVP
- integracja QB Mobile (Karta Mieszkańca)
- moderacja zdjęć (AI + ręczna)
- admin panel (osobna aplikacja web desktop)
- nagrywanie tras GPS (1.2+)
- punkty + nagrody / mechanika miejska

---

## PROMPT DLA AGENTA AI (wklej jako 1 wiadomość do generatora)
Zbuduj projekt zgodny z powyższą specyfikacją: monorepo (apps/web React+Vite+Tailwind, apps/api Node+Express+Prisma+MySQL, packages/shared). Wygeneruj kompletny kod, migracje Prisma, seed, docker-compose, oraz README. Zachowaj senior-friendly UI, mapy MapLibre/OSM, logikę spotkań (create vs join przy zajętej ławce), role Gość vs Zalogowany, mock login do czasu integracji QB Mobile. Zadbaj o walidacje, stany UI, oraz czytelną strukturę komponentów.