# CV Tracker

CV Tracker to aplikacja SPA (React + Vite + TypeScript) do zarządzania procesem aplikowania o pracę dla dwóch profili: **Mikołaj** i **Emilka**.

## 1. Wymagania

- Node.js 20+
- Konto Google z dostępem do Google Cloud Console
- Repozytorium GitHub (publikacja na GitHub Pages)

## 2. Uruchomienie lokalne

1. Zainstaluj zależności:

```bash
npm install
```

2. Uzupełnij placeholdery w pliku `/Users/mikolajmarcinkowski/Desktop/cvtracker/src/config.ts`:

- `oauthClientId`
- `configSpreadsheetId`
- `allowedEmails`

3. Uruchom dev server:

```bash
npm run dev
```

4. Zbuduj wersję produkcyjną:

```bash
npm run build
```

## 3. Google Cloud Console (klik po kliku)

### 3.1 Utwórz projekt

1. Wejdź na [Google Cloud Console](https://console.cloud.google.com/).
2. Kliknij selektor projektu w górnym pasku.
3. Kliknij **NOWY PROJEKT**.
4. Wpisz nazwę: `CV Tracker`.
5. Kliknij **UTWÓRZ** i przełącz się na nowy projekt.

### 3.2 Włącz API

1. W menu po lewej kliknij **API i usługi** -> **Biblioteka**.
2. Wyszukaj i włącz kolejno:
- Google Sheets API
- Google Drive API
- Google Calendar API
- Maps JavaScript API
- Geocoding API
- Distance Matrix API
- Maps Embed API

### 3.3 Skonfiguruj ekran zgody OAuth

1. Wejdź: **API i usługi** -> **Ekran zgody OAuth**.
2. Typ użytkownika: **Zewnętrzny**.
3. Nazwa aplikacji: `CV Tracker`.
4. Email pomocy: Twój email.
5. Dodaj zakresy:
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.metadata.readonly`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/calendar.events`
6. Dodaj użytkowników testowych (2 adresy):
- `mikolaj@...`
- `emilka@...`
7. Zapisz.

### 3.4 Utwórz OAuth Client ID

1. Wejdź: **API i usługi** -> **Dane logowania**.
2. Kliknij **UTWÓRZ DANE LOGOWANIA** -> **Identyfikator klienta OAuth**.
3. Typ: **Aplikacja internetowa**.
4. Nazwa: `CV Tracker Web`.
5. **Autoryzowane źródła JavaScript**:
- `https://TWOJ-USERNAME.github.io`
6. **Autoryzowane URI przekierowania**:
- `https://TWOJ-USERNAME.github.io/cvtracker/`
7. Kliknij **Utwórz**.
8. Skopiuj Client ID i wpisz go do `src/config.ts`.

### 3.5 Utwórz API Key dla Maps

1. W **Dane logowania** kliknij **UTWÓRZ DANE LOGOWANIA** -> **Klucz API**.
2. Wejdź w edycję klucza.
3. Ogranicz API do:
- Maps JavaScript API
- Geocoding API
- Distance Matrix API
- Maps Embed API
4. Ogranicz aplikację (HTTP referrers):
- `https://TWOJ-USERNAME.github.io/*`
5. Zapisz.

## 4. Google Sheets (baza danych)

### 4.1 Utwórz arkusz

1. Wejdź na [Google Sheets](https://sheets.google.com).
2. Utwórz nowy arkusz.
3. Nazwij: `CV Tracker — Baza danych`.
4. Skopiuj Spreadsheet ID z URL:
- `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### 4.2 Utwórz zakładki

Dodaj zakładki o nazwach:

- `_Config`
- `Files`
- `Companies`
- `Recruiters`
- `Applications`
- `AppFiles`
- `AppRecruiters`
- `AppSteps`
- `CalendarEvents`

### 4.3 Dodaj nagłówki (wiersz 1)

#### _Config

`key | value`

#### Files

`file_id | profile_id | file_name | file_type | drive_file_id | drive_url | description | version_label | created_at`

#### Companies

`company_id | profile_id | name | industry | website | careers_url | linkedin_url | address | lat | lng | distance_km | travel_time_min | notes | created_at`

#### Recruiters

`recruiter_id | profile_id | first_name | last_name | email | phone | linkedin_url | company_id | notes | created_at`

#### Applications

`app_id | profile_id | company_id | position_title | position_url | status | priority | monthly_salary | hourly_rate | applied_date | response_date | role_description | notes | created_at | updated_at`

#### AppFiles

`app_id | file_id | attached_at`

#### AppRecruiters

`app_id | recruiter_id`

#### AppSteps

`step_id | app_id | step_type | step_name | step_date | step_time | step_notes | google_calendar_event_id | created_at`

#### CalendarEvents

`event_id | profile_id | app_id | title | event_date | event_time | duration_minutes | event_type | google_calendar_event_id | notes | created_at`

### 4.4 Uzupełnij _Config

W `_Config` dodaj co najmniej:

- `GOOGLE_MAPS_API_KEY`
- `GOOGLE_DRIVE_FOLDER_ID`
- `SPREADSHEET_ID` (ten sam arkusz)
- `HOME_ADDRESS_MIKOLAJ`
- `HOME_ADDRESS_EMILKA`

### 4.5 Uprawnienia arkusza

1. Kliknij **Udostępnij**.
2. Dodaj oba emaile jako **Edytor**.
3. Nie ustawiaj publicznego dostępu.

## 5. Google Drive

### 5.1 Utwórz strukturę folderów

Utwórz folder główny: `CV-Tracker` i podfoldery:

```
CV-Tracker/
├── mikolaj/
│   ├── cv/
│   ├── cover-letters/
│   ├── recommendations/
│   └── other/
└── emilka/
    ├── cv/
    ├── cover-letters/
    ├── recommendations/
    └── other/
```

### 5.2 Udostępnienia i ID

1. Udostępnij folder główny obu emailom jako **Edytor**.
2. Skopiuj ID folderu głównego z URL:
- `https://drive.google.com/drive/folders/{FOLDER_ID}`
3. Wpisz ten ID w `_Config` jako `GOOGLE_DRIVE_FOLDER_ID`.

## 6. Konfiguracja aplikacji

Edytuj plik `/Users/mikolajmarcinkowski/Desktop/cvtracker/src/config.ts`:

- `oauthClientId`: OAuth Client ID z Google Cloud
- `configSpreadsheetId`: Spreadsheet ID
- `allowedEmails`: dwa rzeczywiste adresy

## 7. Deploy na GitHub Pages

### 7.1 Repo

1. Utwórz repozytorium: `cvtracker`.
2. Push do gałęzi `main`.

### 7.2 GitHub Pages

1. Wejdź: GitHub -> repo -> **Settings** -> **Pages**.
2. Source: **GitHub Actions**.
3. Workflow `Deploy to GitHub Pages` wykona build i publikację.

### 7.3 Finalna weryfikacja OAuth URL

Po publikacji sprawdź URL:

- `https://TWOJ-USERNAME.github.io/cvtracker/`

Potem wróć do Google Cloud i upewnij się, że Authorized JS origin i Redirect URI dokładnie pasują do URL.

## 8. Troubleshooting

### Błąd: `redirect_uri_mismatch`

- Sprawdź dokładnie Redirect URI w OAuth Client ID.
- Musi być z końcowym `/cvtracker/`.

### Błąd: `Brak GOOGLE_DRIVE_FOLDER_ID` lub brak folderów

- Zweryfikuj `_Config` i strukturę folderów Drive.
- Nazwy folderów muszą być dokładne (`cover-letters`, nie `cover_letters`).
- Upewnij się, że aplikacja ma scope `https://www.googleapis.com/auth/drive.metadata.readonly` oraz że ponownie zalogowano użytkownika po zmianie scope.

### Błąd: `Brak dostępu do arkusza`

- Upewnij się, że oba konta są edytorami arkusza.
- Sprawdź poprawność `configSpreadsheetId` w `src/config.ts`.

### Błąd autoryzacji API Maps

- Sprawdź czy API Key ma właściwe API restrictions i HTTP referrer restrictions.

### Build przechodzi, ale strona pusta na Pages

- Sprawdź czy repo to dokładnie `cvtracker`.
- Sprawdź `base: '/cvtracker/'` w `/Users/mikolajmarcinkowski/Desktop/cvtracker/vite.config.ts`.

### Błąd workflow: `Get Pages site failed` / `Not Found`

- To znaczy, że GitHub Pages nie jest jeszcze włączone dla repo.
- Wejdź: `GitHub -> repo -> Settings -> Pages`.
- W sekcji `Build and deployment` ustaw `Source` na `GitHub Actions`.
- Zapisz i uruchom workflow ponownie (`Actions -> Deploy to GitHub Pages -> Re-run jobs`).
- Opcjonalnie: ustaw secret repo `PAGES_ENABLEMENT_TOKEN` (PAT z uprawnieniem administracyjnym do repo), wtedy workflow może sam włączyć Pages.
