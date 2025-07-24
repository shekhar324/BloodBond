"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaTachometerAlt, FaBoxes, FaBell, FaUserMd, FaCalendarCheck, FaChartBar, FaSignOutAlt, FaCog, FaUser, FaFileAlt, FaPlug, FaHistory } from "react-icons/fa";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../../utils/useCurrentUser";

const accent = "#e53935";

const cardStyle = {
  background: "rgba(255,255,255,0.65)",
  borderRadius: 28,
  boxShadow: "0 8px 40px 0 rgba(229,57,53,0.13), 0 1.5px 8px 0 rgba(229,57,53,0.08)",
  border: "2.5px solid #e5393522",
  padding: "2.5rem 2rem 2rem 2rem",
  marginBottom: 44,
  minWidth: 340,
  maxWidth: "100%",
  minHeight: 420,
  transition: "box-shadow 0.25s, transform 0.18s, border 0.18s, background 0.25s",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  position: 'relative' as 'relative',
};

const sidebar = [
  { icon: <FaTachometerAlt />, label: "Dashboard", tab: "dashboard" },
  { icon: <FaBoxes />, label: "Inventory", tab: "inventory" },
  { icon: <FaBell />, label: "Requests", tab: "requests" },
  { icon: <FaUserMd />, label: "Donors", tab: "donors" },
  { icon: <FaUserMd />, label: "Receivers", tab: "receivers" },
  { icon: <FaCalendarCheck />, label: "Appointments", tab: "appointments" },
  { icon: <FaBell />, label: "Notifications", tab: "notifications" },
  { icon: <FaChartBar />, label: "Reports", tab: "reports" },
  { icon: <FaPlug />, label: "Integrations", tab: "integrations" },
  { icon: <FaHistory />, label: "Audit Logs", tab: "audit-logs" },
  { icon: <FaCog />, label: "Settings", tab: "settings" },
  { icon: <FaSignOutAlt />, label: "Logout", tab: "logout" },
];

export default function BloodBankAdminDashboard() {
  const { user, loading } = useCurrentUser();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [tab, setTab] = useState("dashboard");
  const [hovered, setHovered] = useState(-1);
  const [stats, setStats] = useState({ units: 0, requests: 0, donors: 0, receivers: 0, fulfilled: 0 });
  const [inventory, setInventory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<{ open: boolean, item: any | null }>({ open: false, item: null });
  const itemNameRef = useRef<HTMLInputElement>(null);
  const itemTypeRef = useRef<HTMLInputElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);
  const [shouldLogout, setShouldLogout] = useState(false);

  // Only check authentication, not role, for redirect (match user/hospital staff dashboards)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProfile() {
      if (user && user.id) {
        const { data, error } = await supabase
          .from("profiles")
          .select("fullName, email")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({ name: data.fullName, email: data.email });
        }
      }
    }
    fetchProfile();
  }, [user]);

  // Add Inventory Handler
  async function handleAddInventory(e: React.FormEvent) {
    e.preventDefault();
    const newItem = {
      item_name: itemNameRef.current?.value,
      item_type: itemTypeRef.current?.value,
      quantity: quantityRef.current?.value,
      location: locationRef.current?.value,
      expiry_date: expiryDateRef.current?.value,
    };
    await supabase.from("inventory").insert([newItem]);
    setShowAddModal(false);
  }

  // Edit Inventory Handler
  async function handleEditInventory(e: React.FormEvent) {
    e.preventDefault();
    if (!showEditModal.item) return;
    const updatedItem = {
      item_name: itemNameRef.current?.value,
      item_type: itemTypeRef.current?.value,
      quantity: quantityRef.current?.value,
      location: locationRef.current?.value,
      expiry_date: expiryDateRef.current?.value,
    };
    await supabase.from("inventory").update(updatedItem).eq("id", showEditModal.item.id);
    setShowEditModal({ open: false, item: null });
  }

  // Delete Inventory Handler
  async function handleDeleteInventory(id: any) {
    await supabase.from("inventory").delete().eq("id", id);
  }

  // Real-time data sync
  useEffect(() => {
    async function fetchData() {
      const { data: inv } = await supabase.from("inventory").select("*");
      setInventory(inv || []);
      const { data: req } = await supabase.from("requests").select("*");
      setRequests(req || []);
      const { data: donorsData } = await supabase.from("donors").select("*");
      setDonors(donorsData || []);
      const { data: receiversData } = await supabase.from("receivers").select("*");
      setReceivers(receiversData || []);
      const { data: apptsData } = await supabase.from("appointments").select("*");
      setAppointments(apptsData || []);
      const { data: notifData } = await supabase.from("notifications").select("*");
      setNotifications(notifData || []);
      const { data: logsData } = await supabase.from("audit_logs").select("*");
      setAuditLogs(logsData || []);
      // Integrations placeholder
      setIntegrations([{ name: "SMS Gateway", status: "Connected" }, { name: "Govt API", status: "Pending" }]);
      setStats({
        units: inv?.length || 0,
        requests: req?.length || 0,
        donors: donorsData?.length || 0,
        receivers: receiversData?.length || 0,
        fulfilled: req?.filter((r:any) => r.status === "Fulfilled").length || 0,
      });
    }
    fetchData();
    // Real-time subscriptions (example for inventory)
    const invSub = supabase
      .channel('admin-inventory')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, payload => {
        setInventory(inv => {
          if (payload.eventType === 'INSERT') return [...inv, payload.new];
          if (payload.eventType === 'UPDATE') return inv.map(i => i.id === payload.new.id ? payload.new : i);
          if (payload.eventType === 'DELETE') return inv.filter(i => i.id !== payload.old.id);
          return inv;
        });
      })
      .subscribe();
    // Add similar subscriptions for other tables as needed
    return () => {
      supabase.removeChannel(invSub);
    };
  }, []);

  function renderContent() {
    switch (tab) {
      case "dashboard":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginBottom: 32 }}>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588`, animation: "fadeIn 0.7s" }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Total Units</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.units}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588`, animation: "fadeIn 0.8s" }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Requests</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.requests}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588`, animation: "fadeIn 0.9s" }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Donors</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.donors}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588`, animation: "fadeIn 1s" }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Receivers</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.receivers}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588`, animation: "fadeIn 1.1s" }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Fulfilled</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.fulfilled}</div></div>
          </div>
        );
      case "inventory":
        return (
          <div style={{ ...cardStyle, minHeight: 650, animation: "fadeIn 0.7s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}><FaBoxes /> Blood Inventory</div>
              <button onClick={() => setShowAddModal(true)} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #e5393522", transition: "background 0.2s, transform 0.18s" }}>+ Add Inventory</button>
            </div>
            <input placeholder="Search by item name, type, or location..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom: 14, padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 15, width: 220 }} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>ID</th>
                    <th>Item Name</th>
                    <th>Item Type</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.filter(i => i.item_name?.toLowerCase().includes(search.toLowerCase()) || i.item_type?.toLowerCase().includes(search.toLowerCase()) || i.location?.toLowerCase().includes(search.toLowerCase())).map(i => (
                    <tr key={i.id} style={{ borderBottom: "1px solid #eee", background: i.expiry_date && new Date(i.expiry_date) < new Date(Date.now() + 7*24*60*60*1000) ? "#fff3e0" : undefined }}>
                      <td style={{ padding: 8 }}>{i.id}</td>
                      <td>{i.item_name}</td>
                      <td>{i.item_type}</td>
                      <td>{i.quantity}</td>
                      <td>{i.location}</td>
                      <td>{i.expiry_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Add Inventory Modal */}
            {showAddModal && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 4px 32px #e5393533" }}>
                  <h3 style={{ marginBottom: 18, color: accent }}>Add Inventory</h3>
                  <form onSubmit={handleAddInventory}>
                    <div style={{ marginBottom: 12 }}>
                      <label>Item Name</label>
                      <input type="text" ref={itemNameRef} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Item Type</label>
                      <input type="text" ref={itemTypeRef} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Quantity</label>
                      <input type="number" ref={quantityRef} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Location</label>
                      <input type="text" ref={locationRef} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label>Expiry Date</label>
                      <input type="date" ref={expiryDateRef} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                      <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "#eee", color: accent, border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case "requests":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 0.8s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaBell /> Blood Requests</div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 18 }}>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Total Requests</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{requests.length}</div>
              </div>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Pending Requests</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{requests.filter(r => r.status !== "Fulfilled").length}</div>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>ID</th>
                    <th>Type</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.sort((a, b) => (b.urgency || 0) - (a.urgency || 0)).map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{r.id}</td>
                      <td>{r.type}</td>
                      <td>{r.units}</td>
                      <td>{r.status}</td>
                      <td>{r.urgency || '-'}</td>
                      <td>
                        {r.status !== "Fulfilled" && (
                          <button style={{ background: accent, color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontWeight: 600, cursor: "pointer" }} onClick={async () => {
                            await supabase.from("requests").update({ status: "Fulfilled" }).eq("id", r.id);
                          }}>Mark Fulfilled</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "donors":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 0.9s" }}>
            <div style={{ fontWeight: 700, color: accent, marginBottom: 10, fontSize: 20, letterSpacing: 1, textShadow: "0 2px 8px #e5393522" }}>Donors</div>
            <input placeholder="Search by name, mobile, email, city, or pin..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom: 14, padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 15, width: 320 }} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>Pin</th>
                    <th>Blood Group</th>
                    <th>Last Donation</th>
                  </tr>
                </thead>
                <tbody>
                  {donors
                    .filter(d => !search || [d.full_name, d.mobile, d.email, d.city, d.pin].some(f => f?.toLowerCase().includes(search.toLowerCase())))
                    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                    .map(d => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{d.full_name}</td>
                      <td>{d.mobile}</td>
                      <td>{d.email}</td>
                      <td>{d.gender || '-'}</td>
                      <td>{d.address}</td>
                      <td>{d.city}</td>
                      <td>{d.pin}</td>
                      <td>{d.blood_group}</td>
                      <td>{d.last_donation || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "receivers":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1s" }}>
            <div style={{ fontWeight: 700, color: accent, marginBottom: 10, fontSize: 20, letterSpacing: 1, textShadow: "0 2px 8px #e5393522" }}>Receivers</div>
            <input placeholder="Search by name, mobile, email, city, or pin..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom: 14, padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 15, width: 320 }} />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>Pin</th>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {receivers
                    .filter(r => !search || [r.full_name, r.mobile, r.email, r.city, r.pin].some(f => f?.toLowerCase().includes(search.toLowerCase())))
                    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
                    .map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{r.full_name}</td>
                      <td>{r.mobile}</td>
                      <td>{r.email}</td>
                      <td>{r.gender || '-'}</td>
                      <td>{r.address}</td>
                      <td>{r.city}</td>
                      <td>{r.pin}</td>
                      <td>{r.blood_group}</td>
                      <td>{r.units}</td>
                      <td>{r.urgency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "appointments":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.1s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaCalendarCheck /> Appointments</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Blood Group</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{a.full_name}</td>
                      <td>{a.appointment_date}</td>
                      <td>{a.type}</td>
                      <td>{a.blood_group}</td>
                      <td>{a.role}</td>
                      <td>{a.location}</td>
                      <td>{a.status === 'pending' ? (
                        <button
                          style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
                          onClick={async () => {
                            await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', a.id);
                            setAppointments(appts => appts.map(appt => appt.id === a.id ? { ...appt, status: 'confirmed' } : appt));
                          }}
                        >
                          Confirm
                        </button>
                      ) : (
                        a.status
                      )}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.2s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaBell /> Notifications</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notifications.length === 0 && <li style={{ color: "#888" }}>No notifications</li>}
              {notifications.map((n, idx) => (
                <li key={n.id || idx} style={{ background: "#fff7f7", borderRadius: 10, padding: "12px 18px", marginBottom: 10, color: accent, fontWeight: 600, boxShadow: "0 2px 8px #e5393522", animation: `fadeIn ${(1.2 + idx * 0.1)}s` }}>{n.message}</li>
              ))}
            </ul>
          </div>
        );
      case "reports":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.3s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaChartBar /> Reports & Analytics</div>
            <div style={{ color: "#888", fontSize: 15 }}>Charts and downloadable reports coming soon.</div>
          </div>
        );
      case "integrations":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.4s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaPlug /> Integrations & External Services</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Connect with hospital systems, government APIs, and third-party tools. (Integration setup and logs coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Integration features are coming soon!
            </div>
          </div>
        );
      case "audit-logs":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.5s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaHistory /> Audit Logs</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Track all admin actions for security and compliance. (Audit log details coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Audit log features are coming soon!
            </div>
          </div>
        );
      case "settings":
        return (
          <div style={{ ...cardStyle, animation: "fadeIn 1.6s" }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaCog /> Settings</div>
            <div style={{ color: "#888", fontSize: 15 }}>Profile and notification settings coming soon.</div>
          </div>
        );
      case "logout":
        setShouldLogout(true);
        return null;
      default:
        return null;
    }
  }

  useEffect(() => {
    if (shouldLogout) {
      router.replace("/login");
    }
  }, [shouldLogout, router]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(120deg,#f7f8fa 60%,#fbe9e7 100%)", transition: "background 0.3s", display: "flex", flexDirection: "column" }}>
      {/* Top Navbar */}
      <div style={{ height: 70, background: accent, display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 36px", color: "#fff", position: "sticky", top: 0, zIndex: 110 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {loading || !profile ? (
            <span style={{ fontWeight: 600, fontSize: 17 }}>Loading...</span>
          ) : (
            <>
              <span style={{ fontWeight: 600, fontSize: 17 }}>{profile.name}</span>
              <span style={{ fontWeight: 400, fontSize: 15, opacity: 0.85, marginLeft: 6 }}>{profile.email}</span>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 19 }}>
                {profile.name?.charAt(0).toUpperCase()}
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar */}
        <aside style={{ width: 270, background: "#fff", boxShadow: "2px 0 16px #e5393522", display: "flex", flexDirection: "column", position: "fixed", top: 70, left: 0, bottom: 0, zIndex: 100 }}>
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #eee" }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
              <FaFileAlt style={{ marginRight: 8 }} />Blood Bank Admin
            </span>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <nav style={{ flex: 1, overflowY: "auto", padding: "18px 0" }}>
              {sidebar.map((item, idx) => (
                <div
                  key={item.label}
                  onClick={() => setTab(item.tab)}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(-1)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    padding: "12px 24px",
                    fontSize: 16,
                    color: tab === item.tab ? accent : hovered === idx ? "#b71c1c" : "#222",
                    cursor: "pointer",
                    background: tab === item.tab ? "#fbe9e7" : hovered === idx ? "#f8f9fa" : "transparent",
                    fontWeight: tab === item.tab ? 700 : 500,
                    borderLeft: tab === item.tab ? `4px solid ${accent}` : hovered === idx ? "3px solid #e53935" : "4px solid transparent",
                    boxShadow: hovered === idx ? "0 2px 12px 0 #e5393522" : undefined,
                    transform: hovered === idx ? "scale(1.035)" : "scale(1)",
                    transition: "background 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s, color 0.18s, border-left 0.18s, transform 0.18s",
                    borderRadius: hovered === idx ? 12 : 0,
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
            <div style={{ padding: 24, borderTop: "1px solid #eee", textAlign: "center", color: accent, fontWeight: 600, fontSize: 15 }}>
              {loading || !profile ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{profile.name}</span>
                  <div style={{ fontWeight: 400, color: "#888", fontSize: 13 }}>{profile.email}</div>
                </>
              )}
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <div style={{ flex: 1, marginLeft: 270, minHeight: "calc(100vh - 70px)", padding: "38px 32px", maxWidth: 1400 }}>
          {/* Section Header */}
          <h1 style={{ color: accent, fontWeight: 800, fontSize: 28, marginBottom: 24, letterSpacing: 1, textShadow: "0 2px 8px #e5393522" }}>{sidebar.find(s => s.tab === tab)?.label}</h1>
          {/* Section Content */}
          {renderContent()}
        </div>
      </div>
      {/* Add Inventory Modal (root level, overlays everything) */}
      {showAddModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <form onSubmit={handleAddInventory} style={{ background: "#fff", borderRadius: 18, boxShadow: "0 8px 30px #e5393522", padding: 32, minWidth: 320, display: "flex", flexDirection: "column", gap: 18 }}>
            <h3 style={{ color: accent, fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Add Inventory</h3>
            <input ref={itemNameRef} placeholder="Item Name" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={itemTypeRef} placeholder="Item Type" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={quantityRef} placeholder="Quantity" type="number" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={locationRef} placeholder="Location" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={expiryDateRef} placeholder="Expiry Date" type="date" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1 }}>Add</button>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "#fff", color: accent, border: `1.5px solid ${accent}`, borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit Inventory Modal (keep as is or move similarly if needed) */}
      {showEditModal.open && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <form onSubmit={handleEditInventory} style={{ background: "#fff", borderRadius: 18, boxShadow: "0 8px 30px #e5393522", padding: 32, minWidth: 320, display: "flex", flexDirection: "column", gap: 18 }}>
            <h3 style={{ color: accent, fontWeight: 800, fontSize: 22, marginBottom: 8 }}>Edit Inventory</h3>
            <input ref={itemNameRef} defaultValue={showEditModal.item?.item_name} placeholder="Item Name" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={itemTypeRef} defaultValue={showEditModal.item?.item_type} placeholder="Item Type" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={quantityRef} defaultValue={showEditModal.item?.quantity} placeholder="Quantity" type="number" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={locationRef} defaultValue={showEditModal.item?.location} placeholder="Location" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <input ref={expiryDateRef} defaultValue={showEditModal.item?.expiry_date} placeholder="Expiry Date" type="date" required style={{ padding: 10, borderRadius: 8, border: "1px solid #eee" }} />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1 }}>Save</button>
              <button type="button" onClick={() => setShowEditModal({ open: false, item: null })} style={{ background: "#fff", color: accent, border: `1.5px solid ${accent}`, borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", flex: 1 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 