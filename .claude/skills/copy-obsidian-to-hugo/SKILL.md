---
name: copy-obsidian-to-hugo
description: >
  Copy an Obsidian markdown article and its images to the Hugo site as a page bundle
  in content/writing/<section>/. Converts ![[wikilinks]] to standard markdown images,
  adds Hugo frontmatter, strips platform comment blocks. Content prose is otherwise untouched.
  Trigger: "copy to hugo", "publish to site", "add to hugo", "/copy-obsidian-to-hugo"
allowed-tools:
  - Read
  - Glob
  - Bash
  - Write
  - AskUserQuestion
---

# copy-obsidian-to-hugo

Copy an Obsidian article and its images into the Hugo site as a page bundle under `content/writing/`.

## Paths

- **Obsidian Writing folder**: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/HQ/Writing/` (iCloud-synced; same path on any of the user's Macs)
- **Hugo site**: the repository this skill lives in — run all commands from the repo root, use repo-relative paths (`content/writing/...`)

## Steps

1. **Parse input** — extract the Obsidian filename or path from the user's message. If only a filename is given, look for it under the Obsidian Writing folder using Glob.

2. **Ask for section if not provided:**
   > Which writing section? `AI` / `engineering` / `fp` / `leadership` / `spaces-in-between`

3. **Read the file** — full content.

4. **Extract metadata:**
   - **Title**: the first `# Heading` found in the document; fall back to the filename (spaces → title case) if none
   - **Date**: today's date as `YYYY-MM-DD`
   - **Images**: all `![[filename.ext]]` patterns

5. **Determine slug** — from the Obsidian filename: lowercase, replace spaces and hyphens with single hyphens, strip special characters. Example: `AI Field Notes - Family Assistant.md` → `ai-field-notes-family-assistant`

6. **Create the Hugo page bundle directory:**
   ```
   content/writing/<section>/<slug>/
   ```

7. **Copy all referenced images** from the Obsidian Writing folder to the bundle directory using `cp`.

8. **Write `index.md`** to the bundle with these minimal transformations — everything else is verbatim:
   - Prepend Hugo frontmatter if not already present:
     ```yaml
     ---
     title: "<extracted title>"
     date: <YYYY-MM-DD>
     ---
     ```
   - Strip any `<!-- ... -->` HTML comment blocks (platform notes)
   - Remove the `# Title` H1 line if it was used as the frontmatter title (avoid duplicate)
   - Convert `![[image.png]]` → `![](image.png)`

9. **Confirm** — print the bundle path, list copied images, and show the frontmatter that was written.
