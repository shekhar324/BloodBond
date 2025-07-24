"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SplashScreen from "../../components/SplashScreen";

export default function Home() {
  // Refs for form fields
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formMessageRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  // Mobile nav logic
  const toggleMobileMenu = () => {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) navLinks.classList.toggle("active");
  };
  const closeMobileMenu = () => {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) navLinks.classList.remove("active");
  };

  // Section logic (for future expansion)
  const showSection = (sectionId: string) => {
    document.querySelectorAll<HTMLElement>(".page-section").forEach((section) => {
      section.style.display = "none";
    });
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) sectionToShow.style.display = "block";
  };

  // Animation on scroll
  const [animatedStats, setAnimatedStats] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    // Show home section by default
    showSection("home");

    // Intersection Observer for stats animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedStats(true);
          }
        });
      },
      { threshold: 0.5 }
    );

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    // Password match logic
    const validatePassword = () => {
      if (
        !passwordRef.current ||
        !confirmPasswordRef.current ||
        !submitBtnRef.current ||
        !formMessageRef.current ||
        passwordRef.current.value !== confirmPasswordRef.current.value
      ) {
        if (submitBtnRef.current) submitBtnRef.current.disabled = true;
        if (formMessageRef.current) {
          formMessageRef.current.textContent = "Passwords do not match.";
          formMessageRef.current.className = "error-message";
        }
      } else {
        submitBtnRef.current.disabled = false;
        formMessageRef.current.textContent = "Passwords match!";
        formMessageRef.current.className = "success-message";
      }
    };
    if (passwordRef.current) passwordRef.current.addEventListener("input", validatePassword);
    if (confirmPasswordRef.current) confirmPasswordRef.current.addEventListener("input", validatePassword);

    // Email validation
    const validateEmail = () => {
      if (!emailRef.current || !submitBtnRef.current || !formMessageRef.current) return;
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(emailRef.current.value)) {
        submitBtnRef.current.disabled = true;
        formMessageRef.current.textContent = "Please enter a valid email address.";
        formMessageRef.current.className = "error-message";
      } else {
        submitBtnRef.current.disabled = false;
        formMessageRef.current.textContent = "Email is valid!";
        formMessageRef.current.className = "success-message";
      }
    };
    if (emailRef.current) emailRef.current.addEventListener("input", validateEmail);

    // Cleanup
    return () => {
      if (passwordRef.current) passwordRef.current.removeEventListener("input", validatePassword);
      if (confirmPasswordRef.current) confirmPasswordRef.current.removeEventListener("input", validatePassword);
      if (emailRef.current) emailRef.current.removeEventListener("input", validateEmail);
      observer.disconnect();
    };
  }, []);

  // Contact form submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!submitBtnRef.current || !formMessageRef.current || !emailRef.current || !formRef.current) return;
    submitBtnRef.current.disabled = true;
    submitBtnRef.current.textContent = "Submitting...";
    formMessageRef.current.textContent = "";

    // Email validation
    const email = emailRef.current.value;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      submitBtnRef.current.disabled = false;
      submitBtnRef.current.textContent = "Send Message";
      formMessageRef.current.textContent = "Please enter a valid email address.";
      formMessageRef.current.className = "error-message";
      return;
    }

    // Supabase logic (assumes supabase is loaded globally or you can use supabase-js)
    if (typeof window !== "undefined" && (window as any).supabase) {
      const { error } = await (window as any).supabase.from("contact_messages").insert([
        {
          name: (formRef.current.elements.namedItem('name') as HTMLInputElement)?.value,
          email,
          message: (formRef.current.elements.namedItem('message') as HTMLTextAreaElement)?.value,
        },
      ]);
      if (error) {
        formMessageRef.current.textContent = "Error: " + error.message;
        formMessageRef.current.className = "error-message";
      } else {
        formMessageRef.current.textContent = "Thank you! Your message has been sent.";
        formMessageRef.current.className = "success-message";
        formRef.current.reset();
      }
    } else {
      formMessageRef.current.textContent = "Supabase not available.";
      formMessageRef.current.className = "error-message";
    }
    submitBtnRef.current.disabled = false;
    submitBtnRef.current.textContent = "Send Message";
  };

  return (
    <>
      <SplashScreen show={showSplash} />
      {!showSplash && (
        <>
          <header>
            <nav className="navbar">
              <div className="navbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left: Logo and BloodBond name */}
                <div className="logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 160 }}>
                  <span style={{ fontSize: '1.62rem', marginRight: 8 }}>🩸</span>
                  <span style={{ fontWeight: 700, fontSize: '1.35rem', letterSpacing: '0.5px', color: '#7b3f8c' }}>BloodBond</span>
                </div>
                {/* Center: Nav Links */}
                <div className="nav-menu" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '1.5rem', background: 'none', padding: '0.7rem 0' }}>
                  <Link href="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}> <span className="nav-icon">🏠</span><span className="nav-label">Home</span></Link>
                  <Link href="/about" className={`nav-link${pathname === '/about' ? ' active' : ''}`}> <span className="nav-icon">ℹ️</span><span className="nav-label">About</span></Link>
                  <Link href="/contact" className={`nav-link${pathname === '/contact' ? ' active' : ''}`}> <span className="nav-icon">📞</span><span className="nav-label">Contact</span></Link>
                  <Link href="/services" className={`nav-link${pathname === '/services' ? ' active' : ''}`}> <span className="nav-icon">🌐</span><span className="nav-label">Services</span></Link>
                </div>
                {/* Right: Login/Signup */}
                <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                  <a href="/login" className="btn-hero btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90, justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#fff"/></svg>
                    Login
                  </a>
                  <a href="/signup" className="btn-hero btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90, justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}><path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10C22 6.48 17.52 2 12 2zm1 17.93c-2.83.48-5.48-1.51-5.96-4.34-.07-.39.27-.73.66-.73.33 0 .61.26.66.59.36 2.16 2.54 3.63 4.7 3.27 1.7-.28 3.04-1.62 3.32-3.32.36-2.16-1.11-4.34-3.27-4.7-.33-.05-.59-.33-.59-.66 0-.39.34-.73.73-.66 2.83.48 4.82 3.13 4.34 5.96-.41 2.41-2.53 4.19-4.89 4.19z" fill="#fff"/></svg>
                    Sign up
                  </a>
                </div>
              </div>
            </nav>
          </header>
          <main>
            {/* Hero Section */}
            <section className="hero-section">
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
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
              </div>
              <div className="container">
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">
                      <span className="hero-highlight">Save Lives</span>
                      <br />
                      Through Blood Donation
                    </h1>
                    <p className="hero-description">
                      Join thousands of donors and recipients in our mission to save lives. 
                      Every drop counts, every donor matters. Connect, donate, and make a difference today.
                    </p>
                    <div className="hero-buttons">
                      <a href="/become-donor" className="btn btn-primary btn-hero">
                        <span>🩸</span>
                        Become a Donor
                      </a>
                      <a href="/find-blood" className="btn btn-secondary btn-hero">
                        <span>🔍</span>
                        Find Blood
                      </a>
                    </div>
                    <div className="hero-stats">
                      <div className="stat-item">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Lives Saved</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Active Donors</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Hospitals</span>
                      </div>
                    </div>
                  </div>
                  <div className="hero-visual">
                    <div className="hero-image">
                      <div className="blood-drop-animation">
                        <div className="blood-drop"></div>
                        <div className="blood-drop"></div>
                        <div className="blood-drop"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Blood Type Compatibility Section */}
            <section className="blood-types-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Blood Type Compatibility</h2>
                  <p className="section-subtitle">Understanding blood type matching for safe transfusions</p>
                </div>
                <div className="blood-types-grid">
                  <div className="blood-type-card universal-donor">
                    <div className="blood-type-header">
                      <div className="blood-type-icon">🩸</div>
                      <h3>O-</h3>
                      <span className="blood-type-label">Universal Donor</span>
                    </div>
                    <div className="blood-type-info">
                      <p>Can donate to all blood types</p>
                      <div className="compatibility-list">
                        <span className="compatible">✓ O-</span>
                        <span className="compatible">✓ O+</span>
                        <span className="compatible">✓ A-</span>
                        <span className="compatible">✓ A+</span>
                        <span className="compatible">✓ B-</span>
                        <span className="compatible">✓ B+</span>
                        <span className="compatible">✓ AB-</span>
                        <span className="compatible">✓ AB+</span>
                      </div>
                    </div>
                  </div>
                  <div className="blood-type-card">
                    <div className="blood-type-header">
                      <div className="blood-type-icon">🩸</div>
                      <h3>A+</h3>
                      <span className="blood-type-label">Common Type</span>
                    </div>
                    <div className="blood-type-info">
                      <p>Can donate to A+ and AB+</p>
                      <div className="compatibility-list">
                        <span className="compatible">✓ A+</span>
                        <span className="compatible">✓ AB+</span>
                        <span className="incompatible">✗ O-</span>
                        <span className="incompatible">✗ O+</span>
                        <span className="incompatible">✗ A-</span>
                        <span className="incompatible">✗ B-</span>
                        <span className="incompatible">✗ B+</span>
                        <span className="incompatible">✗ AB-</span>
                      </div>
                    </div>
                  </div>
                  <div className="blood-type-card">
                    <div className="blood-type-header">
                      <div className="blood-type-icon">🩸</div>
                      <h3>B+</h3>
                      <span className="blood-type-label">Common Type</span>
                    </div>
                    <div className="blood-type-info">
                      <p>Can donate to B+ and AB+</p>
                      <div className="compatibility-list">
                        <span className="compatible">✓ B+</span>
                        <span className="compatible">✓ AB+</span>
                        <span className="incompatible">✗ O-</span>
                        <span className="incompatible">✗ O+</span>
                        <span className="incompatible">✗ A-</span>
                        <span className="incompatible">✗ A+</span>
                        <span className="incompatible">✗ B-</span>
                        <span className="incompatible">✗ AB-</span>
                      </div>
                    </div>
                  </div>
                  <div className="blood-type-card universal-recipient">
                    <div className="blood-type-header">
                      <div className="blood-type-icon">🩸</div>
                      <h3>AB+</h3>
                      <span className="blood-type-label">Universal Recipient</span>
                    </div>
                    <div className="blood-type-info">
                      <p>Can receive from all blood types</p>
                      <div className="compatibility-list">
                        <span className="compatible">✓ O-</span>
                        <span className="compatible">✓ O+</span>
                        <span className="compatible">✓ A-</span>
                        <span className="compatible">✓ A+</span>
                        <span className="compatible">✓ B-</span>
                        <span className="compatible">✓ B+</span>
                        <span className="compatible">✓ AB-</span>
                        <span className="compatible">✓ AB+</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="blood-type-cta">
                  <a href="/blood-types" className="btn btn-outline btn-large">Learn More About Blood Types</a>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Why Choose BloodBond?</h2>
                  <p className="section-subtitle">
                    We're revolutionizing blood donation with cutting-edge technology and compassionate care
                  </p>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🔍</div>
                    </div>
                    <h3>Smart Search</h3>
                    <p>Find compatible blood donors in your area instantly with our AI-powered matching system.</p>
                    <div className="feature-highlight">Real-time matching</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">⚡</div>
                    </div>
                    <h3>Instant Alerts</h3>
                    <p>Get notified immediately when there's an urgent blood request in your area.</p>
                    <div className="feature-highlight">Emergency response</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🏥</div>
                    </div>
                    <h3>Hospital Network</h3>
                    <p>Seamlessly connected with major hospitals and blood banks nationwide.</p>
                    <div className="feature-highlight">Wide coverage</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">📱</div>
                    </div>
                    <h3>Mobile First</h3>
                    <p>Access our platform from any device with our fully responsive mobile app.</p>
                    <div className="feature-highlight">Always accessible</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🔒</div>
                    </div>
                    <h3>Secure & Private</h3>
                    <p>Your personal information is protected with military-grade encryption.</p>
                    <div className="feature-highlight">Privacy first</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🌍</div>
                    </div>
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock support for emergency blood requests and donor assistance.</p>
                    <div className="feature-highlight">Always available</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🤝</div>
                    </div>
                    <h3>Community Driven</h3>
                    <p>Empowering local communities to organize, participate, and make a difference together.</p>
                    <div className="feature-highlight">Local impact</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <div className="icon-bg">🎓</div>
                    </div>
                    <h3>Educational Resources</h3>
                    <p>Access a rich library of guides, FAQs, and health tips to stay informed and safe.</p>
                    <div className="feature-highlight">Knowledge base</div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">How It Works</h2>
                  <p className="section-subtitle">Simple steps to save lives</p>
                </div>
                <div className="steps-grid">
                  <div className="step-card">
                    <div className="step-number">1</div>
                    <div className="step-icon">📝</div>
                    <h3>Register</h3>
                    <p>Create your account and complete your profile with blood type and location.</p>
                  </div>
                  <div className="step-card">
                    <div className="step-number">2</div>
                    <div className="step-icon">🔍</div>
                    <h3>Search</h3>
                    <p>Find compatible donors or blood banks in your area using our smart search.</p>
                  </div>
                  <div className="step-card">
                    <div className="step-number">3</div>
                    <div className="step-icon">📞</div>
                    <h3>Connect</h3>
                    <p>Get in touch with donors or hospitals through our secure messaging system.</p>
                  </div>
                  <div className="step-card">
                    <div className="step-number">4</div>
                    <div className="step-icon">🩸</div>
                    <h3>Donate</h3>
                    <p>Complete the donation process and save lives together.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Educational Resources Section */}
            <section className="education-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">Educational Resources</h2>
                  <p className="section-subtitle">Learn more about blood donation and health</p>
                </div>
                <div className="education-grid">
                  <div className="education-card">
                    <div className="education-icon">📚</div>
                    <h3>Donation Guide</h3>
                    <p>Everything you need to know about preparing for and recovering from blood donation.</p>
                    <ul className="education-topics">
                      <li>Pre-donation checklist</li>
                      <li>What to expect</li>
                      <li>Post-donation care</li>
                    </ul>
                    <a href="/guide" className="btn btn-outline">Read Guide</a>
                  </div>
                  <div className="education-card">
                    <div className="education-icon">🏥</div>
                    <h3>Health Benefits</h3>
                    <p>Discover the surprising health benefits of regular blood donation for donors.</p>
                    <ul className="education-topics">
                      <li>Iron regulation</li>
                      <li>Cardiovascular health</li>
                      <li>Free health screening</li>
                    </ul>
                    <a href="/benefits" className="btn btn-outline">Learn More</a>
                  </div>
                  <div className="education-card">
                    <div className="education-icon">❓</div>
                    <h3>FAQ</h3>
                    <p>Answers to the most commonly asked questions about blood donation.</p>
                    <ul className="education-topics">
                      <li>Eligibility requirements</li>
                      <li>Frequency guidelines</li>
                      <li>Safety protocols</li>
                    </ul>
                    <a href="/faq" className="btn btn-outline">View FAQ</a>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Us Section */}
            <section className="contact-section" id="contact-us">
              <div className="container">
                <div className="contact-content">
                  <div className="contact-info">
                    <h2>Get in Touch</h2>
                    <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    <div className="contact-details">
                      <div className="contact-item">
                        <span className="contact-icon">📧</span>
                        <div>
                          <h4>Email</h4>
                          <p>support@bloodbond.com</p>
                        </div>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
                        <div>
                          <h4>Phone</h4>
                          <p>+1 (555) 123-4567</p>
                        </div>
                      </div>
                      <div className="contact-item">
                        <span className="contact-icon">📍</span>
                        <div>
                          <h4>Address</h4>
                          <p>123 Blood Drive, Medical District<br />City, State 12345</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="contact-form-container">
                    <form className="contact-form" id="contactForm" ref={formRef} onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Your Name</label>
                        <input type="text" id="name" name="name" required autoComplete="name" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" required autoComplete="email" ref={emailRef} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea id="message" name="message" rows={4} required />
                      </div>
                      <div id="formMessage" aria-live="polite" ref={formMessageRef}></div>
                      <button type="submit" aria-label="Send your message" className="btn btn-primary" id="submitBtn" ref={submitBtnRef}>
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          </main>

          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-section">
                  <div className="footer-logo">🩸 BloodBond</div>
                  <p>Connecting donors with recipients to save lives, one drop at a time.</p>
                  <div className="social-links">
                    <a href="#" className="social-link">📘</a>
                    <a href="#" className="social-link">🐦</a>
                    <a href="#" className="social-link">📷</a>
                    <a href="#" className="social-link">💼</a>
                  </div>
                </div>
                <div className="footer-section">
                  <h4>Quick Links</h4>
                  <ul>
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/blood-banks">Blood Banks</a></li>
                    <li><a href="/hospitals">Hospitals</a></li>
                    <li><a href="/contact">Contact</a></li>
                  </ul>
                </div>
                <div className="footer-section">
                  <h4>Services</h4>
                  <ul>
                    <li><a href="/become-donor">Become a Donor</a></li>
                    <li><a href="/find-blood">Find Blood</a></li>
                    <li><a href="/emergency">Emergency</a></li>
                    <li><a href="/volunteer">Volunteer</a></li>
                  </ul>
                </div>
                <div className="footer-section">
                  <h4>Support</h4>
                  <ul>
                    <li><a href="/help">Help Center</a></li>
                    <li><a href="/faq">FAQ</a></li>
                    <li><a href="/privacy">Privacy Policy</a></li>
                    <li><a href="/terms">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>&copy; 2025 BloodBond. All rights reserved. Made with ❤️ for saving lives.</p>
              </div>
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
      )}
    </>
  );
}