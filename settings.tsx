"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaUserCog, FaHistory, FaLink, FaUserShield, FaUniversalAccess, FaLanguage, FaThLarge, FaAmbulance, FaKey, FaDesktop, FaSync, FaMoon, FaCommentDots } from "react-icons/fa";
import { supabase } from "../../../utils/supabaseClient";
import { useCurrentUser } from "../../../utils/useCurrentUser";

const accent = "#e53935";
const cardStyle = {
  background: "rgba(255,255,255,0.55)",
  borderRadius: 20,
  boxShadow: "0 4px 32px #e5393533",
  padding: 28,
  marginBottom: 28,
  border: `1.5px solid ${accent}22`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  transition: "box-shadow 0.22s, transform 0.18s, border 0.18s",
};
const sectionTitle = {
  color: accent,
  fontWeight: 700,
  fontSize: 20,
  marginBottom: 10,
};

export default function SettingsPage() {
  const { user } = useCurrentUser();
  const [profile, setProfile] = useState({ name: "User Name", email: "user@email.com" });
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState("English");
  const [contrast, setContrast] = useState(false);
  const [hovered, setHovered] = useState(-1);

  // State for account controls
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [accountLoading, setAccountLoading] = useState(false);

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMsg("");
    const { error } = await supabase.auth.updateUser({ email });
    if (error) setAccountMsg("Error: " + error.message);
    else setAccountMsg("Email updated! Please check your inbox to confirm.");
    setAccountLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMsg("");
    if (password !== confirmPassword) {
      setAccountMsg("Passwords do not match.");
      setAccountLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setAccountMsg("Error: " + error.message);
    else setAccountMsg("Password updated!");
    setAccountLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? "#232323" : "linear-gradient(120deg,#f7f8fa 60%,#fbe9e7 100%)", transition: "background 0.3s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "38px 0 38px 0" }}>
        <h1 style={{ color: accent, fontWeight: 800, fontSize: 34, marginBottom: 36, letterSpacing: 1, textAlign: "center" }}>Settings</h1>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 32,
          alignItems: "stretch",
        }}>
          {/* Profile Management */}
          <div style={{ ...cardStyle, ...(hovered===-2?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(-2)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaUserCog style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Profile Management</span>
            </div>
            {editing ? (
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, flex: 1, minWidth: 120 }}
                  value={tempProfile.name}
                  onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                  placeholder="Name"
                />
                <input
                  style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, flex: 1, minWidth: 120 }}
                  value={tempProfile.email}
                  onChange={e => setTempProfile({ ...tempProfile, email: e.target.value })}
                  placeholder="Email"
                />
                <button
                  style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer", marginTop: 8 }}
                  onClick={() => { setProfile(tempProfile); setEditing(false); }}
                >Save</button>
                <button
                  style={{ background: "#eee", color: "#222", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer", marginTop: 8 }}
                  onClick={() => { setTempProfile(profile); setEditing(false); }}
                >Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 17, fontWeight: 600 }}>{profile.name}</span>
                <span style={{ fontSize: 16, color: "#888" }}>{profile.email}</span>
                <button
                  style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer", marginLeft: 12 }}
                  onClick={() => setEditing(true)}
                >Edit</button>
              </div>
            )}
          </div>
          {/* Password & Account Controls */}
          <div style={{ ...cardStyle, ...(hovered===-3?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(-3)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaKey style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Password & Account Controls</span>
            </div>
            <form onSubmit={handleEmailChange} style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 600, color: accent }}>Change Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="New email"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, width: "100%", marginBottom: 8 }}
                required
              />
              <button type="submit" disabled={accountLoading} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>Update Email</button>
            </form>
            <form onSubmit={handlePasswordChange}>
              <label style={{ fontWeight: 600, color: accent }}>Change Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, width: "100%", marginBottom: 8 }}
                required
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, width: "100%", marginBottom: 8 }}
                required
              />
              <button type="submit" disabled={accountLoading} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontWeight: 700, cursor: "pointer" }}>Update Password</button>
            </form>
            {accountMsg && <div style={{ color: accountMsg.startsWith("Error") ? "#e53935" : "#43a047", marginTop: 10, fontWeight: 600 }}>{accountMsg}</div>}
          </div>
          {/* Activity & History */}
          <div style={{ ...cardStyle, ...(hovered===0?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(0)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaHistory style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Activity & History</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>View your donation/request history, export as CSV/PDF, and manage upcoming appointments. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Linked Accounts & Social Login */}
          <div style={{ ...cardStyle, ...(hovered===1?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(1)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaLink style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Linked Accounts & Social Login</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Connect Google, Facebook, or other accounts for easy login. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Data & Privacy Controls */}
          <div style={{ ...cardStyle, ...(hovered===2?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(2)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaUserShield style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Data & Privacy Controls</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Download your data, request corrections, and manage consent for data sharing. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Accessibility Options */}
          <div style={{ ...cardStyle, ...(hovered===3?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(3)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaUniversalAccess style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Accessibility Options</span>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <label style={{ fontSize: 15, color: "#888" }}>
                <input type="checkbox" checked={contrast} onChange={()=>setContrast(v=>!v)} style={{ marginRight: 8 }} /> High Contrast Mode
              </label>
              <span style={{ color: accent, fontSize: 15, fontWeight: 600 }}>{contrast ? "On" : "Off"}</span>
            </div>
          </div>
          {/* Language & Localization */}
          <div style={{ ...cardStyle, ...(hovered===4?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(4)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaLanguage style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Language & Localization</span>
            </div>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, minWidth: 120 }} title="Select language">
              <option>English</option>
              <option>Hindi</option>
              <option>Bengali</option>
              <option>Marathi</option>
              <option>Tamil</option>
            </select>
          </div>
          {/* Custom Dashboard Preferences */}
          <div style={{ ...cardStyle, ...(hovered===5?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(5)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaThLarge style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Custom Dashboard Preferences</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Choose widgets/cards to show and set your default landing page. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Emergency Contacts */}
          <div style={{ ...cardStyle, ...(hovered===6?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(6)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaAmbulance style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Emergency Contacts</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Add/manage emergency contacts for urgent cases. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* API Keys & Developer Options */}
          <div style={{ ...cardStyle, ...(hovered===7?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(7)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaKey style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>API Keys & Developer Options</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Generate/revoke API keys for programmatic access. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Session Management */}
          <div style={{ ...cardStyle, ...(hovered===8?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(8)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaDesktop style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Session Management</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>View and log out from other active sessions/devices. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Donation/Request Automation */}
          <div style={{ ...cardStyle, ...(hovered===9?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(9)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaSync style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Donation/Request Automation</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Set up recurring donation reminders or auto-renewal of requests. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
          {/* Dark/Light Mode Toggle */}
          <div style={{ ...cardStyle, ...(hovered===10?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(10)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaMoon style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Dark/Light Mode</span>
            </div>
            <button
              style={{ background: darkMode ? "#fff" : accent, color: darkMode ? accent : "#fff", border: `2px solid ${accent}`, borderRadius: 10, padding: "10px 22px", fontWeight: 700, cursor: "pointer", fontSize: 16, transition: "background 0.2s, color 0.2s", marginTop: 10 }}
              onClick={() => setDarkMode(v => !v)}
            >{darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}</button>
          </div>
          {/* Feedback & Feature Requests */}
          <div style={{ ...cardStyle, ...(hovered===11?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(11)} onMouseLeave={()=>setHovered(-1)}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <FaCommentDots style={{ color: accent, fontSize: 26 }} />
              <span style={sectionTitle}>Feedback & Feature Requests</span>
            </div>
            <div style={{ color: "#888", fontSize: 15 }}>Submit feedback or request new features. <span style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>Coming soon</span></div>
          </div>
        </div>
      </div>
    </div>
  );
} 