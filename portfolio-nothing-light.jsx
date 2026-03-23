import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const PROFILE = {
  name: "Your Name",
  nameCn: "你的名字",
  tagline: "Designer · Developer · Writer",
  bio: "I build things at the intersection of design and engineering. With a passion for crafting digital experiences that feel both intuitive and delightful, I write about technology, culture, and the spaces in between — in English and 中文.",
  links: [
    { label: "GitHub", url: "#" },
    { label: "LinkedIn", url: "#" },
    { label: "Medium", url: "#" },
    { label: "X / Twitter", url: "#" },
    { label: "Email", url: "mailto:hello@example.com" },
  ],
};

const ARTICLES = [
  { id: 1, title: "Building Scalable Design Systems", source: "Medium", date: "2025-12-01", excerpt: "A deep dive into component-driven architecture for product teams.", tags: ["Design Systems", "Engineering"] },
  { id: 2, title: "The Art of Developer Experience", source: "LinkedIn", date: "2025-10-15", excerpt: "Why the best tools disappear — and what that means for the future.", tags: ["DX", "Tooling"] },
  { id: 3, title: "Rethinking State Management", source: "Medium", date: "2025-08-20", excerpt: "Signals, atoms, and the quiet revolution beneath the framework wars.", tags: ["TypeScript", "Frontend"] },
];

const BLOG_CN = [
  { id: 1, title: "关于极简主义的思考", date: "2025-11-10", excerpt: "在设计与生活之间，寻找真正重要的东西。" },
  { id: 2, title: "从零到一：我的创业笔记", date: "2025-09-05", excerpt: "记录从一个想法到一个产品的旅程。" },
  { id: 3, title: "技术写作的艺术", date: "2025-07-22", excerpt: "好的技术文档是一座桥梁，连接创造者与使用者。" },
];

const PROJECTS = [
  { id: 1, title: "Luminance", desc: "Real-time collaborative design tool for distributed teams.", tags: ["TypeScript", "WebRTC"], liveUrl: "#", articleUrl: "#" },
  { id: 2, title: "Kanji Flow", desc: "Spaced-repetition app for learning CJK characters.", tags: ["React Native", "NLP"], liveUrl: "#", articleUrl: "#" },
  { id: 3, title: "Spectra CLI", desc: "Zero-config build tool for TypeScript monorepos.", tags: ["Rust", "Node.js"], liveUrl: null, articleUrl: "#" },
  { id: 4, title: "Inkstone", desc: "Markdown editor with live preview and CJK typography.", tags: ["Electron", "MDX"], liveUrl: "#", articleUrl: null },
];

const PHOTOS = [
  { id: 1, alt: "City skyline at dusk", color: "#E8E8EA", aspect: "3/4" },
  { id: 2, alt: "Mountain trail", color: "#E4E6E4", aspect: "4/3" },
  { id: 3, alt: "Street — Tokyo", color: "#E6E4E4", aspect: "1/1" },
  { id: 4, alt: "Morning light", color: "#E4E6E8", aspect: "16/9" },
  { id: 5, alt: "Architecture", color: "#E6E6E2", aspect: "3/4" },
  { id: 6, alt: "Night market — Taipei", color: "#E8E6E4", aspect: "4/3" },
];

// ─── Dot Pattern SVG (dark dots on light bg) ─────────────────────────────────
function DotGrid({ size = 200, dotSize = 1.5, gap = 14, opacity = 0.12 }) {
  const cols = Math.ceil(size / gap);
  const rows = Math.ceil(size / gap);
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(<circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r={dotSize} fill="#000" opacity={opacity} />);
    }
  }
  return (
    <svg width={size} height={size} style={{ position: "absolute", pointerEvents: "none" }}>
      {dots}
    </svg>
  );
}

// ─── Reveal Hook ─────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── Light Palette ───────────────────────────────────────────────────────────
const C = {
  bg: "#FAFAFA",
  surface: "rgba(0,0,0,0.025)",
  surfaceHover: "rgba(0,0,0,0.05)",
  border: "rgba(0,0,0,0.08)",
  borderHover: "rgba(0,0,0,0.16)",
  text: "#141414",
  textMid: "rgba(0,0,0,0.6)",
  textDim: "rgba(0,0,0,0.35)",
  accent: "#141414",
  red: "#D73B3B",
};

const F = {
  mono: "'Space Mono', 'Noto Sans SC', monospace",
  sans: "'Outfit', 'Noto Sans SC', sans-serif",
  cn: "'Noto Sans SC', sans-serif",
};

// ─── Components ──────────────────────────────────────────────────────────────

function Nav({ active, onNav }) {
  const items = [
    { id: "home", label: "Home" },
    { id: "articles", label: "Articles" },
    { id: "blog", label: "博客" },
    { id: "projects", label: "Projects" },
    { id: "photos", label: "Photos" },
  ];
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "16px 0",
      background: scrolled ? "rgba(250,250,250,0.82)" : "transparent",
      backdropFilter: scrolled ? "blur(24px) saturate(1.4)" : "none",
      borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => onNav("home")} style={{
          background: "none", border: "none", cursor: "pointer",
          fontFamily: F.mono, fontSize: 13, color: C.text, letterSpacing: "0.08em", textTransform: "uppercase", padding: 0,
        }}>
          {PROFILE.name}
          <span style={{ color: C.red, marginLeft: 2 }}>.</span>
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              background: active === item.id ? "rgba(0,0,0,0.06)" : "none",
              border: `1px solid ${active === item.id ? C.border : "transparent"}`,
              cursor: "pointer", padding: "6px 14px", borderRadius: 100,
              fontFamily: item.id === "blog" ? F.cn : F.mono, fontSize: 11,
              color: active === item.id ? C.text : C.textMid,
              letterSpacing: "0.04em", textTransform: item.id !== "blog" ? "uppercase" : "none",
              transition: "all 0.2s ease",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function GlassCard({ children, style = {}, hoverable = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hoverable && setHovered(true)}
      onMouseLeave={() => hoverable && setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
        border: `1px solid ${hovered ? C.borderHover : C.border}`,
        borderRadius: 16,
        backdropFilter: "blur(12px)",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.04)" : "0 1px 4px rgba(0,0,0,0.02)",
        transition: "all 0.3s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red }} />
      <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textMid, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PortfolioNothingLight() {
  const [active, setActive] = useState("home");
  const refs = useRef({});
  const setRef = useCallback((id) => (el) => { refs.current[id] = el; }, []);
  const nav = (id) => refs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    const fn = () => {
      for (const id of ["photos", "projects", "blog", "articles", "home"]) {
        const el = refs.current[id];
        if (el && el.getBoundingClientRect().top <= 200) { setActive(id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: 80px; }
        body { margin: 0; background: #FAFAFA; color: #141414; -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(215,59,59,0.15); color: #141414; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #FAFAFA; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 2px; }
      `}</style>

      <Nav active={active} onNav={nav} />

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section ref={setRef("home")} style={{ minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "120px 32px 80px" }}>
        {/* Dot grids */}
        <div style={{ position: "absolute", top: 60, right: 60, opacity: 0.5 }}><DotGrid size={180} gap={16} dotSize={1} opacity={0.08} /></div>
        <div style={{ position: "absolute", bottom: 80, left: 40, opacity: 0.4 }}><DotGrid size={120} gap={12} dotSize={1} opacity={0.06} /></div>
        {/* Red glow — softer on light */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(215,59,59,0.05), transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <Reveal>
              <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 20px" }}>
                Portfolio / 作品集
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 style={{ fontFamily: F.sans, fontSize: "clamp(48px, 6vw, 72px)", fontWeight: 700, color: C.text, margin: "0 0 8px", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
                {PROFILE.name}
                <span style={{ color: C.red }}>.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p style={{ fontFamily: F.mono, fontSize: 13, color: C.textMid, margin: "0 0 32px", letterSpacing: "0.04em" }}>
                {PROFILE.tagline}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p style={{ fontFamily: F.sans, fontSize: 16, color: C.textMid, lineHeight: 1.7, margin: "0 0 40px", maxWidth: 440 }}>
                {PROFILE.bio}
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {PROFILE.links.map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 100,
                    border: `1px solid ${C.border}`, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)",
                    color: C.textMid, textDecoration: "none", fontFamily: F.mono, fontSize: 11,
                    letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.color = C.text; e.currentTarget.style.background = "rgba(255,255,255,0.95)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMid; e.currentTarget.style.background = "rgba(255,255,255,0.6)"; }}
                  >
                    {link.label} <ArrowIcon />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Avatar / Visual block */}
          <Reveal delay={0.15}>
            <GlassCard hoverable={false} style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 360, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 16, left: 16 }}><DotGrid size={80} gap={10} dotSize={1} opacity={0.07} /></div>
              <div style={{
                width: 120, height: 120, borderRadius: "50%", border: `2px solid ${C.border}`,
                background: "rgba(0,0,0,0.02)", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: F.sans, fontSize: 40, fontWeight: 300, color: C.textMid, marginBottom: 24,
              }}>
                {PROFILE.name.charAt(0)}
              </div>
              <p style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
                {PROFILE.nameCn} — {new Date().getFullYear()}
              </p>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      {/* ── ARTICLES ────────────────────────────────────────────────── */}
      <section ref={setRef("articles")} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <Reveal><SectionLabel>Articles · 文章</SectionLabel></Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {ARTICLES.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06}>
              <a href="#" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <GlassCard style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
                  <div style={{ fontFamily: F.mono, fontSize: 11, color: C.red, letterSpacing: "0.08em", textTransform: "uppercase", writingMode: "vertical-lr", transform: "rotate(180deg)", whiteSpace: "nowrap" }}>
                    {a.source}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: F.sans, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 6px", letterSpacing: "-0.01em" }}>{a.title}</h3>
                    <p style={{ fontFamily: F.sans, fontSize: 14, color: C.textMid, margin: "0 0 10px", lineHeight: 1.5 }}>{a.excerpt}</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, letterSpacing: "0.06em" }}>{new Date(a.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                      {a.tags.map(t => (
                        <span key={t} style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, border: `1px solid ${C.border}`, padding: "1px 8px", borderRadius: 100 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ color: C.textDim }}><ArrowIcon /></div>
                </GlassCard>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── BLOG CN ─────────────────────────────────────────────────── */}
      <section ref={setRef("blog")} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <Reveal><SectionLabel>博客 · Chinese Blog</SectionLabel></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {BLOG_CN.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <a href="#" style={{ textDecoration: "none", display: "block" }}>
                <GlassCard style={{ padding: 28, minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim }}>{new Date(p.date).toLocaleDateString("zh-CN")}</span>
                    <h3 style={{ fontFamily: F.cn, fontSize: 20, fontWeight: 700, color: C.text, margin: "12px 0 8px", lineHeight: 1.5 }}>{p.title}</h3>
                    <p style={{ fontFamily: F.cn, fontSize: 14, color: C.textMid, margin: 0, lineHeight: 1.7 }}>{p.excerpt}</p>
                  </div>
                  <div style={{ fontFamily: F.cn, fontSize: 12, color: C.textDim, marginTop: 20, display: "flex", alignItems: "center", gap: 4 }}>
                    阅读 <ArrowIcon />
                  </div>
                </GlassCard>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PROJECTS ────────────────────────────────────────────────── */}
      <section ref={setRef("projects")} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <Reveal><SectionLabel>Projects · 作品</SectionLabel></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <GlassCard style={{ padding: 32, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 16 }}><DotGrid size={50} gap={10} dotSize={1} opacity={0.06} /></div>
                <span style={{ fontFamily: F.mono, fontSize: 10, color: C.red, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 style={{ fontFamily: F.sans, fontSize: 24, fontWeight: 600, color: C.text, margin: "8px 0", letterSpacing: "-0.02em" }}>
                  {p.title}
                </h3>
                <p style={{ fontFamily: F.sans, fontSize: 14, color: C.textMid, margin: "0 0 16px", lineHeight: 1.6 }}>{p.desc}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, border: `1px solid ${C.border}`, padding: "2px 10px", borderRadius: 100 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {p.liveUrl && (
                    <a href={p.liveUrl} style={{
                      fontFamily: F.mono, fontSize: 11, color: "#fff", background: "#141414",
                      padding: "7px 20px", borderRadius: 100, textDecoration: "none", fontWeight: 700,
                      letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                      Launch <ArrowIcon />
                    </a>
                  )}
                  {p.articleUrl && (
                    <a href={p.articleUrl} style={{
                      fontFamily: F.mono, fontSize: 11, color: C.textMid, border: `1px solid ${C.border}`,
                      padding: "7px 20px", borderRadius: 100, textDecoration: "none",
                      letterSpacing: "0.04em", textTransform: "uppercase",
                    }}>
                      Read More
                    </a>
                  )}
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PHOTOS ──────────────────────────────────────────────────── */}
      <section ref={setRef("photos")} style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px" }}>
        <Reveal><SectionLabel>Photos · 摄影</SectionLabel></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PHOTOS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div style={{ borderRadius: 12, overflow: "hidden", cursor: "pointer", position: "relative", border: `1px solid ${C.border}` }}>
                <div style={{
                  aspectRatio: p.aspect, background: p.color, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.5s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.parentElement.querySelector(".ph-label").style.opacity = 1; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.parentElement.querySelector(".ph-label").style.opacity = 0; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                <div className="ph-label" style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 14px 12px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.5))", opacity: 0, transition: "opacity 0.3s ease",
                }}>
                  <span style={{ fontFamily: F.mono, fontSize: 10, color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{p.alt}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 40px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} · {PROFILE.name}<span style={{ color: C.red }}>.</span>
          </span>
          <div style={{ display: "flex", gap: 16 }}>
            {PROFILE.links.map(l => (
              <a key={l.label} href={l.url} style={{ fontFamily: F.mono, fontSize: 10, color: C.textDim, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", transition: "color 0.2s" }}
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
