# Project Number Highlighting — Design

Date: 2026-07-25
Branch: `work-redesign-mockups`
Status: approved for planning

## Problem

Project descriptions on `/projects` bury their strongest credibility signals in flat prose.
"34k+ downloads on Atom" reads at exactly the same visual weight as the rest of the sentence,
so a scanning reader never sees it.

## Constraint that shapes the solution

Numbers in these descriptions are not one kind of thing:

| Kind | Examples | Highlight? |
|---|---|---|
| Traction | `34k+ downloads`, `1k+ users` | yes |
| Feature counts | `50 themes`, `100% local processing`, `$25 ESP32` | judgment call |
| Incidental | `LEGO Mosaic Maker 40179`, `since 2012`, `Twitter v1 API` | never |

A regex over `\d+` would light up set numbers and years. Automatic detection is therefore
rejected. The author curates each highlight by hand.

## Mechanism

Inline markers in the frontmatter description, using Obsidian's highlight syntax (already
familiar from the author's writing workflow):

```yaml
description: "The best Monokai-based dark theme for JavaScript developers and markdown
  readers. ==34k+ downloads== on Atom, now ported to VS Code."
```

Chosen over a sidecar `metric:` frontmatter field because position within the sentence is
part of the content — `==$25 ESP32==` sits mid-clause, and a sidecar field can only
reconstruct that through brittle string matching against the description.

Rendered as `<strong class="proj-num">` — `<strong>` rather than `<span>` so assistive
technology receives the emphasis. Visual weight is controlled entirely in CSS, so treatments
that are not bold can reset it.

### Two rendering partials

| Partial | Behavior | Consumers |
|---|---|---|
| `num-highlight.html` | `==x==` → `<strong class="proj-num">x</strong>` | mockup page only (for now) |
| `num-strip.html` | `==x==` → `x` | live `/projects`, cards, meta tags |

Both take the description string as the context (`.`) and return a string.
`num-highlight.html` pipes through `safeHTML`.

Two partials rather than one flag-driven partial: each is a single line, and the eventual
cleanup is deleting one file rather than untangling a conditional.

### Call sites

| File | Line | Change |
|---|---|---|
| `layouts/partials/project-row.html` | 36 | accept a `nums` bool in the param dict; highlight when true, strip otherwise |
| `layouts/partials/project-card.html` | 31 | always strip |
| `layouts/partials/head.html` | 7 | strip, so `<meta name="description">` never contains `==` |

`project-row.html` takes the flag because the mockup page reuses it — duplicating the row
partial into the mockup would let the two drift. `project-card.html` serves `/ann`,
`/making`, `/work` and `_default/list`; none of those are the projects section today, but it
strips unconditionally so a future section rendering project pages cannot leak markers.

Project single pages fall through to `_default/single`, which is why `head.html` must strip.

### Content changes

Markers added to five files in `content/projects/`:

| File | Marked phrase |
|---|---|
| `monokai-slate.md` | `34k+ downloads` |
| `clickable-thunder-text.md` | `1k+ users` |
| `music-practice-stage.md` | `50 themes` |
| `flow-break.md` | `100% local processing` |
| `jarvis-desk-controller.md` | `$25 ESP32` |

Deliberately unmarked: `lego-mosaic-helper.md` (`40179` is a set number),
`weekly-project.md` (`2012` is a date), `beijing-air.md` (`v1 API` is a version).
`business-card.md`'s `7 square inches` is rhetorical rather than a metric — left to the
author's judgment after seeing the mockup.

Live `/projects` is visually unchanged by this step: it strips the markers.

## Visual treatments

Three options, all driven by the identical `.proj-num` markup. Only the CSS block differs,
so the final pick is a one-block swap.

**A — Ink.** Bold, accent red, in the sentence flow.

```css
.proj-num { font-weight: 700; color: var(--t-accent-hover); }
```

Quietest and most editorial. Zero layout shift. Uses `--t-accent-hover` (0.90 alpha) rather
than `--t-accent` (0.67) for adequate contrast against `--t-text-mid` body copy.

**B — Marker.** Highlighter swipe behind unchanged text.

```css
.proj-num {
  font-weight: 500;
  color: var(--t-text);
  background-image: linear-gradient(transparent 58%, rgba(147,34,16,0.14) 58%,
                                    rgba(147,34,16,0.14) 92%, transparent 92%);
  padding: 0 2px;
}
```

Reads literally as "highlighted" and scans well. Risk: gimmicky when many rows carry one.

**C — Tab.** Mono pill, baseline-aligned inline.

```css
.proj-num {
  font-family: var(--t-font-mono);
  font-size: 11.5px;
  font-weight: 400;
  color: var(--t-accent-hover);
  background: rgba(147,34,16,0.05);
  border: 1px solid rgba(147,34,16,0.18);
  border-radius: 4px;
  padding: 1px 6px;
  white-space: nowrap;
}
```

Strongest scannability; echoes the existing `.proj-status` and `.proj-tag` pills. Breaks
sentence rhythm the most.

## Mockup delivery

A throwaway Hugo page at `/projects-num/`, following the existing `/work-v*` mockup pattern.

- `content/projects-num/_index.md` — `sitemap.disable: true`
- `layouts/projects-num/list.html` — pulls real pages from the `projects` section, renders
  them three times through `project-row.html` with `"nums" true`, each pass wrapped in
  `.pn-a` / `.pn-b` / `.pn-c`. Treatment CSS is scoped to those wrappers and lives inline in
  this layout, not in `zurassic.css`.

Scope decisions for the mockup:

- **Subset, not the full list.** Ten projects — the five marked ones plus five unmarked — so
  highlight density is legible without 69 rows of scrolling.
- **No tag filter.** Three copies of `.proj-row` would break the filter's querySelectorAll,
  and filtering is not what is being evaluated.
- **No year grouping.** Flat list; grouping adds height without informing the choice.
- A sticky A/B/C jump bar at the top, mirroring `work-variant-switcher.html`.

## Rollout after the pick

1. Move the chosen treatment's CSS into `static/assets/css/zurassic.css` beside `.proj-desc`
   (around line 974), unscoped as `.theme-zurassic .proj-num`.
2. Switch `project-row.html` and `project-card.html` to `num-highlight.html`.
3. Delete `num-strip.html`, `content/projects-num/`, `layouts/projects-num/`.
4. `head.html` keeps stripping — meta descriptions stay plain text permanently.

## Verification

- `hugo` builds without error; page count increases by exactly 1.
- `/projects-num/` renders all three treatments with visible highlights on the five marked rows.
- Live `/projects` shows no `==` characters in the rendered HTML.
- `<meta name="description">` on the project single page `/projects/monokai-slate/`
  (no permalink override for `projects` in `hugo.toml`, so it renders via
  `layouts/_default/single.html`) contains no `==`.
- Mobile breakpoint at 640px: treatment C's pills do not overflow the 88px-thumbnail layout.
