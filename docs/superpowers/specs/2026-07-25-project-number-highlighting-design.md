# Project Number Highlighting — Design

Date: 2026-07-25
Branch: `work-redesign-mockups`
Status: shipped — treatment **B (Marker)** is live.

Ink (A) was chosen first and reverted. Once ten markers were on the page and several
held prose rather than numbers, colouring the words in `--t-accent-hover` made them
read as links: that red is also the `.proj-story` link colour. Marker moves the colour
behind the text instead of into it, so nothing coloured is unclickable. See "Visual
treatments" for the two extra options that were rendered during the second pass.

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

**A — Ink.** Bold, accent red, in the sentence flow. Chosen first, then reverted — see
Status. Fine for short numeric spans, wrong once markers hold prose.

```css
.proj-num { font-weight: 700; color: var(--t-accent-hover); }
```

Quietest and most editorial. Zero layout shift. Uses `--t-accent-hover` (0.90 alpha) rather
than `--t-accent` (0.67) for adequate contrast against `--t-text-mid` body copy.

**B — Marker. CHOSEN.** A highlighter wash over otherwise untouched text. Lives in
`static/assets/css/zurassic.css` beside `.proj-desc`.

```css
.theme-zurassic .proj-num {
  font-weight: inherit;
  padding: 0.04em 3px;
  margin: 0 -3px;
  border-radius: 2px;
  background-image: linear-gradient(180deg,
    rgba(147,34,16,0.13) 0%,
    rgba(147,34,16,0.21) 45%,
    rgba(147,34,16,0.17) 100%);
}
```

Four things this went through, each worth not repeating:

- **Band geometry.** The first attempt ran 58%→92% at 0.14 alpha, leaving a gap above and
  below. It read as a strikethrough. The shipped version is a full graded wash, densest
  around 45%, like ink pooling.
- **Don't stack emphasis.** The first shipped version also set `font-weight: 500` and
  `color: var(--t-text)`. Three signals at once (darker, heavier, washed) made the marked
  phrases outshout the bold project titles. A real highlighter changes neither the ink nor
  the handwriting — only the wash. Both overrides were removed. Testing proved the band
  alpha was never the problem: fading it to 0.10 while keeping weight and colour still felt
  heavy, and raising it to 0.22 with plain text still felt lighter.
- **`font-weight: inherit` is load-bearing.** `.proj-num` renders as `<strong>`, so dropping
  the explicit weight does *not* give you the body weight — the UA default bold takes over
  and the result is heavier than what you removed. Caught by reading computed styles, not
  by looking.
- **Overshoot has a ceiling.** Vertical padding on an inline box expands the paint area
  without changing line height, which is what lets the wash clear the letters. But
  `line-height: 1.6` on 14px gives a 22.4px line box, and at `0.18em` the stroke is 22.0px —
  wrapped fragments end up 0.4px apart and read as one solid block. Measured ladder:

  | Overshoot | Stroke | Gap between wrapped lines |
  |---|---|---|
  | 0 | 17.0px | 5.4px |
  | 0.04em (shipped) | 18.1px | 4.3px |
  | 0.07em | 18.9px | 3.5px |
  | 0.10em | 19.8px | 2.6px |
  | 0.18em | 22.0px | 0.4px |

  If `line-height` on `.proj-desc` ever drops, re-check this — it fails silently.

Survives density better than Ink: with ten markers on the page the wash reads as background
texture rather than ten competing coloured words.

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
sentence rhythm the most, and got worse as markers grew longer than a bare number.

**D — Weight.** Near-black bold, no colour at all.

```css
.proj-num { font-weight: 700; color: var(--t-text); }
```

Added in the second pass. The most direct answer to the link problem and the quietest
option; runner-up to Marker, and the fallback if the swipe ever feels like too much.

**E — Underline.** Dark semibold over an accent rule. Added in the second pass and
immediately rejected: an underline is *the* link signifier, so it reads more clickable
than Ink did. Recorded so nobody proposes it again.

## Mockup delivery (removed)

A throwaway page at `/projects-num/` rendered ten real projects three times, once per
treatment, through the real `project-row.html`. Deleted once Ink was chosen.

One finding worth keeping: **treatment B as specified was wrong.** At
`rgba(147,34,16,0.14)` with a 58%→92% gradient band, the swipe rendered as a thin faint
line that read as a strikethrough rather than a highlight. Anyone revisiting the marker
idea needs a taller band (roughly 12%→90%) and more alpha.

## Verification

- `hugo` exits 0. Check the exit code directly — in fish, `$status` after a pipe reports the
  last command in the pipeline, so `hugo | tail` followed by `$status` measures `tail` and
  always looks green.
- Ten markers across `content/projects/` render as `<strong class="proj-num">`.
- Computed styles on `/projects` match the surrounding copy: marker weight 400 = desc
  weight 400, marker colour `rgba(0,0,0,0.6)` = desc colour. Only the background differs.
- `<meta name="description">` on project single pages (no permalink override for `projects`
  in `hugo.toml`, so they render via `layouts/_default/single.html`) contains no `==`.
- 375×812: five markers wrap across two lines, stroke 17.0px, 3.8px clearance between
  fragments. No collision.

Contrast: the marked text sits at 5.1:1 against its wash, versus 5.7:1 for the body copy on
the page background. Both clear WCAG AA. The earlier dark-text version measured 12.9:1 —
that headroom was traded deliberately for a lighter page.
