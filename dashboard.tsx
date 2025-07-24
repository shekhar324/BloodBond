"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCurrentUser } from "../../../utils/useCurrentUser";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const DonorMap = dynamic(() => import("../../../components/DonorMap"), { ssr: false });
import styles from "./dashboard.module.css";

const sidebarItems = [
  { icon: "fas fa-tachometer-alt", label: "Dashboard" },
  { icon: "fas fa-search", label: "Find Donor/Receiver", href: "/find-donor-receiver" },
  { icon: "fas fa-user-plus", label: "Register as Donor", href: "/donor" },
  { icon: "fas fa-user-check", label: "Register as Receiver", href: "/receiver" },
  { icon: "fas fa-hospital", label: "Hospitals", href: "/hospitals" },
  { icon: "fas fa-university", label: "Blood Banks", href: "/blood-banks" },
  { icon: "fas fa-campground", label: "Blood Camps", href: "/blood-camps" },
  { icon: "fas fa-boxes", label: "Inventory", href: "/inventory" },
  { icon: "fas fa-calendar-check", label: "Appointments", href: "/appointment" },
  { icon: "fas fa-history", label: "History", href: "/history" },
  { icon: "fas fa-file-alt", label: "Reports", href: "/report" },
  { icon: "fas fa-cog", label: "Settings", href: "/settings" },
  { icon: "fas fa-address-book", label: "Contact Info", href: "/contact-info" },
];

const mockUser = {
  name: "User",
  email: "user@gmail.com",
};

const mockHealth = {
  lastDonation: "2024-06-15",
  nextEligible: "2024-08-10",
  frequency: "Every 3 months"
};
const mockEvents = [
  { date: "2024-08-15", title: "Mega Blood Drive", location: "City Hospital" },
  { date: "2024-09-01", title: "Community Camp", location: "Red Cross Center" }
];
const mockImpact = {
  livesSaved: 12,
  unitsDonated: 5,
  statement: "Your donations have helped save 12 lives!"
};
const mockNews = [
  { title: "World Blood Donor Day Celebrated", date: "2024-06-14" },
  { title: "New Blood Bank Opens in Noida", date: "2024-07-01" }
];
const mockUrgent = [
  { blood_group: "O-", location: "Metro Hospital", units: 2 },
  { blood_group: "A+", location: "City Clinic", units: 1 }
];
const mockTips = [
  "You can donate whole blood every 56 days.",
  "Eat iron-rich foods to prepare for donation.",
  "Let staff know if you feel dizzy or unwell.",
  "Donating blood does not lower your immunity."
];

const classicCardStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 2px 16px #e5393533",
  padding: 28,
  minWidth: 280,
  margin: 0,
};
const classicTitleStyle = {
  color: "#e53935",
  fontWeight: 700,
  fontSize: 20,
  marginBottom: 10,
};

export default function PostLoginPage() {
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const { user, loading } = useCurrentUser();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  useEffect(() => {
    async function fetchProfile() {
      if (user && user.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("fullName, email")
          .eq("id", user.id)
          .single();
        if (error) {
          // Prevent crash, show fallback
          setProfile({ name: "Unknown", email: "unknown@example.com" });
          return;
        }
        if (data) {
          setProfile({ name: data.fullName, email: data.email });
        }
      }
    }
    fetchProfile();
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  type Person = { id: number; name: string; blood_type: string; lat: number; lng: number };
  const [donors, setDonors] = useState<Person[]>([]);
  const [receivers, setReceivers] = useState<Person[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: donorData } = await supabase.from("donors").select("id, name, blood_type, lat, lng");
      const { data: receiverData } = await supabase.from("receivers").select("id, name, blood_type, lat, lng");
      setDonors(donorData || []);
      setReceivers(receiverData || []);
    };
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchInventory() {
      const { data } = await supabase.from('inventory').select('*');
      setInventory(data || []);
    }
    fetchInventory();
    // Real-time subscription
    const channel = supabase.channel('user-inventory-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory',
      }, () => {
        fetchInventory();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f8fa" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 300,
          background: "#fff",
          boxShadow: "2px 0 16px #e5393522",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #eee", marginBottom: 32 }}>
          <span style={{ color: "#e53935", fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>
            <i className="fas fa-tint" style={{ marginRight: 8 }}></i>BloodBond
          </span>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "18px 0", display: "flex", flexDirection: "column", gap: 18 }}>
          {sidebarItems.map((item, idx) => {
            const isActive = idx === 0;
            const isHovered = hoveredIdx === idx;
            return item.href ? (
              <Link href={item.href} key={item.label} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(-1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "12px 32px",
                    fontSize: 17,
                    color: isActive
                      ? "#e53935"
                      : isHovered
                      ? "#b71c1c"
                      : "#222",
                    cursor: "pointer",
                    background: isActive
                      ? "#fbe9e7"
                      : isHovered
                      ? "#f8f9fa"
                      : "transparent",
                    fontWeight: isActive ? 700 : 500,
                    borderLeft: isActive
                      ? "4px solid #e53935"
                      : isHovered
                      ? "3px solid #e53935"
                      : "4px solid transparent",
                    boxShadow: isHovered
                      ? "0 2px 12px 0 #e5393522"
                      : undefined,
                    transform: isHovered ? "scale(1.035)" : "scale(1)",
                    transition:
                      "background 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, color 0.18s, border-left 0.18s, transform 0.18s",
                    borderRadius: isHovered ? 12 : 0,
                    marginBottom: 6,
                  }}
                >
                  <i
                    className={item.icon}
                    style={{
                      width: 22,
                      textAlign: "center",
                      color: isActive
                        ? "#e53935"
                        : isHovered
                        ? "#e53935"
                        : "#888",
                      transition: "color 0.18s",
                    }}
                  ></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            ) : (
              <div
                key={item.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(-1)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "12px 32px",
                  fontSize: 17,
                  color: isActive
                    ? "#e53935"
                    : isHovered
                    ? "#b71c1c"
                    : "#222",
                  cursor: "pointer",
                  background: isActive
                    ? "#fbe9e7"
                    : isHovered
                    ? "#f8f9fa"
                    : "transparent",
                  fontWeight: isActive ? 700 : 500,
                  borderLeft: isActive
                    ? "4px solid #e53935"
                    : isHovered
                    ? "3px solid #e53935"
                    : "4px solid transparent",
                  boxShadow: isHovered
                    ? "0 2px 12px 0 #e5393522"
                    : undefined,
                  transform: isHovered ? "scale(1.035)" : "scale(1)",
                  transition:
                    "background 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, color 0.18s, border-left 0.18s, transform 0.18s",
                  borderRadius: isHovered ? 12 : 0,
                  marginBottom: 6,
                }}
              >
                <i
                  className={item.icon}
                  style={{
                    width: 22,
                    textAlign: "center",
                    color: isActive
                      ? "#e53935"
                      : isHovered
                      ? "#e53935"
                      : "#888",
                    transition: "color 0.18s",
                  }}
                ></i>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
        <div style={{ margin: 0, padding: 0, marginTop: 32 }}>
          <div style={{ padding: "16px 32px", background: "#fdeaea", color: "#e53935", fontWeight: 700, display: "flex", alignItems: "center", gap: 16, cursor: "pointer", borderRadius: 10 }} onClick={handleLogout}>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e53935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            Logout
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 300, minHeight: "100vh" }}>
        {/* Top Bar */}
        <div style={{ height: 70, background: "#e53935", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 36px", color: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {loading || !profile ? (
              <span style={{ fontWeight: 600, fontSize: 17 }}>Loading...</span>
            ) : (
              <>
                <span style={{ fontWeight: 600, fontSize: 17 }}>
                  {profile.name && profile.name.trim().length > 0
                    ? profile.name
                    : profile.email.split('@')[0]}
                </span>
                <span style={{ fontWeight: 400, fontSize: 15, opacity: 0.85, marginLeft: 6 }}>{profile.email}</span>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: "#e53935", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 19 }}>
                  {profile && profile.name && profile.name.trim().length > 0
                    ? profile.name.charAt(0).toUpperCase()
                    : profile.email.charAt(0).toUpperCase()}
                </div>
              </>
            )}
          </div>
        </div>
        {/* Dashboard Content */}
        <div style={{ padding: "38px 32px", maxWidth: 1400, marginLeft: "auto", marginRight: "auto" }}>
          <h1 style={{ color: "#e53935", fontWeight: 800, fontSize: 30, marginBottom: 30 }}>Dashboard Overview</h1>
          {/* Inventory Section for Users */}
          <div className={styles.glassCard} style={{ marginBottom: 32 }}>
            <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Blood Inventory</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#fbe9e7' }}>
                  <th style={{ padding: 8 }}>Item Name</th>
                  <th>Item Type</th>
                  <th>Quantity</th>
                  <th>Location</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {inventory.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No inventory data available.</td></tr>
                ) : (
                  inventory.map((item, i) => (
                    <tr key={item.id || i} style={{ borderBottom: '1px solid #eee', background: i % 2 === 0 ? '#fcfcfc' : '#f5f5f5' }}>
                      <td style={{ padding: 8 }}>{item.item_name}</td>
                      <td>{item.item_type}</td>
                      <td>{item.quantity}</td>
                      <td>{item.location}</td>
                      <td>{item.expiry_date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div className={styles.dashboardMagazineGrid}>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Health Insights</div>
                <div>Last Donation: <b>{mockHealth.lastDonation}</b></div>
                <div>Next Eligible: <b>{mockHealth.nextEligible}</b></div>
                <div>Donation Frequency: <b>{mockHealth.frequency}</b></div>
              </div>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Upcoming Events</div>
                <ul style={{ fontSize: 15, margin: 0, padding: 0, listStyle: "none" }}>
                  {mockEvents.map((e, i) => (
                    <li key={i} style={{ marginBottom: 8 }}><b>{e.title}</b> <span style={{ color: "#888" }}>({e.date})</span><br /><span style={{ color: "#1976d2" }}>{e.location}</span></li>
                  ))}
                </ul>
              </div>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Your Impact</div>
                <div>Lives Saved: <b>{mockImpact.livesSaved}</b></div>
                <div>Units Donated: <b>{mockImpact.unitsDonated}</b></div>
                <div style={{ color: "#43a047", marginTop: 8 }}>{mockImpact.statement}</div>
              </div>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>News & Announcements</div>
                <ul style={{ fontSize: 15, margin: 0, padding: 0, listStyle: "none" }}>
                  {mockNews.map((n, i) => (
                    <li key={i} style={{ marginBottom: 8 }}><b>{n.title}</b> <span style={{ color: "#888" }}>({n.date})</span></li>
                  ))}
                </ul>
              </div>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Urgent Requests Near You</div>
                <ul style={{ fontSize: 15, margin: 0, padding: 0, listStyle: "none" }}>
                  {mockUrgent.map((r, i) => (
                    <li key={i} style={{ marginBottom: 8 }}><b>{r.blood_group}</b> needed at <span style={{ color: "#1976d2" }}>{r.location}</span> <span style={{ color: "#e53935" }}>({r.units} units)</span></li>
                  ))}
                </ul>
              </div>
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Donation Reminder</div>
                <div>Your next eligible date: <b>{mockHealth.nextEligible}</b></div>
                <button style={{ marginTop: 12, background: "#e53935", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Set Calendar Reminder</button>
              </div>
            </div>
            {/* Top Row */}
            <div style={{ display: "flex", gap: 28, marginBottom: 0 }}>
              {/* Quick Stats */}
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Quick Stats</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 28, fontSize: 16 }}>
                  <div>Total Donors<br /><b>1</b></div>
                  <div>Blood Requests<br /><b>0</b></div>
                  <div>Total Units (ml)<br /><b>0</b></div>
                  <div>Campaigns<br /><b>5</b></div>
                </div>
              </div>
              {/* Analytics */}
              <div className={styles.glassCard}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Analytics</div>
                <div style={{ display: "flex", gap: 28 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Blood Group Distribution</div>
                    <div style={{ color: "#888", fontSize: 14 }}>No data available.</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Requests vs Donations</div>
                    <img src="/file.svg" alt="Chart" style={{ width: 150, height: 80, marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 16, marginTop: 18 }}>Blood Availability by Group</div>
                <div style={{ color: "#888", fontSize: 14 }}>No data available.</div>
              </div>
            </div>
            {/* Middle Row */}
            <div style={{ display: "flex", gap: 28, marginBottom: 0 }}>
              {/* Nearby Resources (Map) */}
              <div className={styles.glassCard} style={{ flex: 2, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'stretch' }}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Nearby Resources</div>
                <div style={{ background: "#f5f5f5", borderRadius: 10, padding: 10, textAlign: "center", display: 'flex', flexDirection: 'column', flex: 1, minHeight: 320 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Nearby Hospitals, Banks & Camps</div>
                  <div style={{ width: "100%", flex: 1, borderRadius: 10, overflow: "hidden", marginBottom: 6, display: 'flex' }}>
                    <DonorMap requests={receivers} donors={donors} />
                  </div>
                  <div style={{ color: "#888", fontSize: 12 }}>(Dynamic map data coming soon!)</div>
                </div>
              </div>
              {/* Donation Tips */}
              <div className={styles.glassCard} style={{ flex: 1, minWidth: 280 }}>
                <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Donation Tips</div>
                <ul style={{ fontSize: 15, margin: 0, padding: 0, listStyle: "disc inside" }}>
                  <li>Stay hydrated before and after donating.</li>
                  <li>Eat a healthy meal before your donation.</li>
                  <li>Bring a valid ID and donor card.</li>
                  <li>Rest for a few minutes after donating.</li>
                  <li>Avoid strenuous exercise for 24 hours after donating.</li>
                  <li>Wear comfortable clothing with sleeves that can be rolled up.</li>
                  <li>Inform staff if you feel unwell at any time.</li>
                  <li>Do not donate if you are feeling sick or have a fever.</li>
                  <li>Avoid alcohol for at least 24 hours after donating.</li>
                  <li>Have a snack after your donation to help replenish your energy.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 