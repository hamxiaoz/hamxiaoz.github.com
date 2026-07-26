# Project Number Highlighting — Design

Date: 2026-07-25
Branch: `work-redesign-mockups`
Status: shipped — treatment **A (Ink)** chosen after previewing all three at
`/projects-num/`. That mockup page has been deleted. Content markup is left to
the author; no project description carries a marker yet.

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
| `num-highlight.html` | `==x==` → `<strong class="proj-num">x</strong>` | `project-row.html` (the `/projects` list) |
| `num-strip.html` | `==x==` → `x` | `head.html` meta tags, `project-card.html` |

Both take the description string as the context (`.`) and return a string.
`num-highlight.html` pipes through `safeHTML`.

Two partials rather than one flag-driven partial: each is a single line, and the eventual
cleanup is deleting one file rather than untangling a conditional.

### Call sites

| File | Change |
|---|---|
| `layouts/partials/project-row.html` | highlight |
| `layouts/partials/project-card.html` | strip |
| `layouts/partials/head.html` | strip, so `<meta name="description">` never contains `==` |

`project-card.html` serves `/ann`, `/making`, `/work` and `_default/list`; none of those
render the projects section today, so it never sees a marker. It strips rather than
highlights for two reasons: a future section rendering project pages cannot leak `==`, and
its dark variant would render accent-red `.proj-num` illegibly.

Project single pages fall through to `_default/single`, which is why `head.html` must strip.

### Content changes

None. The author adds markers by hand. Candidates surfaced during the mockup, kept here as
a starting point rather than a prescription:

| File | Candidate phrase |
|---|---|
| `monokai-slate.md` | `34k+ downloads` |
| `clickable-thunder-text.md` | `1k+ users` |
| `music-practice-stage.md` | `50 themes` |
| `flow-break.md` | `100% local processing` |
| `jarvis-desk-controller.md` | `$25 ESP32` |

Poor candidates: `lego-mosaic-helper.md` (`40179` is a set number), `weekly-project.md`
(`2012` is a date), `beijing-air.md` (`v1 API` is a version), `business-card.md`
(`7 square inches` is rhetorical, not a metric).

A description with no marker renders exactly as it does today.

## Visual treatments

Three options, all driven by the identical `.proj-num` markup. Only the CSS block differs,
so the final pick is a one-block swap.

**A — Ink. CHOSEN.** Bold, accent red, in the sentence flow. Now lives in
`static/assets/css/zurassic.css` beside `.proj-desc`.

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

## Mockup delivery (removed)

A throwaway page at `/projects-num/` rendered ten real projects three times, once per
treatment, through the real `project-row.html`. Deleted once Ink was chosen.

One finding worth keeping: **treatment B as specified was wrong.** At
`rgba(147,34,16,0.14)` with a 58%→92% gradient band, the swipe rendered as a thin faint
line that read as a strikethrough rather than a highlight. Anyone revisiting the marker
idea needs a taller band (roughly 12%→90%) and more alpha.

## Verification

- `hugo` builds without error.
- With `==34k+ downloads==` temporarily added to `monokai-slate.md`, `/projects` renders
  `<strong class="proj-num">34k+ downloads</strong>`; the marker was then reverted.
- `<meta name="description">` on the project single page `/projects/monokai-slate/`
  (no permalink override for `projects` in `hugo.toml`, so it renders via
  `layouts/_default/single.html`) contains no `==`.

Not yet checked, because no description carries a marker: how Ink reads at the 640px
breakpoint where `.proj-desc` drops to 13px.
