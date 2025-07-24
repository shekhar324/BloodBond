"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
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
  );
} 