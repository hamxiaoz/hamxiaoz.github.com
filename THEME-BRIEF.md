# Portfolio Theme Brief for Claude Code

## Context
I have 3 design themes I want to try on my Hugo personal website. The designs were prototyped as React JSX files (attached as reference), but my site uses Hugo with Go templates and CSS. **Do NOT use React** — translate the visual design into Hugo templates + vanilla CSS/SCSS.

## Reference Files
These JSX files are **design specifications only** — extract the visual language, don't port the code:
- `portfolio-apple.jsx` — Apple-inspired theme
- `portfolio-te.jsx` — Teenage Engineering-inspired theme
- `portfolio-nothing-light.jsx` — Nothing.tech light-mode inspired theme

## Information Architecture

The site has two conceptual halves — **professional** and **personal** — given equal weight. They share a single landing page and nav. The visitor should feel like they're meeting a complete person, not just reading a resume.

### Nav Structure (6 items)
```
Home    Work    Writing    Side Projects    Making    博客
─────── professional ─────  ──────── personal ────────
```
Logo/name click also returns Home. The ordering is intentional: professional credibility first, then personal creative side.

### Pages & Content

#### 1. Home (Landing)
- Hero: name, avatar/photo, short bio, tagline
- Social links (GitHub, LinkedIn, Medium, X, Email) — displayed here AND in footer
- Brief preview/teaser of each section (optional, theme-dependent)

#### 2. Work (Professional projects)
- Portfolio of shipped professional work — the "resume" section
- Each card has: title, description, role, company, tags, live_url, article_url
- Sorted by `weight` in frontmatter (manual ordering)
- Cards show a company badge (e.g. "@ Acme Corp")

#### 3. Writing (English articles)
- Articles on leadership, engineering, and AI
- Originally published on Medium / LinkedIn, stored as Hugo content
- The `_index.md` lists these three topic categories
- Each post has: title, excerpt, date, source (Medium/LinkedIn), tags, external_url (optional)

#### 4. Side Projects
- Personal/passion projects — experiments, tools, open source
- Same card format as Work but without company attribution
- Each card has: title, description, tags, live_url, article_url, status (live/beta/wip)

#### 5. Making (Personal creative works, one page)
- Photography, music, and videos all on one page
- Displayed as subsections or a filterable/tabbed grid
- Subtypes:
  - **Photography** — image gallery grid
  - **Music** — audio embeds or links (SoundCloud, Bandcamp, etc.)
  - **Video** — video embeds (YouTube, Vimeo, etc.)
- Frontmatter field `medium` = `"photo"` | `"music"` | `"video"`

#### 6. 博客 (Chinese Blog, top-level)
- Separate Chinese-language content stream
- Life reflections, movie reviews, personal essays
- This is its own world — different audience, different language
- Can have its own tags/categories (e.g. 电影, 生活, 技术)

### Hugo Content Structure
```
content/
├── _index.md                  # Home page
├── work/
│   ├── _index.md
│   ├── aem.md                 # company: "AEM"
│   ├── adp.md                 # company: "ADP"
│   ├── bcg.md                 # company: "BCG"
│   └── insulet.md             # company: "Insulet"
├── writing/
│   └── _index.md              # lists topics: leadership, engineering, AI
├── side-projects/
│   └── _index.md
├── making/
│   ├── _index.md
│   ├── photo/
│   │   └── _index.md
│   ├── music/
│   │   └── _index.md
│   └── video/
│       └── _index.md
└── blog/                      # Chinese blog — ALREADY EXISTS in repo
    └── _index.md              # USE EXISTING, do not overwrite
```

> **Note for Claude Code:** The `content/blog/` section already exists in the repo with its own `_index.md` and posts. Do NOT overwrite or regenerate it — read the existing files first and adapt templates to work with whatever frontmatter and structure is already there. Same applies to any other existing content directories — always check what exists before creating new files.

### Hugo Config Params
```toml
[params]
theme = "apple"  # "apple" | "te" | "nothing"
name = "Your Name"
name_cn = "你的名字"
tagline = "Designer · Developer · Writer"
bio = "..."
avatar = "images/avatar.jpg"

[params.social]
github = "https://github.com/..."
linkedin = "https://linkedin.com/in/..."
medium = "https://medium.com/@..."
x = "https://x.com/..."
email = "hello@example.com"
```

## Implementation Strategy
Create 3 switchable themes using CSS custom properties. Suggested approach:
1. **One shared set of Hugo templates** (`layouts/`) with semantic class names
2. **3 CSS theme files** — e.g. `static/css/apple.css`, `static/css/te.css`, `static/css/nothing-light.css`
3. The config param `params.theme` selects which CSS file to load (use a conditional in `baseof.html`)
4. Each CSS file defines all custom properties + theme-specific layout overrides
5. Shared `base.css` for resets, common utilities, and font imports

---

## Theme 1: Apple

**Aesthetic:** Cinematic whitespace, massive centered type, stacked full-width rounded sections, alternating light/dark blocks.

### Typography
```css
--font-display: -apple-system, 'Helvetica Neue', 'Noto Sans SC', sans-serif;
--font-text: -apple-system, 'Helvetica Neue', 'Noto Sans SC', sans-serif;
--font-cn: 'Noto Serif SC', 'Songti SC', serif;
```

### Colors
```css
--bg: #FBFBFD;
--bg-alt: #F5F5F7;
--bg-dark: #1D1D1F;
--text: #1D1D1F;
--text-secondary: #6E6E73;
--text-tertiary: #AEAEB2;
--accent: #0071E3;
--accent-hover: #0077ED;
--border: #D2D2D7;
```

### Key Layout Patterns
- **Nav:** 48px height, frosted glass (`backdrop-filter: saturate(180%) blur(20px)`), centered max-width 980px. Items: Home, Work, Writing, Side Projects, Making, 博客
- **Hero:** centered text, huge headline (clamp 48–80px, -0.04em tracking, font-weight 700), gradient text fill (`background: linear-gradient(180deg, #1D1D1F 40%, #6E6E73)` with `-webkit-background-clip: text`)
- **Sections:** centered headings, 980px max-width, rounded 20px cards on `#F5F5F7` bg
- **博客:** switches to dark background (`#1D1D1F`) with light text — mimics Apple's alternating product rows
- **Work:** dark cards with soft gradient orbs (`opacity: 0.15, filter: blur(60px)`). Shows company badge on each card
- **Side Projects:** same dark card style as Work but with status badges ("live", "beta") instead of company names
- **Making:** subsections for photo/music/video within one page. Could use tabs or just stacked sections
- **Links:** blue text links with `›` chevron, no underlines
- **Section titles:** end with a period (e.g. "Work." / "Writing." / "Making.")

---

## Theme 2: Teenage Engineering (TE)

**Aesthetic:** Dense, utilitarian, raw industrial catalog. All-lowercase, monospace everything, zero decoration, 1px borders as primary visual element.

### Typography
```css
--font-main: 'IBM Plex Mono', monospace;
--font-cn: 'Noto Sans SC', sans-serif;
```
All text is lowercase. No bold emphasis except titles at font-weight 500.

### Colors
```css
--bg: #FFFFFF;
--text: #000000;
--text-mid: #666666;
--text-dim: #999999;
--text-light: #BBBBBB;
--border: #E5E5E5;
--border-dark: #CCCCCC;
--hover: #F5F5F5;
--red: #FF3B30;
```

### Key Layout Patterns
- **Nav:** 40px height, flat, items separated by 1px left borders, active state = black fill + white text, max-width 1200px. Items: info, work, writing, side projects, making, 博客
- **Hero:** two-column grid — left: name (48px, font-weight 400) + bio, right: metadata table (role, location, status, languages, updated). Social links are joined rectangular buttons with shared borders (no gaps)
- **Work:** rendered as a **4-column catalog grid**, cells separated by 1px borders. Each cell has: company label, title, description, tags joined by ` · `. Launch button = black fill, read more = bordered
- **Side Projects:** same catalog grid as Work but with status badge ("live"/"beta"/"wip", bordered, uppercase, 9px) instead of company label
- **Writing & 博客:** rendered as **HTML `<table>` elements** with columns (title, source/date, tags, link). Header row uses 10px lowercase labels. Row hover = `#F5F5F5` bg
- **Making:** 6-column grid for photos (square, 1px borders, dark overlay on hover). Music/video items as table rows with embed links
- **Footer:** links separated by 1px left borders
- **Counters:** each section shows item count (e.g. "4 projects", "3 entries")

---

## Theme 3: Nothing Light

**Aesthetic:** Nothing.tech's dot-matrix futurism, but inverted to a light background. Monospace uppercase labels, glass-morphism cards, red accent dot, dot-grid SVG decorations.

### Typography
```css
--font-mono: 'Space Mono', monospace;
--font-sans: 'Outfit', sans-serif;
--font-cn: 'Noto Sans SC', sans-serif;
```

### Colors
```css
--bg: #FAFAFA;
--surface: rgba(255,255,255,0.65);
--surface-hover: rgba(255,255,255,0.9);
--border: rgba(0,0,0,0.08);
--border-hover: rgba(0,0,0,0.16);
--text: #141414;
--text-mid: rgba(0,0,0,0.6);
--text-dim: rgba(0,0,0,0.35);
--red: #D73B3B;
```

### Key Layout Patterns
- **Nav:** frosted glass on scroll (`backdrop-filter: blur(24px)`), pill-shaped nav buttons with border, active = filled bg. Logo is uppercase monospace + red dot. Items: Home, Work, Writing, Side Projects, Making, 博客
- **Hero:** two-column — left: uppercase label ("PORTFOLIO / 作品集"), huge name in Outfit (clamp 48–72px, -0.03em tracking) + red period, pill-shaped social link buttons. Right: glass card with avatar + dot grid decoration
- **Glass cards:** `background: rgba(255,255,255,0.65)`, `border: 1px solid rgba(0,0,0,0.08)`, `border-radius: 16px`, `backdrop-filter: blur(12px)`, subtle shadow on hover
- **Dot grids:** small SVG grids of black circles at low opacity (0.06–0.12) placed as decorative elements in corners — use inline SVG or a Hugo partial
- **Section labels:** red circle (8px) + uppercase monospace text + horizontal line (`flex: 1, height: 1px`)
- **Writing:** vertical rotated source label (red, monospace, writing-mode: vertical-lr + rotate 180deg) in a 3-column grid layout inside glass cards
- **Work:** numbered (01, 02...) in red monospace, company badge, dot grid in top-right corner, pill-shaped tag badges, launch button = dark fill (#141414) + white text, rounded. 2-column grid
- **Side Projects:** same glass card style as Work with status badge instead of company, numbered separately
- **Making:** photography as 3-column grid with 12px border-radius, slight border, scale on hover. Music/video as glass cards with embed links
- **博客:** glass cards in 3-column grid, Chinese serif typography (Noto Sans SC), "阅读" CTA with arrow

---

## How to Use This Brief

1. First, explore my current Hugo repo structure (`ls`, `cat config.toml` or `hugo.toml`, browse `layouts/`, `content/`, `assets/` etc.)
2. Understand my existing templates and content structure before making changes
3. Start with **one theme** (I'll tell you which), build the templates and CSS
4. Then add the other two as switchable CSS files
5. Test with `hugo server` after each theme

## Important Notes
- Use Google Fonts links for non-system fonts (Space Mono, Outfit, IBM Plex Mono, Noto Sans SC, Noto Serif SC)
- Support both English and Chinese typography — use appropriate font stacks
- The Making page combines photo/music/video — use Hugo's `where` function to filter by `medium` frontmatter field
- Work page (`content/work/`) shows professional projects with `company` frontmatter field
- Side Projects page (`content/side-projects/`) shows personal projects with `status` field (live/beta/wip)
- Work and Side Projects share the same card partial template — only the badge differs (company vs status)
- Writing section uses `content/writing/` — articles may have `external_url` for original Medium/LinkedIn links
- 博客 is a fully separate Hugo section at `content/blog/` with Chinese-language content
- Keep it semantic HTML — the JSX was for prototyping, the Hugo version should be proper `<nav>`, `<article>`, `<section>`, `<footer>`
- All animations should use CSS only (intersection observer patterns can use a small inline `<script>` with `IntersectionObserver`)
- Social links are defined once in `params.social` and rendered in hero + footer via a shared partial
