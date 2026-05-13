import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DS, NavBar, CPLogo } from "./theme";

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nom: "", email: "", sujet: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSent(true);
  };

  return (
    <div style={{ background: "#F7F7FB", minHeight: "100vh", fontFamily: DS.fontBase }}>
      {/* Header */}
      <div style={{
        background: "#fff",
        padding: "52px 24px 24px",
        borderBottom: "1px solid #EDEDF5",
        textAlign: "center",
      }}>
        <CPLogo size={40} />
        <h1 style={{ fontSize: 28, fontWeight: 900, color: DS.ink, marginTop: 12, marginBottom: 8 }}>
          Contactez-nous
        </h1>
        <p style={{ fontSize: 15, color: "#666", maxWidth: 400, margin: "0 auto" }}>
          Une question, une suggestion ou besoin d'aide ? Nous sommes là pour vous.
        </p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px 120px" }}>

        {/* Contact methods */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
          <a href="mailto:contact@clicketpromo.fr" style={{
            background: "#fff", borderRadius: 16, padding: "20px 16px",
            textDecoration: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,.06)",
            border: "1.5px solid #EDEDF5",
          }}>
            <span style={{ fontSize: 28 }}>📧</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: DS.ink }}>Email</span>
            <span style={{ fontSize: 11, color: DS.brand, fontWeight: 600, textAlign: "center" }}>contact@clicketpromo.fr</span>
          </a>
          <a href="https://instagram.com/clicketpromo" target="_blank" rel="noopener noreferrer" style={{
            background: "#fff", borderRadius: 16, padding: "20px 16px",
            textDecoration: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,.06)",
            border: "1.5px solid #EDEDF5",
          }}>
            <span style={{ fontSize: 28 }}>📸</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: DS.ink }}>Instagram</span>
            <span style={{ fontSize: 11, color: DS.brand, fontWeight: 600 }}>@clicketpromo</span>
          </a>
        </div>

        {/* Contact form */}
        {sent ? (
          <div style={{
            background: "#fff", borderRadius: 20, padding: "40px 24px",
            textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,.06)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: DS.ink, marginBottom: 8 }}>Message envoyé !</div>
            <div style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
              Nous vous répondrons dans les plus brefs délais.
            </div>
            <button onClick={() => { setSent(false); setForm({ nom: "", email: "", sujet: "", message: "" }); }} style={{
              background: DS.brand, color: "#fff", border: "none", borderRadius: 100,
              padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.06)" }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: DS.ink, marginBottom: 20, marginTop: 0 }}>
              💬 Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Nom</label>
                  <input
                    value={form.nom}
                    onChange={e => setForm({ ...form, nom: e.target.value })}
                    placeholder="Votre nom"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Sujet</label>
                <select
                  value={form.sujet}
                  onChange={e => setForm({ ...form, sujet: e.target.value })}
                  required
                  style={{ ...inputStyle, color: form.sujet ? DS.ink : "#aaa" }}
                >
                  <option value="" disabled>Choisir un sujet…</option>
                  <option value="question">Question générale</option>
                  <option value="commercant">Je suis commerçant</option>
                  <option value="bug">Signaler un problème</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  placeholder="Décrivez votre demande…"
                  required
                  rows={5}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
                />
              </div>

              <button type="submit" style={{
                width: "100%",
                background: `linear-gradient(135deg, ${DS.brand}, ${DS.brand2})`,
                color: "#fff", border: "none", borderRadius: 100,
                padding: "16px", fontSize: 15, fontWeight: 800, cursor: "pointer",
                boxShadow: DS.eBrand,
              }}>
                Envoyer le message ✉️
              </button>
            </form>
          </div>
        )}

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => navigate("/About")} style={{
            background: "none", border: "none", color: DS.brand,
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            ← En savoir plus sur Click &amp; Promo
          </button>
        </div>
      </div>

      <NavBar active="" />
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "#999",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  background: "#F5F5F7",
  border: "1.5px solid transparent",
  borderRadius: 10,
  padding: "12px 14px",
  fontSize: 14,
  color: "#1A1A2E",
  fontFamily: "-apple-system, 'SF Pro Display', sans-serif",
  outline: "none",
};