# Publishing Plan — Applied AI Field Notes

How to publish each article across blog, X, LinkedIn, and Medium for maximum exposure and discussion.

**Core principle: POSSE — Publish on Own Site, Syndicate Elsewhere.** Your blog is the canonical home. Every other platform is a copy that points back to it.

---

## Step by step (per article)

1. **Publish on the blog first (canonical).**
   - Post the full article at `zurassic.com/writing/…`.
   - Wait ~24h before syndicating so Google indexes your URL as the original.

2. **Update the series hub page** (`zurassic.com/writing`).
   - This is the *only* index you maintain. New articles = edit here, not every old post.

3. **X — post as a thread.**
   - Break the piece at its natural beats: the scene → the 5-min ship → "feedback in minutes" → the lesson.
   - Lead with the strongest hook (the Andrew Ng daughter/son parallel).
   - Put the blog link in the **last tweet**, never the first.
   - Pin the thread. Quote-tweet your best line a day later for a second wave.

4. **LinkedIn — full text as a native post.**
   - Paste the article as a native post (fits the ~3,000-char limit), not the Article tool.
   - First 2–3 lines must carry the hook — that's all that shows before the "…more" fold.
   - Put the one blog link in the **first comment**, not the post body.

5. **Medium — full text with canonical set to your blog.**
   - Publish 2–3 days later. Use "Import a story" or set the canonical URL to the blog.
   - Submit to a relevant publication if possible — that's where Medium's reach is.

6. **Communities — for the buildy articles.**
   - Show HN ("I built a music practice app for my 9-year-old" + repo), relevant subreddits.
   - Coordinate Product Hunt to land the same week.

7. **Engage in the first 60–90 minutes.**
   - Reply to every comment fast. Early engagement is what the algorithm amplifies.
   - End posts with a question, not a CTA ("What have you built for an audience of one?").

---

## The footer to use in every article

Do **not** build a `[x][linkedin][medium][blog]` link matrix — that's 16 hand-edited links and it triggers reach penalties. Use one canonical hub instead:

```
This is part of my "Applied AI Field Notes" series — how I use AI in everyday life:
· 001 — Lego Mosaic Helper
· 002 — Family Assistant with OpenClaw
· 003 — My Standing Desk Has an API Now
· 004 — My Best Customer Is 9 Years Old  (you're reading it)
Full series → zurassic.com/writing
```

Each title links to its canonical blog URL; one "Full series" link to the hub. Never rewritten when you add a new article.

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

### Why engage immediately
On X and LinkedIn, the first 60–90 minutes of engagement is the strongest signal the algorithm uses to decide how far to push a post. Replying fast and ending with a question compounds reach.
