import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const PROFILE = {
  name: "your name",
  nameCn: "你的名字",
  tagline: "designer · developer · writer",
  bio: "I build things at the intersection of design and engineering. With a passion for crafting digital experiences that feel intuitive and delightful, I write about technology, culture, and the spaces in between — in English and 中文.",
  links: [
    { label: "github", url: "#" },
    { label: "linkedin", url: "#" },
    { label: "medium", url: "#" },
    { label: "x", url: "#" },
    { label: "email", url: "mailto:hello@example.com" },
  ],
};

const ARTICLES = [
  { id: 1, title: "building scalable design systems", source: "medium", date: "2025-12-01", excerpt: "A deep dive into component-driven architecture for product teams.", tags: ["design-systems", "engineering"] },
  { id: 2, title: "the art of developer experience", source: "linkedin", date: "2025-10-15", excerpt: "Why the best tools disappear — and what that means for the future.", tags: ["dx", "tooling"] },
  { id: 3, title: "rethinking state management", source: "medium", date: "2025-08-20", excerpt: "Signals, atoms, and the quiet revolution beneath the framework wars.", tags: ["typescript", "frontend"] },
  { id: 4, title: "on writing technical documentation", source: "medium", date: "2025-06-10", excerpt: "Good docs are bridges between creators and users.", tags: ["writing", "dx"] },
];

const BLOG_CN = [
  { id: 1, title: "关于极简主义的思考", date: "2025-11-10", excerpt: "在设计与生活之间，寻找真正重要的东西。" },
  { id: 2, title: "从零到一：我的创业笔记", date: "2025-09-05", excerpt: "记录从一个想法到一个产品的旅程。" },
  { id: 3, title: "技术写作的艺术", date: "2025-07-22", excerpt: "好的技术文档是一座桥梁。" },
];

const PROJECTS = [
  { id: 1, title: "luminance", desc: "real-time collaborative design tool", tags: ["typescript", "webrtc", "canvas"], liveUrl: "#", articleUrl: "#", status: "live" },
  { id: 2, title: "kanji flow", desc: "spaced-repetition for CJK characters", tags: ["react-native", "sqlite", "nlp"], liveUrl: "#", articleUrl: "#", status: "live" },
  { id: 3, title: "spectra cli", desc: "zero-config TS monorepo build tool", tags: ["rust", "node.js", "ast"], liveUrl: null, articleUrl: "#", status: "beta" },
  { id: 4, title: "inkstone", desc: "markdown editor, CJK-first typography", tags: ["electron", "typescript", "mdx"], liveUrl: "#", articleUrl: null, status: "live" },
];

const PHOTOS = [
  { id: 1, alt: "city skyline", color: "#d4d4d4", aspect: "4/3" },
  { id: 2, alt: "mountain trail", color: "#ccc", aspect: "4/3" },
  { id: 3, alt: "tokyo street", color: "#d0d0d0", aspect: "4/3" },
  { id: 4, alt: "morning light", color: "#d8d8d8", aspect: "4/3" },
  { id: 5, alt: "architecture", color: "#d2d2d2", aspect: "4/3" },
  { id: 6, alt: "taipei night market", color: "#d6d6d6", aspect: "4/3" },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  text: "#000000",
  textMid: "#666666",
  textDim: "#999999",
  textLight: "#BBBBBB",
  border: "#E5E5E5",
  borderDark: "#CCCCCC",
  hover: "#F5F5F5",
  red: "#FF3B30",
};

const F = {
  main: "'iA Writer Mono S', 'IBM Plex Mono', 'Noto Sans SC', monospace",
  cn: "'Noto Sans SC', sans-serif",
};

// ─── Components ──────────────────────────────────────────────────────────────

function Nav({ active, onNav }) {
  const items = [
    { id: "home", label: "info" },
    { id: "articles", label: "articles" },
    { id: "blog", label: "博客" },
    { id: "projects", label: "projects" },
    { id: "photos", label: "photos" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${C.border}`, padding: 0,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "stretch", height: 40 }}>
        <button onClick={() => onNav("home")} style={{
          background: "none", border: "none", cursor: "pointer", padding: "0 12px 0 0",
          fontFamily: F.main, fontSize: 12, fontWeight: 400, color: C.text, display: "flex", alignItems: "center",
        }}>
          {PROFILE.name}
        </button>
        <div style={{ display: "flex" }}>
          {items.map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              background: active === item.id ? C.text : "transparent",
              color: active === item.id ? "#fff" : C.textMid,
              border: "none", borderLeft: `1px solid ${C.border}`,
              cursor: "pointer", padding: "0 16px",
              fontFamily: item.id === "blog" ? F.cn : F.main, fontSize: 11,
              transition: "all 0.15s ease",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PortfolioTE() {
  const [active, setActive] = useState("home");
  const refs = useRef({});
  const setRef = useCallback((id) => (el) => { refs.current[id] = el; }, []);
  const nav = (id) => refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    const fn = () => {
      for (const id of ["photos", "projects", "blog", "articles", "home"]) {
        const el = refs.current[id];
        if (el && el.getBoundingClientRect().top <= 120) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const tdStyle = { fontFamily: F.main, fontSize: 12, color: C.textMid, padding: "10px 16px 10px 0", verticalAlign: "top", borderBottom: `1px solid ${C.border}` };
  const tdTitleStyle = { ...tdStyle, color: C.text, fontWeight: 400 };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: 50px; }
        body { margin: 0; background: #fff; color: #000; -webkit-font-smoothing: antialiased; }
        ::selection { background: #000; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #fff; }
        ::-webkit-scrollbar-thumb { background: #ccc; }
        a { color: inherit; }
        table { border-collapse: collapse; width: 100%; }
      `}</style>

      <Nav active={active} onNav={nav} />

      {/* ── INFO ─────────────────────────────────────────────────────── */}
      <section ref={setRef("home")} style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, paddingTop: 20 }}>
          {/* Left — identity */}
          <div>
            <h1 style={{ fontFamily: F.main, fontSize: 48, fontWeight: 400, margin: "0 0 4px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              {PROFILE.name}
            </h1>
            <p style={{ fontFamily: F.cn, fontSize: 14, color: C.textMid, margin: "0 0 24px" }}>
              {PROFILE.nameCn}
            </p>
            <p style={{ fontFamily: F.main, fontSize: 12, color: C.textMid, lineHeight: 1.7, margin: "0 0 32px", maxWidth: 440 }}>
              {PROFILE.bio}
            </p>
            <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
              {PROFILE.links.map((l, i) => (
                <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: F.main, fontSize: 11, color: C.textMid, textDecoration: "none",
                  padding: "6px 14px", border: `1px solid ${C.border}`, borderRight: i < PROFILE.links.length - 1 ? "none" : `1px solid ${C.border}`,
                  transition: "all 0.15s ease", display: "inline-block",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.text; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMid; }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right — meta table */}
          <div>
            <table>
              <tbody>
                <tr>
                  <td style={{ ...tdStyle, color: C.textDim, width: 100 }}>role</td>
                  <td style={tdTitleStyle}>{PROFILE.tagline}</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, color: C.textDim }}>location</td>
                  <td style={tdTitleStyle}>your city</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, color: C.textDim }}>status</td>
                  <td style={tdTitleStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34C759" }} />
                      available for work
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, color: C.textDim }}>languages</td>
                  <td style={tdTitleStyle}>english, 中文</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, color: C.textDim, borderBottom: "none" }}>updated</td>
                  <td style={{ ...tdTitleStyle, borderBottom: "none" }}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "short" })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}><div style={{ borderTop: `1px solid ${C.border}` }} /></div>

      {/* ── ARTICLES — dense table ────────────────────────────────── */}
      <section ref={setRef("articles")} style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontFamily: F.main, fontSize: 12, fontWeight: 400, color: C.textDim, margin: 0, textTransform: "lowercase" }}>articles</h2>
          <span style={{ fontFamily: F.main, fontSize: 11, color: C.textLight }}>{ARTICLES.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              {["title", "source", "date", "tags", ""].map(h => (
                <th key={h} style={{ fontFamily: F.main, fontSize: 10, color: C.textLight, fontWeight: 400, textAlign: "left", padding: "6px 16px 6px 0", borderBottom: `1px solid ${C.borderDark}`, textTransform: "lowercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ARTICLES.map(a => (
              <tr key={a.id} style={{ cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={tdTitleStyle}>{a.title}</td>
                <td style={tdStyle}>{a.source}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}</td>
                <td style={tdStyle}>{a.tags.join(", ")}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <a href="#" style={{ fontFamily: F.main, fontSize: 11, color: C.textMid, textDecoration: "none" }}>read →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}><div style={{ borderTop: `1px solid ${C.border}` }} /></div>

      {/* ── BLOG CN — table variant ──────────────────────────────── */}
      <section ref={setRef("blog")} style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontFamily: F.cn, fontSize: 12, fontWeight: 400, color: C.textDim, margin: 0 }}>博客</h2>
          <span style={{ fontFamily: F.main, fontSize: 11, color: C.textLight }}>{BLOG_CN.length} entries</span>
        </div>
        <table>
          <thead>
            <tr>
              {["标题", "日期", "摘要", ""].map(h => (
                <th key={h} style={{ fontFamily: F.cn, fontSize: 10, color: C.textLight, fontWeight: 400, textAlign: "left", padding: "6px 16px 6px 0", borderBottom: `1px solid ${C.borderDark}` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BLOG_CN.map(p => (
              <tr key={p.id} style={{ cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.hover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ ...tdTitleStyle, fontFamily: F.cn }}>{p.title}</td>
                <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{new Date(p.date).toLocaleDateString("zh-CN")}</td>
                <td style={{ ...tdStyle, fontFamily: F.cn }}>{p.excerpt}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <a href="#" style={{ fontFamily: F.cn, fontSize: 11, color: C.textMid, textDecoration: "none" }}>阅读 →</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}><div style={{ borderTop: `1px solid ${C.border}` }} /></div>

      {/* ── PROJECTS — catalog grid ───────────────────────────────── */}
      <section ref={setRef("projects")} style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontFamily: F.main, fontSize: 12, fontWeight: 400, color: C.textDim, margin: 0 }}>projects</h2>
          <span style={{ fontFamily: F.main, fontSize: 11, color: C.textLight }}>{PROJECTS.length} projects</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: C.border }}>
          {PROJECTS.map(p => (
            <div key={p.id} style={{
              background: "#fff", padding: 20, display: "flex", flexDirection: "column",
              justifyContent: "space-between", minHeight: 220, cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.hover}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <div>
                {/* Status badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{
                    fontFamily: F.main, fontSize: 9, color: p.status === "live" ? "#34C759" : C.red,
                    border: `1px solid ${p.status === "live" ? "#34C759" : C.red}`,
                    padding: "2px 8px", borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {p.status}
                  </span>
                  <span style={{ fontFamily: F.main, fontSize: 10, color: C.textLight }}>
                    {String(p.id).padStart(2, "0")}
                  </span>
                </div>

                {/* Placeholder product image area */}
                <div style={{
                  width: "100%", aspectRatio: "4/3", background: "#f0f0f0", marginBottom: 16,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: F.main, fontSize: 20, color: "#ddd", fontWeight: 600 }}>
                    {p.title.split(" ").map(w => w[0]).join("").toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontFamily: F.main, fontSize: 14, fontWeight: 500, color: C.text, margin: "0 0 4px" }}>
                  {p.title}
                </h3>
                <p style={{ fontFamily: F.main, fontSize: 11, color: C.textMid, margin: "0 0 8px", lineHeight: 1.5 }}>
                  {p.desc}
                </p>
                <p style={{ fontFamily: F.main, fontSize: 10, color: C.textLight, margin: 0 }}>
                  {p.tags.join(" · ")}
                </p>
              </div>

              <div style={{ display: "flex", gap: 0, marginTop: 16 }}>
                {p.liveUrl && (
                  <a href={p.liveUrl} style={{
                    fontFamily: F.main, fontSize: 10, color: "#fff", background: C.text,
                    padding: "6px 14px", textDecoration: "none", display: "inline-block",
                  }}>
                    launch →
                  </a>
                )}
                {p.articleUrl && (
                  <a href={p.articleUrl} style={{
                    fontFamily: F.main, fontSize: 10, color: C.textMid,
                    border: `1px solid ${C.border}`, borderLeft: p.liveUrl ? "none" : `1px solid ${C.border}`,
                    padding: "5px 14px", textDecoration: "none", display: "inline-block",
                  }}>
                    read more
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}><div style={{ borderTop: `1px solid ${C.border}` }} /></div>

      {/* ── PHOTOS — tight grid ──────────────────────────────────── */}
      <section ref={setRef("photos")} style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
          <h2 style={{ fontFamily: F.main, fontSize: 12, fontWeight: 400, color: C.textDim, margin: 0 }}>photos</h2>
          <span style={{ fontFamily: F.main, fontSize: 11, color: C.textLight }}>{PHOTOS.length} images</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, background: C.border }}>
          {PHOTOS.map(p => (
            <div key={p.id} style={{ background: "#fff", cursor: "pointer", position: "relative" }}
              onMouseEnter={e => e.currentTarget.querySelector(".ph-o").style.opacity = 1}
              onMouseLeave={e => e.currentTarget.querySelector(".ph-o").style.opacity = 0}
            >
              <div style={{ aspectRatio: "1/1", background: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
              <div className="ph-o" style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                display: "flex", alignItems: "flex-end", padding: 10, opacity: 0, transition: "opacity 0.2s ease",
              }}>
                <span style={{ fontFamily: F.main, fontSize: 9, color: "#fff", textTransform: "lowercase" }}>{p.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 20px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: F.main, fontSize: 10, color: C.textLight }}>
            © {new Date().getFullYear()} {PROFILE.name}
          </span>
          <div style={{ display: "flex", gap: 0 }}>
            {PROFILE.links.map((l, i) => (
              <a key={l.label} href={l.url} style={{
                fontFamily: F.main, fontSize: 10, color: C.textDim, textDecoration: "none",
                padding: "4px 12px", borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.textDim}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
