"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Navbar from "../../../components/Navbar";

const services = [
  {
    icon: "🩸",
    title: "Blood Donation",
    description: "Register as a donor and help save lives by donating blood through our secure and easy-to-use platform.",
  },
  {
    icon: "🔍",
    title: "Find Blood",
    description: "Search for available blood donors or blood banks in your area instantly with our smart matching system.",
  },
  {
    icon: "🏥",
    title: "Hospital Integration",
    description: "Hospitals and clinics can manage blood requests, inventory, and donor coordination efficiently.",
  },
  {
    icon: "📲",
    title: "Real-Time Alerts",
    description: "Receive instant notifications for urgent blood requests, donation reminders, and event updates.",
  },
  {
    icon: "📊",
    title: "Donation Tracking",
    description: "Track your donation history, health stats, and celebrate your life-saving milestones.",
  },
  {
    icon: "🤝",
    title: "Community Support",
    description: "Join a supportive community of donors and recipients, share stories, and inspire others.",
  },
  {
    icon: "🔐",
    title: "Data Security",
    description: "Your personal information is protected with enterprise-grade security and strict privacy controls.",
  },
  {
    icon: "🌐",
    title: "Global Reach",
    description: "Connect with donors, recipients, and hospitals worldwide, expanding the impact of every donation.",
  },
];

export default function Services() {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <main>
        <section className="services-section" style={{ minHeight: '60vh', background: 'var(--bg-secondary)', padding: '64px 0', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="section-title">Our Services</h2>
              <p className="section-subtitle">Discover the range of services BloodBond offers to save lives and support the community.</p>
            </div>
            <div className="features-grid">
              {services.map((service, idx) => (
                <div className="feature-card" key={idx}>
                  <div className="feature-icon" style={{ fontSize: 36 }}>{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
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