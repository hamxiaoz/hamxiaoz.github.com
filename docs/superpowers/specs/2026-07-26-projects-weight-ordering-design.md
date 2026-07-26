# Manual ordering for /projects via `weight`

**Date:** 2026-07-26
**Status:** Implemented 2026-07-26

## Problem

`/projects` groups projects by year, and within a year the order is fixed by two rules:
work-in-progress first, then everything else newest-first by date. There is no way to
highlight a particular project within its year — the only lever is falsifying its date.

## Solution

An optional `weight` front matter key on pages in `content/projects/`, used to hoist chosen
projects to the top of their year.

### Front matter

```yaml
---
title: "Flow Break"
date: 2026-03-19
status: "live"
weight: 1
---
```

- Optional. Most projects omit it; it is a highlight knob, not a required field.
- Integer, 1 or greater. Lower numbers sort higher.
- Reuses Hugo's built-in `weight` key, so it is read as `.Weight` with no custom param
  handling. An omitted key yields `0`, which is the sentinel for "unweighted". A literal
  `weight: 0` is therefore indistinguishable from omitting the key — use 1 or greater.

### Ordering rules

Grouping by year is unchanged. Within a year:

1. The `wip` bucket renders above the `ready` bucket (unchanged).
2. Inside each bucket: weighted projects first, ascending by weight; then unweighted
   projects, newest date first.

A weighted project outranks a *newer* unweighted project inside its bucket — that is the
purpose of the knob. It cannot cross the wip/ready boundary; hoisting a shipped project
above a work-in-progress one is out of scope.

Example for a year holding one weighted wip project and one weighted ready project:

```
2026
  ── wip bucket ──
  Life Beat        weight: 1
  Some WIP         (no weight)
  ── ready bucket ──
  Flow Break       weight: 1
  Reading Log      (2026-05, no weight)
  Monokai Slate    (2026-02, no weight)
```

## Implementation

### New: `layouts/partials/order-projects.html`

Takes a page list, returns the ordered slice. Both buckets call it, so the rule lives in
one place rather than being duplicated.

```go-html-template
{{- /* Order a project bucket: weighted first (ascending), then unweighted newest-first */ -}}
{{- $weighted   := (where . "Weight" "!=" 0).ByWeight -}}
{{- $unweighted := (where . "Weight" "==" 0).ByDate.Reverse -}}
{{- return ($weighted | append $unweighted) -}}
```

### Changed: `layouts/projects/list.html`

The two existing bucket variables are passed through the partial before ranging. The
existing `$sorted := .Pages.ByDate.Reverse` line is dropped — the partial now owns sorting,
so pre-sorting the input is redundant:

```go-html-template
{{ $inProgress := partial "order-projects.html" (where .Pages "Params.status" "wip") }}
{{ $ready      := partial "order-projects.html" (where .Pages "Params.status" "!=" "wip") }}
```

Nothing else in the layout changes. The tag filter hides rows client-side and never
reorders, so it is unaffected.

### Risk

`where` resolved `Weight` as a method, so the three-line form shipped as written.

## Scope

Only `layouts/projects/list.html` and the new partial. The `/work` variant layouts read
`content/work/`, not `content/projects/`, so they are untouched.

## Verification

1. Add `weight` to two projects in the same year — one `wip`, one `ready`.
2. `hugo build`, then inspect the rendered `/projects/index.html` and confirm both land at
   the top of their respective buckets.
3. Confirm a year containing no weighted projects renders byte-identical to the current
   output.
4. Confirm the tag filter still hides and reveals rows without disturbing order.
