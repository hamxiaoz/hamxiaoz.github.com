# Publishing Plan — Applied AI Field Notes

How to publish each article across blog, X, LinkedIn, and Medium for maximum exposure and discussion.

**Core principle: POSSE — Publish on Own Site, Syndicate Elsewhere.** Your blog is the canonical home. Every other platform is a copy that points back to it.

**Everything is manual copy-paste.** Medium and LinkedIn have no viable publishing API in 2026, and X's is treated the same way for consistency — the `/publish-hugo-article` skill (`.claude/skills/publish-hugo-article/SKILL.md`) never calls a platform API on your behalf, and never sets `external_url` — the `/writing` and `/blog` cards always keep linking to the canonical blog page, never out to Medium/LinkedIn/X.

---

## Step by step (per article)

1. **Publish on the blog first (canonical).**
   - Check whether the article is already live; if not, publish it.
   - Post the full article at `zurassic.com/writing/…`.
   - Wait ~24h before syndicating so Google indexes your URL as the original.
   - Make sure the footer lists the full series (see below).

2. **Generate the metadata for the article.**
   - The skill generates a LinkedIn hook, LinkedIn hashtags, Medium tags, an X post, and X hashtags — you confirm or edit each one, then it writes them to the article's frontmatter.

3. **LinkedIn — paste the native post the skill prepared.**
   - The skill prints the ready-to-paste post and the posting instructions.
   - Paste it as a native post (fits the ~3,000-char limit), not the Article tool.
   - First 2–3 lines must carry the hook — that's all that shows before the "…more" fold.
   - Put the one blog link in the **first comment**, not the post body.
   - Give the skill the published URL; it records it as `linkedin_url` in the frontmatter.

4. **Medium — import 2–3 days later using the skill's instructions.**
   - The skill prints the import steps and the tags to apply.
   - Use "Import a story" with the canonical URL, or set the canonical URL manually if pasting raw text.
   - Submit to a relevant publication if possible — that's where Medium's reach is.
   - Give the skill the published URL; it records it as `medium_url` in the frontmatter.

5. **X — post as a thread, pasting the tweet the skill prepared.**
   - The skill prints the tweet text. Always manual — copy-paste, no API call.
   - Break the piece at its natural beats: the scene → the 5-min ship → "feedback in minutes" → the lesson.
   - Lead with the strongest hook (the Andrew Ng daughter/son parallel).
   - Put the blog link in the **last tweet**, never the first.
   - Pin the thread. Quote-tweet your best line a day later for a second wave.
   - Give the skill the published URL; it records it as `x_url` in the frontmatter.

6. **Engage in the first 60–90 minutes.**
   - Reply to every comment fast. Early engagement is what the algorithm amplifies.
   - End posts with a question, not a CTA ("What have you built for an audience of one?").

7. **Optional — Product Hunt and HN, for the buildy articles.**
   - Show HN ("I built a music practice app for my 9-year-old" + repo), relevant subreddits.
   - Coordinate Product Hunt to land the same week.

---

## The footer to use in every article

Do **not** build a per-article `[x][linkedin][medium]` link matrix pointing at the *same article's* copies on other platforms — that triggers reach penalties on those platforms and adds nothing the blog needs. The footer below only ever links to sibling articles on your own site, which carries no such penalty.

```
This is part of my series of "Applied AI Field Notes" - a collection of articles on how I use AI in personal and professional life.

- [Applied AI Field Notes 001 - Lego Mosaic Helper](/writing/ai/applied-ai-field-notes-001-lego-mosaic-helper/)
- [Applied AI Field Notes 002 - Family Assistant with OpenClaw](/writing/ai/applied-ai-field-notes-002-family-assistant/)
- [Applied AI Field Notes 003 - My Standing Desk Has an API Now](/writing/ai/applied-ai-field-notes-003-standing-desk-api/)
- **Applied AI Field Notes 004 - My Best Customer Is 9 Years Old** (you're reading it)

_More AI field notes to come._
```

Rules:
- Every title **except the current article** is a link to its canonical Hugo URL (lowercase section path — Hugo lowercases URLs, e.g. a section folder named `AI` renders as `/writing/ai/...`).
- The current article's own entry is **bolded, not linked**, with "(you're reading it)" appended.
- Every article's footer lists the **entire series to date** — when a new article ships, go back and add it to all previous articles' footers too. (This differs from a strict "never touch old posts" policy — the tradeoff here favors readers always seeing the full series over minimizing edits to old files.)
- No separate "Follow me" or hub link lives in this footer — that's handled site-wide by the byline below, not per-article.

**Site-wide "Find me on" byline:** every article page (`layouts/writing/single.html`) automatically renders a small LinkedIn/X/Medium profile-link row after the article body, via the `social-links.html` partial. This is a **profile link**, not a duplicate-content link — pointing at your LinkedIn/X/Medium profile, not at a copy of this same article — so it's exempt from the "no link matrix" rule above. It requires no per-article maintenance: it's rendered from `hugo.toml`'s `[params.social]` values.

---

## Platform roles (2026)

| Platform | Role | Exposure | Discussion | Link rule |
|---|---|---|---|---|
| **X** | Discussion + virality engine (builder/AI crowd) | High | Best | Link in a reply / last tweet, never first |
| **LinkedIn** | Professional reach; series already lives here | Highest organic | Strong | Link in first comment, not the post |
| **Blog** | Canonical home, SEO, owned audience | Low alone | Low | Everything points here |
| **Medium** | SEO archive / long-tail | Medium, declining | Weak | Only with canonical → blog |

**Primary decision (yours):** career/credibility goal → LinkedIn primary. Builder-community/fast discussion goal → X primary. The rest of the plan is unchanged either way.

---

## Details & reasons

### What "canonical" means
When the same article lives at several URLs, search engines must pick which one is the "real" one to rank. If you don't tell them, Google usually credits the high-authority domain (Medium) instead of your blog — so your own words rank under Medium's brand and the ranking signal gets split across copies. The **canonical URL** is the master you declare. On a copy you add:

```html
<link rel="canonical" href="https://zurassic.com/writing/…/" />
```

It tells Google "this is a duplicate — credit the blog URL." Medium supports this; LinkedIn and X don't, which is why you publish the blog first so it's indexed as the original.

### Why full text on X and LinkedIn is fine
The duplicate-content concern really only applies to Google-indexed blogs like Medium. LinkedIn and X posts barely compete in Google search, so pasting the full text natively doesn't hurt the blog's SEO — and because it's native (no external link), you dodge the reach penalty that off-platform links trigger. The catch is **format, not duplication**: X threads out-discuss one long block, and LinkedIn native posts out-reach the Article tool.

### Why the blog stays canonical even when full text is everywhere
LinkedIn and X posts vanish into the feed after a few days and you don't own them. The blog is the permanent, ownable, Google-rankable home. The copies are just distribution.

### Why links get demoted
Every platform demotes content that points off-platform (they want you to keep users on their site). So: keep the first line/CTA link-free, and push links to the footer, a reply, or the first comment.

### Why publish order matters
Blog first → Google indexes your domain as the original before any copy appears. Syndicate after ~24h. Medium last, with the canonical tag, so it never outranks your own words.

### Why everything is manual, not API-driven
Medium stopped issuing new integration tokens (~2025) and its API is unsupported; only a pre-2025 legacy token still works. LinkedIn's native article API needs closed partner access LinkedIn isn't granting, leaving only a self-serve feed post. X's free-tier write API still technically works, but managing OAuth credentials for one platform while the other two are copy-paste isn't worth the inconsistency — so all three are treated as manual, copy-paste-only in this workflow.

### Why engage immediately
On X and LinkedIn, the first 60–90 minutes of engagement is the strongest signal the algorithm uses to decide how far to push a post. Replying fast and ending with a question compounds reach.
