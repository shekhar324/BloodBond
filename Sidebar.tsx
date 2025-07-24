import React from "react";
import styles from "./dashboard.module.css";
import { usePathname } from "next/navigation";

const donorLinks = [
  { href: "/donor", icon: "fas fa-user-plus", label: "Register as Donor" },
  // Add more donor-specific links here if needed
];

const receiverLinks = [
  { href: "/receiver", icon: "fas fa-user-check", label: "Register as Receiver" },
  // Add more receiver-specific links here if needed
];

const generalLinks = [
  { href: "/dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
  { href: "/find-donor-receiver", icon: "fas fa-search", label: "Find Donor/Receiver" },
  { href: "/hospitals", icon: "fas fa-hospital", label: "Hospitals" },
  { href: "/blood-banks", icon: "fas fa-clinic-medical", label: "Blood Banks" },
  { href: "/blood-camps", icon: "fas fa-hand-holding-heart", label: "Blood Camps" },
  { href: "/inventory", icon: "fas fa-boxes", label: "Inventory" },
  { href: "/appointment", icon: "fas fa-calendar-check", label: "Appointments" },
  { href: "/history", icon: "fas fa-history", label: "History" },
  { href: "/reports", icon: "fas fa-chart-pie", label: "Reports" },
  { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  { href: "/contact-info", icon: "fas fa-address-book", label: "Contact Info" },
];

export default function Sidebar({ onLogout, open = false }: { onLogout: () => void; open?: boolean }) {
  const pathname = usePathname();
  return (
    <aside className={`${styles.dashboardSidebar} ${open ? styles.open : ""}`}> 
      <div className={styles.dashboardSidebarInner}>
        <div className={styles.dashboardSidebarNavScroll}>
          <nav>
            <ul>
              {generalLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={
                      pathname === link.href
                        ? `${styles.dashboardNavLink} ${styles.active}`
                        : styles.dashboardNavLink
                    }
                  >
                    <i className={`${link.icon} ${styles.dashboardNavIcon}`}></i>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.dashboardSidebarDivider} style={{margin: '16px 0'}}></div>
            <div style={{padding: '0 12px', fontWeight: 600, color: '#b71c1c', fontSize: 13, letterSpacing: 1}}>Donor Section</div>
            <ul>
              {donorLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={
                      pathname === link.href
                        ? `${styles.dashboardNavLink} ${styles.active}`
                        : styles.dashboardNavLink
                    }
                  >
                    <i className={`${link.icon} ${styles.dashboardNavIcon}`}></i>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className={styles.dashboardSidebarDivider} style={{margin: '16px 0'}}></div>
            <div style={{padding: '0 12px', fontWeight: 600, color: '#b71c1c', fontSize: 13, letterSpacing: 1}}>Receiver Section</div>
            <ul>
              {receiverLinks.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={
                      pathname === link.href
                        ? `${styles.dashboardNavLink} ${styles.active}`
                        : styles.dashboardNavLink
                    }
                  >
                    <i className={`${link.icon} ${styles.dashboardNavIcon}`}></i>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div>
          <div className={styles.dashboardSidebarDivider}></div>
          <button className={styles.dashboardLogoutBtn} onClick={onLogout}>
            <i className={`fas fa-sign-out-alt ${styles.dashboardNavIcon}`}></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
} 