
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Hero3D from "../components/Hero3D";

export default function LandingPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Нэвтрэх нэр, нууц үгээ бөглөнө үү.");
      return;
    }
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || "Нэвтрэхэд алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    { value: "100+", label: "Инженер" },
    { value: "50+",  label: "Төсөл" },
    { value: "99%",  label: "Нарийвчлал" },
    { value: "24/7", label: "Хандалт" },
  ];

  const features = [
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: "Цаг бүртгэл",
      desc: "Өдөр тутмын ажлын цагийг төсөл, даалгаварт уялдуулан бүртгэнэ.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
      ),
      title: "Төслийн удирдлага",
      desc: "Олон төслийг нэгдсэн байдлаар хянаж, ажилтнуудад хуваарилна.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      title: "Тайлан & Шинжилгээ",
      desc: "7 хоног, сарын цагийн зарцуулалтыг CSV хэлбэрээр экспортлоно.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: "Багийн харагдах байдал",
      desc: "Admin инженер бүрийн цагийн матрицыг долоо хоногоор харна.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      title: "Task хяналт",
      desc: "Даалгаварт зарцуулсан цагийг progress bar-аар шууд хянана.",
    },
    {
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
      ),
      title: "Аюулгүй нэвтрэлт",
      desc: "Нэвтрэх нэр, нууц үгээрээ ажилтан бүр хувийн бүртгэлдээ аюулгүй нэвтэрнэ.",
    },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#0a0f1e", minHeight: "100vh", color: "#e2e8f0" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(99,102,241,0.15)",
        padding: "0 2rem",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="https://www.nccs.mn/" target="_blank" rel="noopener noreferrer">
              <img src="/NCCS.jpg" alt="NCCS" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #6366f1" }} />
            </a>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.02em" }}>NCCS</div>
              <div style={{ fontSize: 10, color: "#6366f1", letterSpacing: "0.08em", textTransform: "uppercase" }}>Engineering</div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {["Онцлог", "Тайлан", "Холбоо барих"].map(label => (
              <a key={label} href="#" style={{
                padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                color: "#94a3b8", textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.target.style.color = "#fff"}
                onMouseLeave={e => e.target.style.color = "#94a3b8"}
              >{label}</a>
            ))}
            <a
              href="#login"
              style={{
                marginLeft: 8,
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "#fff", border: "none", cursor: "pointer", textDecoration: "none",
                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Нэвтрэх
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "100px 2rem 80px" }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
          width: 700, height: 700,
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}/>

        <div style={{
          maxWidth: 1200, margin: "0 auto", position: "relative",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 40, flexWrap: "wrap",
        }}>
          {/* Left: copy */}
          <div style={{ flex: "1 1 460px", minWidth: 300, textAlign: "left" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
              fontSize: 12, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.05em",
              marginBottom: 32, textTransform: "uppercase",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }}/>
              NCCS цаг бүртгэлийн систем
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)",
              fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em",
              color: "#fff", marginBottom: 24,
            }}>
              Инженерийн ажлын цагийг
              <span style={{
                display: "block",
                background: "linear-gradient(135deg, #818cf8, #38bdf8)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                нэг дор удирдана
              </span>
            </h1>

            <p style={{ fontSize: 17, color: "#94a3b8", lineHeight: 1.7, maxWidth: 480, marginBottom: 48, fontWeight: 400 }}>
              Төсөл, даалгавар, цагийн бүртгэлийг нэгдсэн системд хадгалж — багийн ажлыг ил тод, хэмжигдэхүйц болгоно.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="#login"
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "14px 32px", borderRadius: 14, fontSize: 15, fontWeight: 700,
                  background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                  color: "#fff", border: "none", cursor: "pointer", textDecoration: "none",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                  transition: "all 0.25s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(99,102,241,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(99,102,241,0.4)"; }}
              >
                Нэвтрэх
              </a>
              <a href="#features" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "14px 28px", borderRadius: 14, fontSize: 14, fontWeight: 600,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#cbd5e1", textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                Онцлогийг үзэх
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right: 3D model */}
          <div style={{
            flex: "1 1 380px", minWidth: 300, height: 440,
            position: "relative",
          }}>
            <Hero3D />
          </div>
        </div>

        {/* Stats */}
        <div style={{
          maxWidth: 700, margin: "72px auto 0",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: "24px 16px", textAlign: "center",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: i === 0 ? "14px 0 0 14px" : i === 3 ? "0 14px 14px 0" : 0,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 2rem", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Системийн онцлог
          </div>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
            Бүх зүйл нэг дор
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 1 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{
                padding: "32px 28px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, transition: "all 0.25s", cursor: "default",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(99,102,241,0.07)";
                e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12, marginBottom: 20,
                background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#818cf8",
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: "0 0 10px" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOGIN FORM ── */}
      <section id="login" style={{ padding: "60px 2rem 100px" }}>
        <div style={{
          maxWidth: 440, margin: "0 auto",
          padding: "48px 40px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(59,130,246,0.08))",
          border: "1px solid rgba(99,102,241,0.25)", borderRadius: 24,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -80, right: -80,
            width: 220, height: 220,
            background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
            pointerEvents: "none",
          }}/>
          <div style={{ textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              Эхлэх бэлэн үү?
            </div>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>
              Бүртгэлээрээ нэвтэрнэ үү
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>
              Admin-аас олгосон нэвтрэх нэр, нууц үгээ ашиглана уу.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ position: "relative", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: 12, color: "#a5b4fc", fontWeight: 600, marginBottom: 8 }}>
              Нэвтрэх нэр
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="жишээ: it@nccs.mn"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12, marginBottom: 20,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: "#a5b4fc", fontWeight: 600, marginBottom: 8 }}>
              Нууц үг
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12, marginBottom: 20,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
              }}
            />

            {error && (
              <div style={{
                fontSize: 13, color: "#fca5a5", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10,
                padding: "10px 14px", marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "14px 36px", borderRadius: 14, fontSize: 14, fontWeight: 700,
                background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                color: "#fff", border: "none", cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
                boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {submitting ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </button>
          </form>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "28px 2rem",
        display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 12, color: "#334155" }}>© 2026 NCCS Engineering. Бүх эрх хуулиар хамгаалагдсан.</span>
      </footer>

    </div>
  );
}
