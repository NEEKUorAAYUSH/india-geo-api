"use client";
import { useState } from "react";

type User = {
  name: string;
  email: string;
  plan: string;
};

export default function Dashboard() {
  const [view, setView] = useState<"home" | "register" | "login" | "dashboard">("home");
  const [user, setUser] = useState<User | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setUser(data.data.user);
      setApiKey(data.data.apiKey);
      setToken(data.data.token);
      setView("dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setUser(data.data.user);
      setApiKey(data.data.apiKey || "No API key found");
      setToken(data.data.token);
      setView("dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    { method: "GET", path: "/api/v1/states", desc: "List all Indian states", example: "/api/v1/states" },
    { method: "GET", path: "/api/v1/districts", desc: "Districts for a state", example: "/api/v1/districts?state=27" },
    { method: "GET", path: "/api/v1/subdistricts", desc: "Sub-districts for a district", example: "/api/v1/subdistricts?state=27&district=519" },
    { method: "GET", path: "/api/v1/villages", desc: "Villages with formatted labels", example: "/api/v1/villages?district=519&subdistrict=06488" },
    { method: "GET", path: "/api/v1/search", desc: "Search across all levels", example: "/api/v1/search?q=Mumbai&type=all" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#0a0f1e", color: "#e8eaf0" }}>
      {/* THE ONLY FIX IS RIGHT HERE: Using dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 12px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .btn-secondary { background: transparent; color: #a5b4fc; border: 1px solid #3f4568; padding: 11px 24px; border-radius: 10px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .btn-secondary:hover { border-color: #6366f1; color: #c7d2fe; }
        .card { background: #131929; border: 1px solid #1e2a45; border-radius: 16px; padding: 28px; }
        .input-field { width: 100%; background: #0d1526; border: 1px solid #1e2a45; border-radius: 10px; padding: 12px 16px; color: #e8eaf0; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #6366f1; }
        .input-field::placeholder { color: #4a5578; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; }
        .badge-get { background: rgba(34,197,94,0.15); color: #4ade80; }
        .badge-post { background: rgba(251,146,60,0.15); color: #fb923c; }
        .tag { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-family: 'DM Mono', monospace; }
        .glow { box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .link { color: #818cf8; cursor: pointer; text-decoration: underline; }
        .link:hover { color: #a5b4fc; }
        .api-key-box { background: #0d1526; border: 1px solid #6366f1; border-radius: 10px; padding: 14px 16px; font-family: 'DM Mono', monospace; font-size: 13px; color: #a5b4fc; word-break: break-all; }
        .stat-card { background: #131929; border: 1px solid #1e2a45; border-radius: 12px; padding: 20px; text-align: center; }
        .endpoint-row { background: #0d1526; border: 1px solid #1e2a45; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .nav { background: rgba(13,21,38,0.9); border-bottom: 1px solid #1e2a45; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; backdrop-filter: blur(10px); }
        .logo { font-size: 20px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 40px 0; }
        @media (max-width: 640px) { .hero-grid { grid-template-columns: 1fr; } .nav { padding: 16px 20px; } }
      `}} />

      {/* NAV */}
      <nav className="nav">
        <div className="logo">🇮🇳 India Geo API</div>
        <div style={{ display: "flex", gap: 12 }}>
          {view === "home" && (
            <>
              <button className="btn-secondary" onClick={() => { setView("login"); setError(""); }}>Sign In</button>
              <button className="btn-primary" onClick={() => { setView("register"); setError(""); }}>Get API Key</button>
            </>
          )}
          {view === "dashboard" && (
            <button className="btn-secondary" onClick={() => { setView("home"); setUser(null); setApiKey(""); }}>Sign Out</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>

        {/* HOME */}
        {view === "home" && (
          <>
            <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", letterSpacing: "0.12em", marginBottom: 16, textTransform: "uppercase" }}>Production-Grade SaaS API</div>
              <h1 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
                India's Complete<br />
                <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Village Address API
                </span>
              </h1>
              <p style={{ fontSize: 18, color: "#8892b0", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
                Standardized geographical data for every state, district, sub-district, and village in India — ready for your dropdowns.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ fontSize: 16, padding: "14px 36px" }} onClick={() => { setView("register"); setError(""); }}>
                  Start Free →
                </button>
                <button className="btn-secondary" onClick={() => { setView("login"); setError(""); }}>Sign In</button>
              </div>
            </div>

            <div className="hero-grid">
              {[
                { n: "29+", label: "States & UTs" },
                { n: "450K+", label: "Villages" },
                { n: "<100ms", label: "Response Time" },
              ].map((s) => (
                <div className="stat-card" key={s.label}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>{s.n}</div>
                  <div style={{ color: "#8892b0", fontSize: 14 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card glow" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>API Endpoints</div>
              {endpoints.map((ep) => (
                <div className="endpoint-row" key={ep.path}>
                  <span className={`badge badge-${ep.method.toLowerCase()}`}>{ep.method}</span>
                  <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c7d2fe" }}>{ep.path}</code>
                  <span style={{ color: "#8892b0", fontSize: 13, flex: 1 }}>{ep.desc}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ background: "#0d1526" }}>
              <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Example Request</div>
              <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a5b4fc", overflowX: "auto", lineHeight: 1.8 }}>{`GET /api/v1/villages?district=519&subdistrict=06488
x-api-key: igapi_your_key_here

// Response
{
  "success": true,
  "data": [{
    "name": "Dharavi",
    "label": "Dharavi, Kurla, Mumbai, Maharashtra, India",
    "code": "603978"
  }]
}`}</pre>
            </div>
          </>
        )}

        {/* REGISTER */}
        {view === "register" && (
          <div style={{ maxWidth: 460, margin: "40px auto" }}>
            <div className="card glow">
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Create Account</h2>
              <p style={{ color: "#8892b0", marginBottom: 28, fontSize: 15 }}>Get your free API key instantly</p>
              {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", marginBottom: 20, fontSize: 14 }}>{error}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="input-field" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="input-field" placeholder="Work email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="input-field" placeholder="Password (min 8 chars)" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <input className="input-field" placeholder="Company (optional)" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16 }} onClick={handleRegister} disabled={loading}>
                  {loading ? "Creating account..." : "Create Account & Get API Key"}
                </button>
              </div>
              <p style={{ marginTop: 20, color: "#8892b0", fontSize: 14, textAlign: "center" }}>
                Already have an account? <span className="link" onClick={() => { setView("login"); setError(""); }}>Sign in</span>
              </p>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {view === "login" && (
          <div style={{ maxWidth: 460, margin: "40px auto" }}>
            <div className="card glow">
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Sign In</h2>
              <p style={{ color: "#8892b0", marginBottom: 28, fontSize: 15 }}>Access your API dashboard</p>
              {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", marginBottom: 20, fontSize: 14 }}>{error}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input className="input-field" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="input-field" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <button className="btn-primary" style={{ width: "100%", padding: "14px", fontSize: 16 }} onClick={handleLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
              <p style={{ marginTop: 20, color: "#8892b0", fontSize: 14, textAlign: "center" }}>
                No account? <span className="link" onClick={() => { setView("register"); setError(""); }}>Create one free</span>
              </p>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && user && (
          <>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 13, color: "#6366f1", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Welcome back</div>
              <h2 style={{ fontSize: 32, fontWeight: 700 }}>Hello, {user.name} 👋</h2>
              <p style={{ color: "#8892b0", marginTop: 4 }}>{user.email} · <span className="tag">{user.plan}</span></p>
            </div>

            <div className="card glow" style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your API Key</div>
                  <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>Pass this in the <code style={{ fontFamily: "DM Mono", color: "#a5b4fc" }}>x-api-key</code> header</p>
                </div>
                <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={copyKey}>
                  {copied ? "✓ Copied!" : "Copy Key"}
                </button>
              </div>
              <div className="api-key-box">{apiKey}</div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Quick Start</div>
              <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a5b4fc", lineHeight: 1.9, overflowX: "auto", whiteSpace: "pre-wrap" }}>{`# 1. Get all states
curl https://your-app.vercel.app/api/v1/states \\
  -H "x-api-key: ${apiKey}"

# 2. Get districts in Maharashtra (code: 27)
curl "https://your-app.vercel.app/api/v1/districts?state=27" \\
  -H "x-api-key: ${apiKey}"

# 3. Search for any village
curl "https://your-app.vercel.app/api/v1/search?q=Dharavi" \\
  -H "x-api-key: ${apiKey}"`}</pre>
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>All Endpoints</div>
              {endpoints.map((ep) => (
                <div className="endpoint-row" key={ep.path}>
                  <span className={`badge badge-get`}>GET</span>
                  <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#c7d2fe" }}>{ep.path}</code>
                  <span style={{ color: "#8892b0", fontSize: 13, flex: 1 }}>{ep.desc}</span>
                  <span className="tag">{ep.example.split("?")[1] || "no params"}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}