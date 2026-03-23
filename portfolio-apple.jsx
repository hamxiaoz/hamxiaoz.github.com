import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────
const PROFILE = {
  name: "Your Name",
  nameCn: "你的名字",
  tagline: "Designer. Developer. Writer.",
  bio: "I build things at the intersection of design and engineering. With a passion for crafting digital experiences that feel both intuitive and delightful, I write about technology, culture, and the spaces in between — in English and 中文.",
  links: [
    { label: "GitHub", url: "#" },
    { label: "LinkedIn", url: "#" },
    { label: "Medium", url: "#" },
    { label: "X", url: "#" },
    { label: "Email", url: "mailto:hello@example.com" },
  ],
};

const ARTICLES = [
  { id: 1, title: "Building Scalable\nDesign Systems", source: "Medium", date: "2025-12-01", excerpt: "A deep dive into component-driven architecture for product teams.", tags: ["Design Systems", "Engineering"] },
  { id: 2, title: "The Art of\nDeveloper Experience", source: "LinkedIn", date: "2025-10-15", excerpt: "Why the best tools disappear — and what that means for the future.", tags: ["DX", "Tooling"] },
  { id: 3, title: "Rethinking State\nManagement in 2025", source: "Medium", date: "2025-08-20", excerpt: "Signals, atoms, and the quiet revolution beneath the framework wars.", tags: ["TypeScript", "Frontend"] },
];

const BLOG_CN = [
  { id: 1, title: "关于极简主义的思考", date: "2025-11-10", excerpt: "在设计与生活之间，寻找真正重要的东西。极简不是空无，而是只留下有意义的。" },
  { id: 2, title: "从零到一：我的创业笔记", date: "2025-09-05", excerpt: "记录从一个想法到一个产品的旅程，以及沿途学到的所有教训。" },
  { id: 3, title: "技术写作的艺术", date: "2025-07-22", excerpt: "好的技术文档不只是说明书，它是一座桥梁，连接创造者与使用者。" },
];

const PROJECTS = [
  { id: 1, title: "Luminance", subtitle: "Collaborate in real time.", desc: "A collaborative design tool for distributed teams, built with WebRTC and Canvas API.", tags: ["TypeScript", "WebRTC"], liveUrl: "#", articleUrl: "#", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: 2, title: "Kanji Flow", subtitle: "Master every character.", desc: "Spaced-repetition app for learning Chinese and Japanese characters.", tags: ["React Native", "NLP"], liveUrl: "#", articleUrl: "#", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: 3, title: "Spectra CLI", subtitle: "Zero config. Full power.", desc: "A build tool for modern TypeScript monorepos.", tags: ["Rust", "Node.js"], liveUrl: null, articleUrl: "#", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { id: 4, title: "Inkstone", subtitle: "Write beautifully.", desc: "Markdown editor with live preview and first-class CJK typography.", tags: ["Electron", "MDX"], liveUrl: "#", articleUrl: null, gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
];

const PHOTOS = [
  { id: 1, alt: "City skyline at dusk", color: "#e8e6e3", aspect: "3/4" },
  { id: 2, alt: "Mountain trail", color: "#dde3dd", aspect: "4/3" },
  { id: 3, alt: "Street — Tokyo", color: "#e3dedd", aspect: "1/1" },
  { id: 4, alt: "Morning light on water", color: "#dde1e6", aspect: "16/9" },
  { id: 5, alt: "Architecture detail", color: "#e3e2dd", aspect: "3/4" },
  { id: 6, alt: "Night market — Taipei", color: "#e6e0dd", aspect: "4/3" },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
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
    <div ref={ref} style={{ ...style, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)", transition: `all 0.8s cubic-bezier(0.25,1,0.5,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#FBFBFD",
  bgAlt: "#F5F5F7",
  bgDark: "#1D1D1F",
  text: "#1D1D1F",
  textSecondary: "#6E6E73",
  textTertiary: "#AEAEB2",
  blue: "#0071E3",
  blueHover: "#0077ED",
  border: "#D2D2D7",
  white: "#FFFFFF",
};

const F = {
  display: "'SF Pro Display', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
  text: "'SF Pro Text', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif",
  cn: "'Noto Serif SC', 'Songti SC', serif",
};

function ArrowIcon({ color = "currentColor" }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M17 7H7M17 7V17" />
    </svg>
  );
}

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
      background: scrolled ? "rgba(251,251,253,0.72)" : "rgba(251,251,253,0.92)",
      backdropFilter: "saturate(180%) blur(20px)",
      borderBottom: `0.5px solid ${scrolled ? "rgba(0,0,0,0.08)" : "transparent"}`,
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 22px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 48 }}>
        <button onClick={() => onNav("home")} style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontFamily: F.display, fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: "-0.01em",
        }}>
          {PROFILE.nameCn}
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {items.map(item => (
            <button key={item.id} onClick={() => onNav(item.id)} style={{
              background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
              fontFamily: item.id === "blog" ? F.cn : F.text, fontSize: 12, fontWeight: 400,
              color: active === item.id ? C.text : C.textSecondary,
              transition: "color 0.2s ease", letterSpacing: "-0.01em",
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function LinkButton({ href, children, filled = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontFamily: F.text, fontSize: 17, fontWeight: 400,
        color: filled ? C.white : C.blue,
        background: filled ? (hovered ? C.blueHover : C.blue) : "transparent",
        padding: filled ? "10px 24px" : 0, borderRadius: 100,
        textDecoration: "none", transition: "all 0.2s ease",
        cursor: "pointer",
      }}>
      {children}
      {!filled && <span style={{ transform: hovered ? "translate(2px,-2px)" : "translate(0,0)", transition: "transform 0.2s ease", display: "inline-flex" }}>›</span>}
    </a>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PortfolioApple() {
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; scroll-padding-top: 60px; }
        body { margin: 0; background: ${C.bg}; color: ${C.text}; -webkit-font-smoothing: antialiased; }
        ::selection { background: rgba(0,113,227,0.15); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
      `}</style>

      <Nav active={active} onNav={nav} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section ref={setRef("home")} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "140px 32px 100px",
      }}>
        <Reveal>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: C.bgAlt, display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 36px",
            fontFamily: F.display, fontSize: 28, fontWeight: 600, color: C.textSecondary,
          }}>
            {PROFILE.name.charAt(0)}
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 style={{
            fontFamily: F.display, fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 700,
            letterSpacing: "-0.04em", lineHeight: 1.06, margin: "0 0 16px",
            background: `linear-gradient(180deg, ${C.text} 40%, ${C.textSecondary})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {PROFILE.name}.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p style={{ fontFamily: F.display, fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 600, color: C.textSecondary, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
            {PROFILE.tagline}
          </p>
        </Reveal>
        <Reveal delay={0.18}>
          <p style={{ fontFamily: F.text, fontSize: 17, color: C.textSecondary, lineHeight: 1.6, margin: "0 auto 36px", maxWidth: 500 }}>
            {PROFILE.bio}
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {PROFILE.links.map(l => (
              <LinkButton key={l.label} href={l.url}>{l.label}</LinkButton>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── ARTICLES — Full-bleed tiles like Apple sections ────────── */}
      <section ref={setRef("articles")} style={{ padding: "0 0 20px" }}>
        <Reveal style={{ textAlign: "center", padding: "80px 32px 48px" }}>
          <h2 style={{ fontFamily: F.display, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            Articles.
          </h2>
          <p style={{ fontFamily: F.text, fontSize: 17, color: C.textSecondary, margin: 0 }}>
            Writing on design, engineering, and everything in between.
          </p>
        </Reveal>

        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {ARTICLES.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06}>
              <a href="#" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: C.bgAlt, borderRadius: 20, padding: "40px 44px",
                  transition: "all 0.3s ease", cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#EDEDF0"}
                onMouseLeave={e => e.currentTarget.style.background = C.bgAlt}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{ fontFamily: F.text, fontSize: 14, fontWeight: 500, color: C.blue, display: "block", marginBottom: 8 }}>
                        {a.source} · {new Date(a.date).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </span>
                      <h3 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 8px", letterSpacing: "-0.02em", lineHeight: 1.2, whiteSpace: "pre-line" }}>
                        {a.title}
                      </h3>
                      <p style={{ fontFamily: F.text, fontSize: 17, color: C.textSecondary, margin: 0, maxWidth: 480 }}>
                        {a.excerpt}
                      </p>
                    </div>
                    <span style={{ fontFamily: F.text, fontSize: 20, color: C.blue, marginTop: 8 }}>›</span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── BLOG CN ── Dark section like Apple's darker product rows ── */}
      <section ref={setRef("blog")} style={{ background: C.bgDark, marginTop: 60, padding: "80px 0" }}>
        <Reveal style={{ textAlign: "center", padding: "0 32px 48px" }}>
          <h2 style={{ fontFamily: F.cn, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "#F5F5F7", letterSpacing: "0.01em", margin: "0 0 8px" }}>
            博客
          </h2>
          <p style={{ fontFamily: F.cn, fontSize: 17, color: "rgba(245,245,247,0.5)", margin: 0 }}>
            用中文记录关于设计、技术与生活的想法。
          </p>
        </Reveal>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {BLOG_CN.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <a href="#" style={{ textDecoration: "none", display: "block" }}>
                <div style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 32,
                  minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "space-between",
                  border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.3s ease",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <div>
                    <span style={{ fontFamily: F.text, fontSize: 13, color: "rgba(245,245,247,0.35)" }}>
                      {new Date(p.date).toLocaleDateString("zh-CN")}
                    </span>
                    <h3 style={{ fontFamily: F.cn, fontSize: 24, fontWeight: 700, color: "#F5F5F7", margin: "14px 0 10px", lineHeight: 1.4, letterSpacing: "0.01em" }}>
                      {p.title}
                    </h3>
                    <p style={{ fontFamily: F.cn, fontSize: 15, color: "rgba(245,245,247,0.5)", margin: 0, lineHeight: 1.7 }}>
                      {p.excerpt}
                    </p>
                  </div>
                  <span style={{ fontFamily: F.cn, fontSize: 14, color: "#2997FF", marginTop: 20 }}>
                    阅读全文 ›
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PROJECTS — Stacked hero tiles ─────────────────────────── */}
      <section ref={setRef("projects")} style={{ padding: "80px 0 20px" }}>
        <Reveal style={{ textAlign: "center", padding: "0 32px 48px" }}>
          <h2 style={{ fontFamily: F.display, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            Projects.
          </h2>
          <p style={{ fontFamily: F.text, fontSize: 17, color: C.textSecondary, margin: 0 }}>
            A curated collection of things I've built.
          </p>
        </Reveal>

        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {PROJECTS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.08}>
              <div style={{
                borderRadius: 20, padding: 40, minHeight: 380, display: "flex", flexDirection: "column",
                justifyContent: "flex-end", position: "relative", overflow: "hidden",
                background: C.bgDark,
              }}>
                {/* Gradient orb */}
                <div style={{
                  position: "absolute", top: "-20%", right: "-10%", width: 300, height: 300,
                  borderRadius: "50%", background: p.gradient, opacity: 0.15, filter: "blur(60px)",
                }} />
                <div style={{ position: "relative" }}>
                  <h3 style={{ fontFamily: F.display, fontSize: 32, fontWeight: 700, color: "#F5F5F7", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                    {p.title}
                  </h3>
                  <p style={{ fontFamily: F.display, fontSize: 20, fontWeight: 600, color: "rgba(245,245,247,0.5)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                    {p.subtitle}
                  </p>
                  <p style={{ fontFamily: F.text, fontSize: 15, color: "rgba(245,245,247,0.4)", margin: "0 0 20px", lineHeight: 1.6 }}>
                    {p.desc}
                  </p>
                  <div style={{ display: "flex", gap: 16 }}>
                    {p.liveUrl && (
                      <a href={p.liveUrl} style={{ fontFamily: F.text, fontSize: 15, color: "#2997FF", textDecoration: "none" }}>
                        Try it ›
                      </a>
                    )}
                    {p.articleUrl && (
                      <a href={p.articleUrl} style={{ fontFamily: F.text, fontSize: 15, color: "rgba(245,245,247,0.4)", textDecoration: "none" }}>
                        Learn more ›
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PHOTOS ──────────────────────────────────────────────────── */}
      <section ref={setRef("photos")} style={{ padding: "80px 0" }}>
        <Reveal style={{ textAlign: "center", padding: "0 32px 48px" }}>
          <h2 style={{ fontFamily: F.display, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 4px" }}>
            Photos.
          </h2>
          <p style={{ fontFamily: F.text, fontSize: 17, color: C.textSecondary, margin: 0 }}>
            Moments caught between destinations.
          </p>
        </Reveal>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {PHOTOS.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <div style={{
                borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative",
              }}>
                <div style={{
                  aspectRatio: p.aspect, background: p.color, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "transform 0.6s cubic-bezier(0.25,1,0.5,1)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "24px 0" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: F.text, fontSize: 12, color: C.textTertiary }}>
            © {new Date().getFullYear()} {PROFILE.name}. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 24 }}>
            {PROFILE.links.map(l => (
              <a key={l.label} href={l.url} style={{
                fontFamily: F.text, fontSize: 12, color: C.textTertiary, textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.text}
              onMouseLeave={e => e.currentTarget.style.color = C.textTertiary}
              >{l.label}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
