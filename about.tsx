"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../../components/Navbar";

export default function About() {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section with background, overlay, and particles for rich effect */}
        <section className="about-hero hero-section" style={{ minHeight: '53vh', display: 'flex', alignItems: 'center' }}>
          <div className="hero-background">
            <div className="hero-overlay"></div>
            <div className="hero-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 3 }}>
            <div className="hero-content" style={{ color: '#f3f4f6', display: 'block', textAlign: 'center', maxWidth: 700, margin: '0 auto', padding: '32px 0' }}>
              <h1 className="section-title hero-title" style={{ color: '#f9fafb' }}>BloodBond: Easy and Perfect Solution for Blood Donation</h1>
              <p className="section-subtitle hero-description" style={{ color: '#e5e7eb' }}>
                BloodBond is a modern, user-friendly platform dedicated to bridging the gap between blood donors and those in urgent need. Our mission is to make blood donation accessible, efficient, and secure for everyone, everywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="about-details" style={{ background: 'var(--bg-primary)', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Our Story</h2>
            </div>
            <div style={{ maxWidth: 800, margin: '0 auto', fontSize: '1.15rem', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: 16 }}>
                Founded with the vision to save lives, BloodBond leverages technology to connect donors, recipients, hospitals, and blood banks in real-time. We believe that no one should have to wait for life-saving blood, and our platform is designed to make the process seamless and transparent.
              </p>
              <p>
                With an intuitive interface and advanced features, BloodBond empowers users to search for donors, schedule donations, and manage their profiles—all while ensuring data privacy and security. Our growing network and hospital integrations mean help is always closer than you think.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-features" style={{ background: 'var(--bg-secondary)', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Why Choose BloodBond?</h2>
              <p className="section-subtitle">A platform designed for impact, security, and ease of use</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Instant Matching</h3>
                <p>Find compatible donors or recipients in your area within seconds using our smart search.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📍</div>
                <h3>Location-Based Services</h3>
                <p>Get connected with nearby hospitals, blood banks, and donation events easily.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📲</div>
                <h3>Real-Time Notifications</h3>
                <p>Receive alerts for urgent requests, donation reminders, and event updates instantly.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔐</div>
                <h3>Security & Privacy</h3>
                <p>Your data is protected with enterprise-grade security and strict privacy controls.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3>Donation Tracking</h3>
                <p>Track your donation history, health stats, and celebrate your life-saving milestones.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤝</div>
                <h3>Community Support</h3>
                <p>Join a community of donors and recipients, share stories, and inspire others to save lives.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3>Global Reach</h3>
                <p>Connect with donors and recipients worldwide, expanding the impact of every donation.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Fast Response</h3>
                <p>Our platform ensures urgent requests are prioritized and addressed without delay.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="about-workflow" style={{ background: 'var(--bg-primary)', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">How BloodBond Works</h2>
              <p className="section-subtitle">A simple, transparent process for everyone</p>
            </div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">⬇️</div>
                <h3>Download & Register</h3>
                <p>Sign up for free and create your profile in minutes.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">📝</div>
                <h3>Set Preferences</h3>
                <p>Choose your blood type, location, and donation preferences.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">🔔</div>
                <h3>Get Matched</h3>
                <p>Receive instant notifications for requests or available donors nearby.</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-icon">💉</div>
                <h3>Donate or Receive</h3>
                <p>Coordinate with hospitals or donors and complete your life-saving act.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="about-community" style={{ background: 'var(--bg-secondary)', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Join Our Open Source Community</h2>
              <p className="section-subtitle">Help us build a better, more connected world</p>
            </div>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
              <p style={{ marginBottom: 24 }}>
                BloodBond is an open-source project. We welcome contributors, designers, and developers to help us improve and expand our platform. Together, we can make a greater impact and save more lives.
              </p>
              <a href="https://github.com/" className="btn btn-primary" target="_blank" rel="noopener">Contribute on GitHub</a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="about-faq" style={{ background: 'var(--bg-primary)', padding: '64px 0' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <div className="faq-list" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 32 }}>
              <div className="faq-item" style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px var(--shadow-light)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>How do I register as a blood donor?</h4>
                <p>Simply sign up, fill in your details, and set your donation preferences. You can start receiving requests immediately.</p>
              </div>
              <div className="faq-item" style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px var(--shadow-light)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Is my personal information secure?</h4>
                <p>Yes, BloodBond uses advanced security protocols to keep your data safe and private at all times.</p>
              </div>
              <div className="faq-item" style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px var(--shadow-light)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>How quickly can I find a donor?</h4>
                <p>Our real-time matching system connects you with available donors in your area within seconds.</p>
              </div>
              <div className="faq-item" style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px var(--shadow-light)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Can hospitals and blood banks use BloodBond?</h4>
                <p>Yes, we offer integration for hospitals and blood banks to manage and respond to blood requests efficiently.</p>
              </div>
              <div className="faq-item" style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px var(--shadow-light)' }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>How can I contribute to the project?</h4>
                <p>Visit our GitHub page to join as a contributor, report issues, or suggest new features.</p>
              </div>
            </div>
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