# CV Tracker — Design System & Style Guide

## FILOZOFIA DESIGNU

Aplikacja CV Tracker ma wyglądać jak premium SaaS tool z kategorii "soft dashboard". Styl inspirowany jest nowoczesnym, spokojnym designem z następującymi cechami:

- **Miękki, ale profesjonalny** — nie jest to kolorowy/zabawny UI ani surowy/korporacyjny
- **Karty jako podstawowa jednostka layoutu** — wszystko jest osadzone w białych, zaokrąglonych kartach
- **Subtelna głębia** — delikatne cienie, brak ostrych krawędzi
- **Dużo powietrza** — generyczny spacing, nic nie jest stłoczone
- **Stonowana paleta** — dominują szarości i niebiesko-szare tony z akcentami kolorystycznymi

**Ton:** Spokojny, opanowany, profesjonalny ale ludzki. Jak dobrze zaprojektowana aplikacja do produktywności — Notion meets Linear meets nowoczesny banking app.

---

## PALETA KOLORÓW

### Tło główne (za kartami)
Tło aplikacji to NIE jest biały i NIE jest ciemny. To stonowany, chłodny szaro-niebieski:

```
--bg-app: #C5CBD6;           /* Główne tło za kartami */
--bg-app-darker: #B0B8C5;    /* Ciemniejszy wariant (sidebar hover, footery) */
--bg-app-lighter: #D4D9E2;   /* Jaśniejszy wariant */
```

### Karty i powierzchnie
```
--bg-card: #FFFFFF;           /* Karty — czysta biel */
--bg-card-hover: #FAFBFC;    /* Karta przy hover */
--bg-card-nested: #F5F7FA;   /* Zagnieżdżone elementy wewnątrz kart */
--bg-card-active: #EEF1F6;   /* Aktywny/wybrany element w karcie */
--bg-input: #F3F5F8;         /* Pola input, search bar */
```

### Tekst
```
--text-primary: #1A1D23;     /* Nagłówki, kluczowe treści */
--text-secondary: #5A6170;   /* Opisy, drugorzędne informacje */
--text-tertiary: #8C919D;    /* Placeholdery, hinty, timestamps */
--text-on-accent: #FFFFFF;   /* Tekst na kolorowych badge'ach */
```

### Akcenty kolorystyczne — statusy aplikacji
```
--status-sent: #8C919D;      /* Wysłano — szary */
--status-sent-bg: #F0F1F3;
--status-interview: #3B6FD4; /* Rozmowa — niebieski */
--status-interview-bg: #EBF1FC;
--status-waiting: #D4900A;   /* Oczekuję — bursztynowy */
--status-waiting-bg: #FEF5E7;
--status-offer: #1D8A56;     /* Oferta — zielony */
--status-offer-bg: #E8F7F0;
--status-rejected: #C93B3B;  /* Odrzucone — czerwony (stonowany) */
--status-rejected-bg: #FDECEC;
```

### Akcenty kolorystyczne — priorytety
```
--priority-normal: transparent;
--priority-high: #C93B3B;       /* Czerwony — priorytetowe */
--priority-high-bg: #FDECEC;
--priority-promising: #1D8A56;  /* Zielony — rokujące */
--priority-promising-bg: #E8F7F0;
```

### Akcenty profili
```
--accent-mikolaj: #3B6FD4;      /* Niebieski */
--accent-mikolaj-light: #EBF1FC;
--accent-emilka: #8B5CF6;       /* Fioletowy */
--accent-emilka-light: #F1ECFE;
```

### Kolory kalendarza (event types)
```
--cal-interview: #3B6FD4;
--cal-preparation: #D4900A;
--cal-follow-up: #1D8A56;
--cal-deadline: #C93B3B;
--cal-other: #8C919D;
```

### Utility
```
--border-default: #E5E8ED;     /* Obramowania kart, dividers */
--border-subtle: #EEF0F4;      /* Delikatniejsze separatory */
--shadow-card: 0 2px 12px rgba(0, 0, 0, 0.06), 0 0 1px rgba(0, 0, 0, 0.04);
--shadow-card-hover: 0 4px 20px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04);
--shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.06);
--shadow-dropdown: 0 8px 24px rgba(0, 0, 0, 0.10);
```

---

## TYPOGRAFIA

### Font family
Użyj **DM Sans** z Google Fonts — to jest czyste, nowoczesne i eleganckie, ale nie tak overused jak Inter. Wygląda bardzo dobrze w języku polskim.

```
--font-primary: 'DM Sans', system-ui, -apple-system, sans-serif;
```

Fallback: jeśli DM Sans nie jest dostępny, system-ui zapewni clean look.

### Skala typografii
```
--text-xs: 0.75rem;      /* 12px — timestamps, hinty */
--text-sm: 0.8125rem;    /* 13px — badges, drobne etykiety */
--text-base: 0.9375rem;  /* 15px — body text — UWAGA: nie 16px, lekko mniejszy dla elegancji */
--text-lg: 1.125rem;     /* 18px — sekcje, karty nagłówki */
--text-xl: 1.375rem;     /* 22px — nagłówki stron */
--text-2xl: 1.75rem;     /* 28px — główne tytuły modułów */
--text-3xl: 2.25rem;     /* 36px — duże statystyki, hero numbers */
--text-4xl: 3rem;         /* 48px — mega stats na dashboardzie */
```

### Font weights
```
--font-regular: 400;     /* Body, opisy */
--font-medium: 500;      /* Etykiety, nazwy w listach */
--font-semibold: 600;    /* Nagłówki kart, sekcji */
--font-bold: 700;        /* Duże statystyki, liczby */
```

### Zasady typografii
- Nagłówki stron: `text-2xl font-semibold text-primary` (np. "Moje aplikacje")
- Nagłówki kart: `text-lg font-semibold text-primary` (np. "Income Tracker" w referencji)
- Opisy pod nagłówkami: `text-base font-regular text-secondary`
- Duże liczby na dashboardzie: `text-4xl font-bold text-primary` (np. "+20%", "64", "12")
- Etykiety pod liczbami: `text-sm font-regular text-tertiary` (np. "Proposals sent")
- Badges/pills: `text-sm font-medium`
- Timestamps: `text-xs font-regular text-tertiary`
- Inputy: `text-base font-regular text-primary` z `placeholder: text-tertiary`

---

## BORDER RADIUS

To jest KLUCZOWY element tego stylu — wszystko jest bardzo zaokrąglone:

```
--radius-sm: 8px;        /* Małe elementy: badges, tagi, tooltips */
--radius-md: 12px;       /* Przyciski, inputy, dropdowny */
--radius-lg: 16px;       /* Karty wewnętrzne, sekcje */
--radius-xl: 20px;       /* Główne karty modułów */
--radius-2xl: 24px;      /* Duże karty na dashboardzie */
--radius-full: 9999px;   /* Pills, avatary, search bar */
```

### Zasady zaokrągleń
- **Główne karty (moduły, dashboard widgets):** `rounded-2xl` (24px)
- **Karty wewnętrzne (np. karta firmy w detailach):** `rounded-xl` (20px)
- **Inputy, select, textarea:** `rounded-xl` (12px)
- **Przyciski:** `rounded-xl` (12px), CTA: `rounded-full`
- **Badges, pills statusów:** `rounded-full`
- **Avatary:** `rounded-full`
- **Search bar w topbarze:** `rounded-full`
- **Sidebar:** Nie ma osobnego border-radius — jest integralną częścią layoutu

---

## SPACING & LAYOUT

### Grid
Dashboard używa CSS Grid z auto-fill:
```
--gap-grid: 24px;        /* Gap między kartami */
```

### Spacing wewnętrzny kart
```
--padding-card: 28px;    /* Padding wewnątrz dużych kart */
--padding-card-sm: 20px; /* Mniejsze karty */
--padding-section: 20px; /* Spacing między sekcjami w karcie */
```

### Layout główny
```
Sidebar width: 260px (expanded) / 72px (collapsed)
Topbar height: 72px
Content padding: 28px
Gap między kartami: 24px
```

### Zasada "Dużo powietrza"
- Między nagłówkiem a treścią: min 12px
- Między sekcjami karty: min 24px
- Między kartami: min 24px
- Wewnątrz karty: min 28px padding
- Lista elementów: gap 12-16px między items
- Nigdy nie pozwól elementom się "stłoczyć"

---

## CIENIE

Cienie są SUBTELNE — nie dramatic drop shadows. To jest "floating card" efekt, nie "material design elevation":

```css
/* Karta w spoczynku */
.card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06),
              0 0 1px rgba(0, 0, 0, 0.04);
}

/* Karta przy hover (opcjonalnie, np. na liście) */
.card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08),
              0 0 1px rgba(0, 0, 0, 0.04);
}

/* Modal / overlay */
.modal {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12),
              0 0 1px rgba(0, 0, 0, 0.06);
}

/* Dropdown / popover */
.dropdown {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.10);
}
```

**NIE UŻYWAJ:** `shadow-lg`, `shadow-xl` z Tailwind defaults — są za mocne. Używaj custom shadows zdefiniowanych powyżej.

---

## KOMPONENTY — SZCZEGÓŁOWE WYTYCZNE

### Karty (Cards)
```
Tło: białe (#FFFFFF)
Border-radius: 24px (główne) / 20px (zagnieżdżone)
Shadow: custom (patrz wyżej)
Border: BRAK (shadow wystarczy) — opcjonalnie 1px solid #E5E8ED na zagnieżdżonych
Padding: 28px
```

Karty NIE mają:
- Grubych obramowań
- Ostrych rogów
- Mocnych cieni
- Tła innego niż biel (chyba że nested → wtedy #F5F7FA)

### Przyciski

**Primary (CTA):**
```
Tło: var(--accent-profile) — niebieski lub fioletowy wg profilu
Tekst: biały
Border-radius: 12px (normalny) lub rounded-full (w topbarze/navie)
Padding: 10px 20px
Font: text-sm font-medium
Hover: lekkie przyciemnienie (opacity 0.9 lub darken 5%)
Transition: all 150ms ease
```

**Secondary:**
```
Tło: #F3F5F8
Tekst: var(--text-primary)
Border: 1px solid #E5E8ED
Border-radius: 12px
Hover: tło #EEF1F6
```

**Ghost:**
```
Tło: transparent
Tekst: var(--text-secondary)
Border: none
Hover: tło #F3F5F8
```

**Danger:**
```
Tło: #FDECEC
Tekst: #C93B3B
Border-radius: 12px
Hover: tło #FAD9D9
```

### Badges / Pills

Pill-shaped (`rounded-full`), mały padding, lekkie tło:

```
Status "Wysłano":    bg-[#F0F1F3] text-[#5A6170]
Status "Rozmowa":    bg-[#EBF1FC] text-[#3B6FD4]
Status "Oczekuję":   bg-[#FEF5E7] text-[#D4900A]
Status "Oferta":     bg-[#E8F7F0] text-[#1D8A56]
Status "Odrzucone":  bg-[#FDECEC] text-[#C93B3B]

Priorytet "Wysoki":  bg-[#FDECEC] text-[#C93B3B] — lub mała czerwona kropka
Priorytet "Rokujący": bg-[#E8F7F0] text-[#1D8A56] — lub mała zielona kropka

Font: text-sm (13px) font-medium
Padding: 4px 12px
```

Alternatywnie, badge z ciemnym tłem (jak "Paid" w referencji):
```
bg-[#1A1D23] text-white — dla specjalnych wyróżnień
```

### Inputy i formularze

```
Tło: #F3F5F8
Border: 1px solid transparent
Border-radius: 12px
Padding: 12px 16px
Font: text-base
Placeholder: text-[#8C919D]
Focus: border-color: var(--accent-profile), subtle ring (ring-2 ring-accent/20)
Transition: border-color 150ms, box-shadow 150ms
```

**Select / Dropdown:**
- Wygląda jak input
- Dropdown panel: bg-white, shadow-dropdown, rounded-xl, border 1px #E5E8ED
- Options: hover bg-[#F5F7FA], rounded-lg, padding 10px 14px

**Textarea:**
- Jak input ale wyższy
- Min-height: 100px
- Resize: vertical

### Search Bar (Topbar)

```
Tło: #F3F5F8
Border-radius: rounded-full (9999px)
Padding: 10px 20px 10px 44px (miejsce na ikonę lupy)
Ikona lupy: po lewej, text-[#8C919D]
Placeholder: "Szukaj firmy, stanowiska, rekrutera..." w text-[#8C919D]
Width: ~320px
Focus: bg-white, shadow-card, border 1px #E5E8ED
```

### Command Palette (Ctrl+K)

```
Overlay: bg-black/30, backdrop-blur-sm
Container: bg-white, rounded-2xl, shadow-modal, max-width 560px, centered
Input u góry: duży, bez border, text-lg, padding 20px 24px
Divider: 1px solid #EEF0F4
Wyniki: lista z ikonami, grouped by type
Każdy wynik: padding 12px 24px, hover bg-[#F5F7FA], rounded-lg
Skrót klawiszowy: mały badge bg-[#F0F1F3] rounded-md
```

### Sidebar

```
Tło: #FFFFFF (nie szare, nie ciemne — białe jak karty)
Border-right: 1px solid #E5E8ED
Width: 260px
Padding: 16px

Logo section: padding 20px, margin-bottom 8px
Nav items:
  - Ikona (20px) + tekst
  - Padding: 12px 16px
  - Border-radius: 12px
  - Default: text-[#5A6170]
  - Hover: bg-[#F5F7FA] text-[#1A1D23]
  - Active: bg-accent/10 text-accent, font-medium
  - Gap między items: 4px
```

### Topbar

```
Tło: transparent (tło aplikacji prześwituje) LUB #FFFFFF z border-bottom
Height: 72px
Padding: 0 28px
Layout: flex, justify-between, align-center
Left: breadcrumb lub tytuł strony
Right: search bar, ikony (settings, notifications), avatar profilu
Avatar: 40px, rounded-full, border 2px solid white, shadow-sm
Ikony: 20px, text-[#5A6170], hover text-[#1A1D23]
```

### Tabele

```
Nagłówki: text-xs font-medium text-[#8C919D] uppercase tracking-wider
         Padding: 12px 16px
         Border-bottom: 1px solid #E5E8ED
         Tło: transparent (lub #FAFBFC)

Wiersze: text-base text-[#1A1D23]
         Padding: 16px
         Border-bottom: 1px solid #EEF0F4
         Hover: bg-[#FAFBFC]
         Cursor: pointer (jeśli klikalny)

Zaokrąglenie tabeli: rounded-xl na wrapper, overflow-hidden
```

### Kanban Board

```
Kolumna:
  - Tło: #F5F7FA
  - Border-radius: 20px
  - Padding: 16px
  - Header: text-sm font-semibold + badge z liczbą items

Karta w kolumnie:
  - Tło: #FFFFFF
  - Border-radius: 16px
  - Shadow: shadow-card
  - Padding: 16px 20px
  - Drag handle: 6 kropek po lewej (gripper)
  - Hover: shadow-card-hover, translate-y -1px

Drag state:
  - Karta: opacity 0.9, shadow-lg, rotate(2deg)
  - Drop zone: border 2px dashed accent, bg-accent/5
```

### Wykresy (Dashboard)

Styl wykresów nawiązujący do referencji:

```
Bar chart:
  - Barki: rounded-top (border-radius 6px 6px 0 0)
  - Kolor barów: #D4D9E2 (domyślny) / accent color (wyróżniony)
  - Grid lines: #EEF0F4, dashed
  - Axis text: text-xs text-[#8C919D]
  - Tooltip: bg-[#1A1D23] text-white rounded-lg padding 8px 12px

Donut chart:
  - Kolory wg statusów
  - Grubość: 40px
  - Center: duża liczba + label

Stats z barami (jak "Proposal Progress" w referencji):
  - Pionowe cienkie paski: width 3-4px, gap 2px
  - Aktywne: accent color
  - Nieaktywne: #E5E8ED
  - Rounded-full na każdym pasku
```

### Google Maps Embed

```
Container: rounded-xl, overflow-hidden, border 1px solid #E5E8ED
Height: 200px (w karcie firmy) / 160px (w detailach aplikacji)
Pod mapą: tekst z odległością i czasem dojazdu
  - Ikona pinezki + "~14.2 km" + "~32 min samochodem"
  - text-sm text-[#5A6170]
```

### Kalendarz (react-big-calendar)

```
Override stylów:
  - Header: font-medium, text-[#1A1D23]
  - Dzień dzisiejszy: bg-accent/10, border-radius 12px
  - Event pill: rounded-lg, padding 2px 8px, text-xs font-medium
  - Kolor eventów: wg typu (--cal-interview, --cal-preparation etc.)
  - Hover na evencie: darken 10%, cursor pointer
  - Grid lines: #EEF0F4
  - Weekend columns: bg-[#FAFBFC]
  - Navigation buttons: ghost style, rounded-lg
  - Today button: primary style
```

### Modals / Drawers

```
Overlay: bg-[#1A1D23]/30, backdrop-blur-sm
Container: bg-white, rounded-2xl, shadow-modal
Header: text-xl font-semibold, padding 24px 28px, border-bottom 1px #EEF0F4
Body: padding 28px
Footer: padding 20px 28px, border-top 1px #EEF0F4, flex justify-end gap-12px
Close button: top-right, ghost style, rounded-full, 36px

Animacja: scale(0.96) opacity(0) → scale(1) opacity(1), 200ms ease-out
```

### Toast Notifications

```
Container: bg-white, rounded-xl, shadow-dropdown, border 1px #E5E8ED
Padding: 14px 20px
Ikona: kolorowa wg typu (success: zielona, error: czerwona, info: niebieska)
Tekst: text-sm font-medium
Position: top-right, offset 24px
Animacja: slide-in from right
Duration: 4s
```

### Empty States

```
Container: centered, padding 48px
Ikona: 48px, text-[#C5CBD6]
Tekst główny: text-lg font-medium text-[#5A6170]
Tekst pomocniczy: text-sm text-[#8C919D]
CTA button: primary, centered
```

### Loading / Skeleton

```
Skeleton blocks:
  - Tło: linear-gradient(90deg, #F0F1F3 25%, #E5E8ED 50%, #F0F1F3 75%)
  - Background-size: 200% 100%
  - Animation: shimmer 1.5s infinite
  - Border-radius: matches element (rounded-xl for cards, rounded-full for avatars)

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## ANIMACJE I TRANSITIONS

### Globalne
```css
/* Domyślna transition na interactive elements */
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;

button, a, input, .card-interactive {
  transition: all var(--transition-fast);
}
```

### Page transitions
```
Wejście na stronę: opacity 0 → 1, translateY(8px) → 0, duration 200ms
Wyjście: opacity 1 → 0, duration 100ms
```

### Hover effects
```
Karty klikalne: translateY(-1px) + shadow-card-hover
Przyciski: opacity(0.9) lub darken
Linki: underline lub color change
Ikony: scale(1.05)
Avatary: ring-2 ring-accent/30
```

### Kanban drag
```
Picked up: scale(1.02) rotate(1deg) shadow-lg
Drop zone: scale(1.01) border-dashed accent
Dropped: scale(1) rotate(0) — spring animation
```

---

## RESPONSYWNOŚĆ

Desktop-first, ale z adaptacjami:

```
>= 1440px: Pełny layout — sidebar expanded + content
1024-1439px: Sidebar collapsed (icons only) + content
768-1023px: Sidebar jako overlay/drawer + content full-width
< 768px: Mobile — bottom nav, stacked layout, karty full-width
```

### Breakpoints (Tailwind)
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1440px
```

---

## IKONY

Użyj **Lucide React** konsystentnie. Rozmiar domyślny: 20px. Stroke-width: 1.75 (lekko cieńsze niż default).

Mapowanie ikon:
```
Sidebar:
  - Dashboard: LayoutDashboard
  - Aplikacje: Briefcase
  - Firmy: Building2
  - Rekruterzy: Users
  - Pliki: FolderOpen
  - Kalendarz: CalendarDays

Statusy:
  - Wysłano: Send
  - Rozmowa: MessageSquare
  - Oczekuję: Clock
  - Oferta: Trophy
  - Odrzucone: XCircle

Akcje:
  - Dodaj: Plus
  - Edytuj: Pencil
  - Usuń: Trash2
  - Szukaj: Search
  - Filtruj: SlidersHorizontal
  - Sortuj: ArrowUpDown
  - Widok Kanban: Columns3
  - Widok tabela: Table
  - Widok timeline: GanttChart
  - Kalendarz: CalendarPlus
  - Upload: Upload
  - Podgląd: Eye
  - Link: ExternalLink
  - Mapa: MapPin
  - Notatki: StickyNote
  - Pieniądze: Banknote
  - Godzina: Clock
```

---

## CO NIE WOLNO ROBIĆ (Anti-patterns)

1. **NIE** używaj ostrych rogów (border-radius < 8px) na żadnym elemencie
2. **NIE** używaj ciemnych tematów — to jest jasna, airy aplikacja
3. **NIE** używaj gradientów na przyciskach (flat colors only)
4. **NIE** używaj domyślnych Tailwind cieni (shadow-md, shadow-lg) — custom only
5. **NIE** używaj kolorów o pełnej saturacji (#FF0000, #00FF00) — zawsze stonowane
6. **NIE** dodawaj bordura na głównych kartach (shadow wystarczy)
7. **NIE** używaj fontu Inter, Roboto, Arial — DM Sans jest wybrany
8. **NIE** rób gęstego UI — zawsze dużo powietrza
9. **NIE** używaj ikonek emoji w UI — Lucide icons only
10. **NIE** rób hover efektów, które zmieniają rozmiar/layout elementu (tylko kolor, cień, translate)
11. **NIE** mieszaj border-radius — trzymaj się skali (8/12/16/20/24/full)
12. **NIE** używaj outline: none bez zastąpienia focus-visible stylem
