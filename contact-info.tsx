"use client";
import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaQuestionCircle, FaGlobe, FaAccessibleIcon, FaExclamationTriangle } from "react-icons/fa";

const accent = "#e53935";
const cardStyle = {
  background: "rgba(255,255,255,0.55)",
  borderRadius: 20,
  boxShadow: "0 4px 32px #e5393533",
  padding: 28,
  border: `1.5px solid ${accent}22`,
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  transition: "box-shadow 0.22s, transform 0.18s, border 0.18s",
};

export default function ContactInfoPage() {
  const [hovered, setHovered] = useState(-1);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", type: "General" });
  const [lang, setLang] = useState("English");

  return (
    <>
      <div style={{ minHeight: "100vh", background: "linear-gradient(120deg,#f7f8fa 60%,#fbe9e7 100%)", transition: "background 0.3s" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "38px 0 38px 0" }}>
          <h1 style={{ color: accent, fontWeight: 800, fontSize: 34, marginBottom: 36, letterSpacing: 1, textAlign: "center" }}>Contact Information</h1>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 32,
            alignItems: "stretch",
          }}>
            {/* Organization Contact Details */}
            <div style={{ ...cardStyle, ...(hovered===0?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(0)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaMapMarkerAlt style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>BloodBond Main Office</span>
              </div>
              <div style={{ color: "#222", fontSize: 16, marginBottom: 8 }}>123, Life Avenue, City Center, Metropolis, 123456</div>
              <div style={{ color: accent, fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaPhone /> <a href="tel:+911234567890" style={{ color: accent, textDecoration: "underline" }}>+91 12345 67890</a></div>
              <div style={{ color: accent, fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaEnvelope /> <a href="mailto:info@bloodbond.org" style={{ color: accent, textDecoration: "underline" }}>info@bloodbond.org</a></div>
              <div style={{ color: "#888", fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaClock /> Mon-Sat: 9am - 7pm</div>
              <div style={{ color: accent, fontSize: 15, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaGlobe /> <a href="https://bloodbond.org" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline" }}>bloodbond.org</a></div>
            </div>
            {/* Contact Form */}
            <div style={{ ...cardStyle, ...(hovered===1?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(1)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaEnvelope style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>Contact Form</span>
              </div>
              <form style={{ display: "flex", flexDirection: "column", gap: 12 }} onSubmit={e => e.preventDefault()}>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16 }}>
                  <option>General</option>
                  <option>Donation</option>
                  <option>Emergency</option>
                  <option>Feedback</option>
                </select>
                <input type="text" placeholder="Your Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16 }} />
                <input type="email" placeholder="Your Email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16 }} />
                <input type="text" placeholder="Subject" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16 }} />
                <textarea placeholder="Message" value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, minHeight: 80 }} />
                <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 17, marginTop: 6, cursor: "pointer", transition: "background 0.2s" }}>Send Message</button>
              </form>
            </div>
            {/* Emergency Contacts */}
            <div style={{ ...cardStyle, ...(hovered===2?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(2)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaExclamationTriangle style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>Emergency Contacts</span>
              </div>
              <div style={{ color: accent, fontSize: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaPhone /> <a href="tel:+919876543210" style={{ color: accent, textDecoration: "underline" }}>+91 98765 43210</a> (24/7 Helpline)</div>
              <div style={{ color: accent, fontSize: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}><FaPhone /> <a href="tel:+911122334455" style={{ color: accent, textDecoration: "underline" }}>+91 11223 34455</a> (Ambulance)</div>
            </div>
            {/* Social Media Links */}
            <div style={{ ...cardStyle, ...(hovered===3?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(3)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaFacebook style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>Connect With Us</span>
              </div>
              <div style={{ display: "flex", gap: 18, fontSize: 28, marginTop: 8 }}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: accent }}><FaFacebook /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: accent }}><FaTwitter /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: accent }}><FaInstagram /></a>
                <a href="https://wa.me/911234567890" target="_blank" rel="noopener noreferrer" style={{ color: accent }}><FaWhatsapp /></a>
              </div>
            </div>
            {/* Map/Location */}
            <div style={{ ...cardStyle, ...(hovered===4?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(4)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaMapMarkerAlt style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>Find Us</span>
              </div>
              <iframe
                title="BloodBond Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=77.5946%2C12.9716%2C77.5946%2C12.9716&amp;layer=mapnik"
                style={{ width: "100%", height: 180, border: "none", borderRadius: 12, marginTop: 8 }}
                allowFullScreen
                loading="lazy"
              ></iframe>
              <div style={{ color: "#888", fontSize: 14, marginTop: 6 }}>View on <a href="https://goo.gl/maps/xyz" target="_blank" rel="noopener noreferrer" style={{ color: accent, textDecoration: "underline" }}>Google Maps</a></div>
            </div>
            {/* FAQ/Help Links */}
            <div style={{ ...cardStyle, ...(hovered===5?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(5)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaQuestionCircle style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>FAQ & Help</span>
              </div>
              <div style={{ color: "#888", fontSize: 15 }}>For common questions, visit our <a href="/faq" style={{ color: accent, textDecoration: "underline" }}>FAQ page</a> or <a href="mailto:info@bloodbond.org" style={{ color: accent, textDecoration: "underline" }}>contact us</a>.</div>
            </div>
            {/* Accessibility & Language */}
            <div style={{ ...cardStyle, ...(hovered===6?{boxShadow:"0 8px 40px #e5393555", transform:"scale(1.035)", border:'2.5px solid #e5393588'}:{}) }} onMouseEnter={()=>setHovered(6)} onMouseLeave={()=>setHovered(-1)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <FaAccessibleIcon style={{ color: accent, fontSize: 26 }} />
                <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>Accessibility & Language</span>
              </div>
              <div style={{ color: "#888", fontSize: 15, marginBottom: 10 }}>If you need accessibility assistance, <a href="mailto:access@bloodbond.org" style={{ color: accent, textDecoration: "underline" }}>contact us</a>.</div>
              <select value={lang} onChange={e=>setLang(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #eee", fontSize: 16, minWidth: 120 }} title="Select language">
                <option>English</option>
                <option>Hindi</option>
                <option>Bengali</option>
                <option>Marathi</option>
                <option>Tamil</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 