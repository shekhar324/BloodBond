"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formStatus, setFormStatus] = useState<string>("");
  const pathname = usePathname();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("Thank you! Your message has been sent.");
    if (formRef.current) formRef.current.reset();
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="contact-section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Contact Us</h2>
              <p className="section-subtitle">We'd love to hear from you! Fill out the form below and our team will get back to you soon.</p>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', background: 'white', borderRadius: 16, boxShadow: '0 2px 8px var(--shadow-light)', padding: 32 }}>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="name" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Name</label>
                <input id="name" name="name" type="text" required className="form-control" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Email</label>
                <input id="email" name="email" type="email" required className="form-control" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="message" style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Message</label>
                <textarea id="message" name="message" required rows={5} className="form-control" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0', fontWeight: 700, fontSize: '1.1rem' }}>Send Message</button>
              {formStatus && <div style={{ marginTop: 20, color: 'var(--accent)', textAlign: 'center', fontWeight: 600 }}>{formStatus}</div>}
            </form>
          </div>
        </section>
      </main>
      <footer>
        <div className="container">
          <p style={{ textAlign: 'center', margin: 0 }}>&copy; 2025 BloodBond. All rights reserved.</p>
        </div>
      </footer>
      <style jsx global>{`
        .nav-link {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.22rem;
          padding: 0.18rem 0.6rem;
          border-radius: 1rem;
          color: #333;
          background: transparent;
          font-weight: 500;
          font-size: 0.89rem;
          text-decoration: none;
          position: relative;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;
          line-height: 1;
        }
        .nav-link .nav-icon, .nav-link .nav-label {
          display: inline-block;
          vertical-align: middle;
          line-height: 1;
          margin: 0;
          padding: 0;
        }
        .nav-link .nav-icon {
          font-size: 1.02rem;
          margin-right: 0.18rem;
          margin-top: -1px;
          position: relative;
          top: 0.5px;
        }
        .nav-link.active, .nav-link:hover {
          background: #fbeaea;
          color: #e53935 !important;
        }
        .nav-link.active {
          font-weight: 600;
        }
        .nav-link.active::after, .nav-link:hover::after {
          content: '';
          display: block;
          margin: 0 auto;
          margin-top: 2px;
          width: 50%;
          height: 2px;
          border-radius: 2px;
          background: #e53935;
          position: absolute;
          left: 25%;
          right: 25%;
          bottom: -4px;
          opacity: 1;
          transition: opacity 0.18s;
        }
        .nav-link:not(.active):not(:hover)::after {
          opacity: 0;
        }
        .btn-hero.btn-primary {
          transition: box-shadow 0.18s, transform 0.18s, background 0.18s, color 0.18s;
        }
        .btn-hero.btn-primary:hover {
          box-shadow: 0 2px 12px 0 rgba(229,57,53,0.08);
          background: #e53935;
          color: #fff;
          transform: scale(1.045);
        }
      `}</style>
    </>
  );
} 