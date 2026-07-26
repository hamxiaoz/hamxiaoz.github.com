# Projects `weight` Ordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `weight` front matter key to `content/projects/` pages so chosen projects can be hoisted to the top of their year group on `/projects`.

**Architecture:** A new `layouts/partials/order-projects.html` takes a list of pages and returns them ordered "weighted first (ascending by weight), then unweighted (newest date first)". `layouts/projects/list.html` runs each of its two existing buckets (`wip`, `ready`) through that partial. Nothing else changes.

**Tech Stack:** Hugo v0.156.0 static site (`/opt/homebrew/bin/hugo`). Go html/template. No JS build, no npm, no test framework.

**Spec:** `docs/superpowers/specs/2026-07-26-projects-weight-ordering-design.md`

## Global Constraints

- Hugo binary is `/opt/homebrew/bin/hugo`; build output goes to `public/`. Run all commands from the repo root `/Users/andrew/code/hamxiaoz.github.com`.
- The shell is fish. Do not use bash-only syntax (`$(...)` command substitution, `export FOO=bar`, `&&` chains are fine).
- `weight` is Hugo's built-in key. Read it as `.Weight`, never `.Params.weight`. Unset yields `0`, which is the sentinel for "unweighted".
- Lower weight sorts higher. Valid values are integers 1 and up.
- The wip/ready split is preserved exactly: the `wip` bucket always renders above the `ready` bucket. Weight never moves a page across that boundary.
- This repo has no test framework. "Tests" are Hugo builds plus diffs of the rendered `public/projects/index.html` against a captured baseline.
- Do **not** merge to `master`. Work stays on the current branch (`work-redesign-mockups`).
- Scratchpad for baselines and temp files: `/private/tmp/claude-501/-Users-andrew-code-hamxiaoz-github-com/9d08982f-8f25-4848-8b04-11640f8e0a64/scratchpad`

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `layouts/partials/order-projects.html` | Owns the "weighted first, then newest-first" ordering rule for one bucket of project pages. Pure function: page list in, ordered page list out. | Create |
| `layouts/projects/list.html` | Year grouping, wip/ready bucketing, rendering. Delegates ordering to the partial. | Modify lines 22–25 |
| `content/projects/*.md` | Optional `weight:` key. Touched only temporarily during Task 3 verification, then reverted. | Temp only |

---

### Task 1: Capture the baseline render

This is the regression fixture. Task 2 must not change a single byte of it, because no project has a `weight` yet.

**Files:**
- Create: `<scratchpad>/projects-baseline.html` (outside the repo — never commit it)

**Interfaces:**
- Consumes: nothing
- Produces: `<scratchpad>/projects-baseline.html`, the pre-change rendering of `/projects/`

- [ ] **Step 1: Confirm the working tree is clean**

```bash
git status --porcelain
```

Expected: empty output. If there are uncommitted changes, stop and ask the user before proceeding — a dirty tree makes the baseline meaningless.

- [ ] **Step 2: Build the site**

```bash
/opt/homebrew/bin/hugo --quiet
```

Expected: exits 0, no output. If it errors, stop — the baseline is invalid and the pre-existing build is broken.

- [ ] **Step 3: Capture the baseline**

```bash
cp public/projects/index.html /private/tmp/claude-501/-Users-andrew-code-hamxiaoz-github-com/9d08982f-8f25-4848-8b04-11640f8e0a64/scratchpad/projects-baseline.html
```

- [ ] **Step 4: Record the current 2026 order for a human-readable sanity check**

Extract the rendered project titles in document order:

```bash
grep -o '<span class="proj-title">[^<]*' public/projects/index.html | sed 's/.*>//' | head -8
```

Expected (the 2026 group, in this order — wip bucket first, then ready by date descending):

```
Life Beat
Trip Deck
Reading Log
Music Practice Stage
Jarvis Desk Controller
Flow Break
LEGO Mosaic Helper
```

If the actual titles differ, that is fine — the exact list depends on `content/projects/` at execution time. Write down whatever the real output is; Task 2 compares against it and Task 3 expects a specific mutation of it. If the class name `proj-title` does not exist, inspect `layouts/partials/project-row.html` and adjust the grep to whatever element carries the title.

- [ ] **Step 5: No commit**

Nothing in the repo changed. Do not commit.

---

### Task 2: Add the ordering partial and wire it in

**Files:**
- Create: `layouts/partials/order-projects.html`
- Modify: `layouts/projects/list.html:22-25`

**Interfaces:**
- Consumes: `<scratchpad>/projects-baseline.html` from Task 1
- Produces: partial `order-projects.html`, invoked as `partial "order-projects.html" PAGES` where `PAGES` is a `page.Pages` value. Returns an ordered collection suitable for `range`.

- [ ] **Step 1: Create the partial**

Create `layouts/partials/order-projects.html` with exactly this content:

```go-html-template
{{- /* Order one bucket of project pages: weighted first (ascending weight),
       then unweighted, newest date first. `weight` is optional front matter;
       unset means 0, which is the "unweighted" sentinel. Lower sorts higher. */ -}}
{{- $weighted := (where . "Weight" "!=" 0).ByWeight -}}
{{- $unweighted := (where . "Weight" "==" 0).ByDate.Reverse -}}
{{- return ($weighted | append $unweighted) -}}
```

- [ ] **Step 2: Wire it into the list layout**

In `layouts/projects/list.html`, replace lines 22–25, which currently read:

```go-html-template
    {{/* Within a year: work-in-progress first, then ready projects (newest first) */}}
    {{ $sorted := .Pages.ByDate.Reverse }}
    {{ $ready := where $sorted "Params.status" "!=" "wip" }}
    {{ $inProgress := where $sorted "Params.status" "wip" }}
```

with:

```go-html-template
    {{/* Within a year: work-in-progress first, then ready projects.
         Inside each bucket, `weight` hoists projects above the date order. */}}
    {{ $ready := partial "order-projects.html" (where .Pages "Params.status" "!=" "wip") }}
    {{ $inProgress := partial "order-projects.html" (where .Pages "Params.status" "wip") }}
```

The `$sorted` variable is deliberately gone — the partial owns sorting now, so pre-sorting the input is dead work. Leave lines 26–36 (the `range $inProgress` / `range $ready` blocks) untouched.

- [ ] **Step 3: Build — this is the gate on `where` resolving `.Weight`**

```bash
/opt/homebrew/bin/hugo --quiet
```

Expected: exits 0, no output.

**If it fails** with an error mentioning `Weight`, `can't evaluate field`, or `unable to find field`, then `where` cannot address the `Weight` method. Do not debug further — replace the body of `layouts/partials/order-projects.html` with this equivalent fallback and re-run this step:

```go-html-template
{{- /* Order one bucket of project pages: weighted first (ascending weight),
       then unweighted, newest date first. `weight` is optional front matter;
       unset means 0, which is the "unweighted" sentinel. Lower sorts higher. */ -}}
{{- $weighted := slice -}}
{{- $unweighted := slice -}}
{{- range . -}}
  {{- if eq .Weight 0 -}}
    {{- $unweighted = $unweighted | append . -}}
  {{- else -}}
    {{- $weighted = $weighted | append . -}}
  {{- end -}}
{{- end -}}
{{- return ((sort $weighted "Weight") | append (sort $unweighted "Date" "desc")) -}}
```

Note for the fallback path: `slice` with no arguments creates an empty slice, and `append` on an empty slice adopts the element type. Both branches must stay guarded by `if eq .Weight 0` rather than `if .Weight`, because `if 0` and `if` on a nil are not the same test in Go templates.

- [ ] **Step 4: Diff against the baseline — expect zero changes**

No project has a `weight` yet, so every page falls into the unweighted branch and the output must be identical.

```bash
diff /private/tmp/claude-501/-Users-andrew-code-hamxiaoz-github-com/9d08982f-8f25-4848-8b04-11640f8e0a64/scratchpad/projects-baseline.html public/projects/index.html
```

Expected: no output, exit 0.

If the diff is non-empty, the ordering rule changed behavior for unweighted pages — that is a bug, not an acceptable difference. The most likely cause is the `.ByDate.Reverse` on the unweighted branch differing from the old `.ByDate.Reverse` applied before bucketing; check whether two projects share an identical date, since Hugo's tiebreaker can flip when the sort is applied at a different stage. Resolve it before continuing.

- [ ] **Step 5: Confirm no other page regressed**

The partial is new, so nothing else can call it, but verify the full build is unchanged in page count.

```bash
/opt/homebrew/bin/hugo | grep -i "pages\|error"
```

Expected: the same page count noted in the project memory (332 pages) and no error lines.

- [ ] **Step 6: Commit**

```bash
git add layouts/partials/order-projects.html layouts/projects/list.html
git commit -m "Add weight-based manual ordering to /projects year groups

Weighted projects sort to the top of their wip/ready bucket, ascending
by weight; unweighted projects follow in newest-first date order."
```

---

### Task 3: Verify weight actually reorders both buckets

Proves the feature works. The weights added here are temporary probes and get reverted at the end of the task — which projects to actually highlight is the user's call, not the implementer's.

**Files:**
- Modify (temporarily, then revert): `content/projects/flow-break.md`, `content/projects/trip-deck.md`

**Interfaces:**
- Consumes: the partial and layout from Task 2
- Produces: nothing committed — this task is a verification gate

- [ ] **Step 1: Add a weight to a ready project that is currently mid-list**

In `content/projects/flow-break.md`, add `weight: 1` to the front matter, after the `status` line:

```yaml
date: 2026-03-19
status: "live"
weight: 1
```

Flow Break is dated 2026-03-19, so today it sits fourth in the 2026 ready bucket, below three newer projects. With `weight: 1` it must jump to the top of that bucket.

- [ ] **Step 2: Add a weight to a wip project that is not currently first**

In `content/projects/trip-deck.md`, add `weight: 1` to the front matter, after the `status` line:

```yaml
date: 2026-07-23
status: "wip"
weight: 1
```

Trip Deck (2026-07-23) currently sits below Life Beat (2026-07-24) in the wip bucket. With `weight: 1` it must move above it.

- [ ] **Step 3: Rebuild and read the 2026 order**

```bash
/opt/homebrew/bin/hugo --quiet
grep -o '<span class="proj-title">[^<]*' public/projects/index.html | sed 's/.*>//' | head -8
```

Expected — Trip Deck now leads the wip bucket, Flow Break now leads the ready bucket, and the remaining unweighted projects keep their relative newest-first order:

```
Trip Deck
Life Beat
Flow Break
Reading Log
Music Practice Stage
Jarvis Desk Controller
LEGO Mosaic Helper
```

If Flow Break appears above Life Beat, the wip/ready boundary was broken — the partial is being applied to the year's whole page list instead of per-bucket. Re-check Task 2 Step 2.

- [ ] **Step 4: Verify relative weights order correctly**

Change `weight: 1` to `weight: 2` in `content/projects/trip-deck.md`, then add `weight: 1` to `content/projects/lifebeat.md`:

```yaml
date: 2026-07-24
status: "wip"
weight: 1
```

Rebuild and re-read:

```bash
/opt/homebrew/bin/hugo --quiet
grep -o '<span class="proj-title">[^<]*' public/projects/index.html | sed 's/.*>//' | head -3
```

Expected: `Life Beat` (weight 1) above `Trip Deck` (weight 2), confirming ascending order.

```
Life Beat
Trip Deck
Flow Break
```

- [ ] **Step 5: Verify a year with no weights is untouched**

```bash
grep -A200 'id="year-2016"' public/projects/index.html | grep -o '<span class="proj-title">[^<]*' | sed 's/.*>//' | head -6
```

Expected: 2016 projects still in newest-first date order (Bella's ABC 11-27, Business Card 10-31, Weekly Project 07-11, OneMessageID 04-01, All My Code Commits 02-16, ATT Redesign 02-01, UX Bootcamp 02-11 — check against the Task 1 Step 4 recording rather than this list, which is derived from front matter dates and may not match exactly if content changed).

- [ ] **Step 6: Verify the tag filter still works**

```bash
/opt/homebrew/bin/hugo server &
```

Open `http://localhost:1313/projects/`, click through two or three tag filter buttons, and confirm rows hide and reveal without reordering and that year headers disappear when a filter empties them. Stop the server afterward.

If browser access is unavailable, verify statically instead — count the filterable rows in the baseline and in the current build:

```bash
grep -c 'data-tags' /private/tmp/claude-501/-Users-andrew-code-hamxiaoz-github-com/9d08982f-8f25-4848-8b04-11640f8e0a64/scratchpad/projects-baseline.html
grep -c 'data-tags' public/projects/index.html
```

Expected: the two counts are equal — reordering must not add or drop rows. Also confirm the `tag-filter` script block is present and unmodified:

```bash
grep -c 'tag-filter-btn' public/projects/index.html
```

Expected: a non-zero count matching the baseline.

- [ ] **Step 7: Revert the probe weights**

```bash
git checkout content/projects/flow-break.md content/projects/trip-deck.md content/projects/lifebeat.md
git status --porcelain
```

Expected: `git status --porcelain` shows no modified files under `content/`.

- [ ] **Step 8: Final build to leave `public/` consistent**

```bash
/opt/homebrew/bin/hugo --quiet
diff /private/tmp/claude-501/-Users-andrew-code-hamxiaoz-github-com/9d08982f-8f25-4848-8b04-11640f8e0a64/scratchpad/projects-baseline.html public/projects/index.html
```

Expected: no output. The site is back to its pre-change rendering, with the `weight` capability in place and dormant.

- [ ] **Step 9: No commit**

Task 2 already committed the feature. Task 3 committed nothing by design.

---

### Task 4: Document the knob

**Files:**
- Modify: `docs/superpowers/specs/2026-07-26-projects-weight-ordering-design.md` (status line only)

**Interfaces:**
- Consumes: verified feature from Task 3
- Produces: nothing consumed by later tasks

- [ ] **Step 1: Mark the spec as implemented**

In `docs/superpowers/specs/2026-07-26-projects-weight-ordering-design.md`, change:

```markdown
**Status:** Approved, ready for implementation
```

to:

```markdown
**Status:** Implemented 2026-07-26
```

- [ ] **Step 2: Note which `where` form shipped**

In the same file, replace the `## Risk` section body with a one-line statement of what actually happened — either:

```markdown
`where` resolved `Weight` as a method, so the three-line form shipped as written.
```

or, if the fallback was needed:

```markdown
`where` could not resolve `Weight` as a method, so the explicit `range` fallback shipped.
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-07-26-projects-weight-ordering-design.md
git commit -m "Mark projects weight ordering spec as implemented"
```

---

## Done When

- `layouts/partials/order-projects.html` exists and is called for both buckets in `layouts/projects/list.html`.
- With no weights set anywhere, `/projects` renders byte-identical to the pre-change baseline.
- Setting `weight: 1` on a project hoists it to the top of its wip/ready bucket, and `weight: 1` sorts above `weight: 2`.
- No content files carry a committed `weight` — that is the user's editorial choice to make next.
- Nothing merged to `master`.

## Follow-up for the user (not part of this plan)

Once this lands, pick which projects to highlight per year and add `weight: 1`, `weight: 2`, … to their front matter. No layout changes needed.
