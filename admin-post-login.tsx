"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import { useCurrentUser } from "../../../utils/useCurrentUser";
import { FaTachometerAlt, FaUser, FaUserMd, FaBell, FaBoxes, FaHospital, FaHistory, FaSignOutAlt, FaCog } from "react-icons/fa";
import { Modal, Button, Input, Checkbox } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

const accent = "#1976d2";
const glassStyle = {
  background: "rgba(255,255,255,0.18)",
  borderRadius: 24,
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.18)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1.5px solid rgba(255,255,255,0.28)",
  padding: "2rem",
  marginBottom: 32,
  transition: "box-shadow 0.2s, transform 0.2s",
};

const sidebar = [
  { icon: <FaTachometerAlt />, label: "Dashboard", tab: "dashboard" },
  { icon: <FaUser />, label: "Users", tab: "users" },
  { icon: <FaUserMd />, label: "Donors", tab: "donors" },
  { icon: <FaBell />, label: "Requests", tab: "requests" },
  { icon: <FaBoxes />, label: "Inventory", tab: "inventory" },
  { icon: <FaHospital />, label: "Hospitals", tab: "hospitals" },
  { icon: <FaHospital />, label: "Blood Banks", tab: "bloodbanks" },
  { icon: <FaHistory />, label: "Audit Logs", tab: "auditlogs" },
  { icon: <FaCog />, label: "Settings", tab: "settings" },
  { icon: <FaSignOutAlt />, label: "Logout", tab: "logout" },
  { icon: <FaUser />, label: "Impersonation", tab: "impersonation" },
  { icon: <FaBell />, label: "Notifications", tab: "notifications" },
  { icon: <FaBoxes />, label: "Export/Import", tab: "exportimport" },
  { icon: <FaTachometerAlt />, label: "Analytics", tab: "analytics" },
  { icon: <FaCog />, label: "Integrations", tab: "integrations" },
  { icon: <FaBoxes />, label: "Backup/Restore", tab: "backuprestore" },
  { icon: <FaTachometerAlt />, label: "System Health", tab: "systemhealth" },
];

function exportToCSV(filename: string, rows: any[]) {
  if (!rows.length) return;
  const replacer = (_key: string, value: any) => value === null ? '' : value;
  const header = Object.keys(rows[0]);
  const csv = [
    header.join(','),
    ...rows.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminPostLogin() {
  const { user, loading } = useCurrentUser();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState<any>({ users: [], donors: [], requests: [], inventory: [], hospitals: [], bloodbanks: [], auditlogs: [] });
  const router = useRouter();
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState<any>({ email: "", is_admin: false });
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [editingDonor, setEditingDonor] = useState<any>(null);
  const [donorForm, setDonorForm] = useState<any>({ full_name: "", mobile: "", email: "", gender: "", address: "", city: "", pin: "", blood_group: "", last_donation: "" });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [requestForm, setRequestForm] = useState<any>({ type: "", units: "", status: "", urgency: "" });
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const [inventoryForm, setInventoryForm] = useState<any>({ item_name: "", item_type: "", quantity: "", location: "", expiry_date: "" });
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState<any>(null);
  const [hospitalForm, setHospitalForm] = useState<any>({ name: "", location: "" });
  const [showBloodBankModal, setShowBloodBankModal] = useState(false);
  const [editingBloodBank, setEditingBloodBank] = useState<any>(null);
  const [bloodBankForm, setBloodBankForm] = useState<any>({ name: "", location: "" });
  const [userSearch, setUserSearch] = useState("");
  const [donorSearch, setDonorSearch] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [bloodBankSearch, setBloodBankSearch] = useState("");
  const [impersonateUserId, setImpersonateUserId] = useState<string>("");
  const [impersonatedUser, setImpersonatedUser] = useState<any>(null);
  const [auditLogSearch, setAuditLogSearch] = useState("");
  const [hovered, setHovered] = useState(-1);

  // Add a new state for all auth users
  const [authUsers, setAuthUsers] = useState<any[]>([]);
  const [authUsersError, setAuthUsersError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      setProfileLoading(false);
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchProfileAndData() {
      if (user && user.id) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, email, is_admin, full_name")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
        setProfileLoading(false);
        if (profileData && !profileData.is_admin) {
          alert("Access denied: Only admins can log in.");
          router.replace("/login");
          return;
        }
        // Fetch all users from profiles table
        const { data: allUsers } = await supabase.from("profiles").select("id, email, is_admin, fullName, role, gender, phone, bloodType");
        setData((prev: any) => ({ ...prev, users: allUsers || [] }));
        // Fetch other data as before
        const [donors, requests, inventory, hospitals, bloodbanks, auditlogs] = await Promise.all([
          supabase.from("donors").select("*"),
          supabase.from("requests").select("*"),
          supabase.from("inventory").select("*"),
          supabase.from("hospitals").select("*"),
          supabase.from("blood_banks").select("*"),
          supabase.from("audit_logs").select("*"),
        ]);
        setData((prev: any) => ({
          ...prev,
          donors: donors.data || [],
          requests: requests.data || [],
          inventory: inventory.data || [],
          hospitals: hospitals.data || [],
          bloodbanks: bloodbanks.data || [],
          auditlogs: auditlogs.data || [],
        }));
      }
    }
    fetchProfileAndData();
  }, [user, router]);

  useEffect(() => {
    async function fetchAuthUsers() {
      try {
        const res = await fetch("/api/admin-users");
        if (!res.ok) throw new Error("Failed to fetch admin users");
        const data = await res.json();
        if (data.users) setAuthUsers(data.users);
        setAuthUsersError("");
      } catch (e) {
        setAuthUsersError("Could not load admin users. Please try again later.");
      }
    }
    fetchAuthUsers();
  }, []);

  if (profileLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 24, color: accent }}>Loading admin dashboard...</div>;
  }

  async function handleUserSave() {
    if (editingUser) {
      // Update user
      await supabase.from("profiles").update({ email: userForm.email, is_admin: userForm.is_admin }).eq("id", editingUser.id);
    } else {
      // Add user
      await supabase.from("profiles").insert([{ email: userForm.email, is_admin: userForm.is_admin }]);
    }
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ email: "", is_admin: false });
    // Refresh users
    const { data: users } = await supabase.from("profiles").select("*");
    setData((prev: any) => ({ ...prev, users: users || [] }));
  }

  async function handleUserDelete(id: any) {
    await supabase.from("profiles").delete().eq("id", id);
    // Refresh users
    const { data: users } = await supabase.from("profiles").select("*");
    setData((prev: any) => ({ ...prev, users: users || [] }));
  }

  async function handleDonorSave() {
    if (editingDonor) {
      await supabase.from("donors").update(donorForm).eq("id", editingDonor.id);
    } else {
      await supabase.from("donors").insert([donorForm]);
    }
    setShowDonorModal(false);
    setEditingDonor(null);
    setDonorForm({ full_name: "", mobile: "", email: "", gender: "", address: "", city: "", pin: "", blood_group: "", last_donation: "" });
    const { data: donors } = await supabase.from("donors").select("*");
    setData((prev: any) => ({ ...prev, donors: donors || [] }));
  }
  async function handleDonorDelete(id: any) {
    await supabase.from("donors").delete().eq("id", id);
    const { data: donors } = await supabase.from("donors").select("*");
    setData((prev: any) => ({ ...prev, donors: donors || [] }));
  }

  async function handleRequestSave() {
    if (editingRequest) {
      await supabase.from("requests").update(requestForm).eq("id", editingRequest.id);
    } else {
      await supabase.from("requests").insert([requestForm]);
    }
    setShowRequestModal(false);
    setEditingRequest(null);
    setRequestForm({ type: "", units: "", status: "", urgency: "" });
    const { data: requests } = await supabase.from("requests").select("*");
    setData((prev: any) => ({ ...prev, requests: requests || [] }));
  }
  async function handleRequestDelete(id: any) {
    await supabase.from("requests").delete().eq("id", id);
    const { data: requests } = await supabase.from("requests").select("*");
    setData((prev: any) => ({ ...prev, requests: requests || [] }));
  }

  async function handleInventorySave() {
    if (editingInventory) {
      await supabase.from("inventory").update(inventoryForm).eq("id", editingInventory.id);
    } else {
      await supabase.from("inventory").insert([inventoryForm]);
    }
    setShowInventoryModal(false);
    setEditingInventory(null);
    setInventoryForm({ item_name: "", item_type: "", quantity: "", location: "", expiry_date: "" });
    const { data: inventory } = await supabase.from("inventory").select("*");
    setData((prev: any) => ({ ...prev, inventory: inventory || [] }));
  }
  async function handleInventoryDelete(id: any) {
    await supabase.from("inventory").delete().eq("id", id);
    const { data: inventory } = await supabase.from("inventory").select("*");
    setData((prev: any) => ({ ...prev, inventory: inventory || [] }));
  }

  async function handleHospitalSave() {
    if (editingHospital) {
      await supabase.from("hospitals").update(hospitalForm).eq("id", editingHospital.id);
    } else {
      await supabase.from("hospitals").insert([hospitalForm]);
    }
    setShowHospitalModal(false);
    setEditingHospital(null);
    setHospitalForm({ name: "", location: "" });
    const { data: hospitals } = await supabase.from("hospitals").select("*");
    setData((prev: any) => ({ ...prev, hospitals: hospitals || [] }));
  }
  async function handleHospitalDelete(id: any) {
    await supabase.from("hospitals").delete().eq("id", id);
    const { data: hospitals } = await supabase.from("hospitals").select("*");
    setData((prev: any) => ({ ...prev, hospitals: hospitals || [] }));
  }

  async function handleBloodBankSave() {
    if (editingBloodBank) {
      await supabase.from("blood_banks").update(bloodBankForm).eq("id", editingBloodBank.id);
    } else {
      await supabase.from("blood_banks").insert([bloodBankForm]);
    }
    setShowBloodBankModal(false);
    setEditingBloodBank(null);
    setBloodBankForm({ name: "", location: "" });
    const { data: bloodbanks } = await supabase.from("blood_banks").select("*");
    setData((prev: any) => ({ ...prev, bloodbanks: bloodbanks || [] }));
  }
  async function handleBloodBankDelete(id: any) {
    await supabase.from("blood_banks").delete().eq("id", id);
    const { data: bloodbanks } = await supabase.from("blood_banks").select("*");
    setData((prev: any) => ({ ...prev, bloodbanks: bloodbanks || [] }));
  }

  function renderContent() {
    switch (tab) {
      case "dashboard":
        return (
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 0.7s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Total Users</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.users) ? data.users.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 0.8s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Donors</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.donors) ? data.donors.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 0.9s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Requests</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.requests) ? data.requests.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 1.0s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Inventory</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.inventory) ? data.inventory.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 1.1s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Hospitals</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.hospitals) ? data.hospitals.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 1.2s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Blood Banks</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.bloodbanks) ? data.bloodbanks.length : 0}</div>
            </div>
            <div style={{ ...glassStyle, minWidth: 220, flex: 1, animation: "fadeIn 1.3s" }}>
              <div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Audit Logs</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{Array.isArray(data.auditlogs) ? data.auditlogs.length : 0}</div>
            </div>
          </div>
        );
      case "users":
        const filteredUsers = Array.isArray(data.users) ? data.users.filter((u: any) => !userSearch || Object.values(u).join(" ").toLowerCase().includes(userSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>All Users</h2>
            <Input placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => { setShowUserModal(true); setEditingUser(null); setUserForm({ email: "", is_admin: false }); }}>Add User</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('users.csv', filteredUsers)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>ID</th><th>Email</th><th>Full Name</th><th>Role</th><th>Gender</th><th>Mobile</th><th>Blood Type</th><th>Admin</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td>{u.fullName || u.full_name || ""}</td>
                    <td>{u.role || ""}</td>
                    <td>{u.gender || ""}</td>
                    <td>{u.phone || ""}</td>
                    <td>{u.bloodType || ""}</td>
                    <td>{u.is_admin ? "Yes" : "No"}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingUser(u); setUserForm({ email: u.email, is_admin: u.is_admin }); setShowUserModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleUserDelete(u.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingUser ? "Edit User" : "Add User"}
              open={showUserModal}
              onCancel={() => { setShowUserModal(false); setEditingUser(null); }}
              onOk={handleUserSave}
              okText={editingUser ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input
                placeholder="Email"
                value={userForm.email}
                onChange={e => setUserForm((f: any) => ({ ...f, email: e.target.value }))}
                style={{ marginBottom: 16 }}
              />
              <Checkbox
                checked={userForm.is_admin}
                onChange={e => setUserForm((f: any) => ({ ...f, is_admin: e.target.checked }))}
              >Is Admin</Checkbox>
            </Modal>
          </div>
        );
      case "donors":
        const filteredDonors = Array.isArray(data.donors) ? data.donors.filter((d: any) => !donorSearch || Object.values(d).join(" ").toLowerCase().includes(donorSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Donors</h2>
            <Input placeholder="Search donors..." value={donorSearch} onChange={e => setDonorSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setShowDonorModal(true); setEditingDonor(null); setDonorForm({ full_name: "", mobile: "", email: "", gender: "", address: "", city: "", pin: "", blood_group: "", last_donation: "" }); }}>Add Donor</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('donors.csv', filteredDonors)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>Name</th><th>Mobile</th><th>Email</th><th>Gender</th><th>Address</th><th>City</th><th>Pin</th><th>Blood Group</th><th>Last Donation</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((d: any) => (
                  <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{d.full_name}</td><td>{d.mobile}</td><td>{d.email}</td><td>{d.gender}</td><td>{d.address}</td><td>{d.city}</td><td>{d.pin}</td><td>{d.blood_group}</td><td>{d.last_donation}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingDonor(d); setDonorForm({ ...d }); setShowDonorModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleDonorDelete(d.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingDonor ? "Edit Donor" : "Add Donor"}
              open={showDonorModal}
              onCancel={() => { setShowDonorModal(false); setEditingDonor(null); }}
              onOk={handleDonorSave}
              okText={editingDonor ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input placeholder="Full Name" value={donorForm.full_name} onChange={e => setDonorForm((f: any) => ({ ...f, full_name: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Mobile" value={donorForm.mobile} onChange={e => setDonorForm((f: any) => ({ ...f, mobile: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Email" value={donorForm.email} onChange={e => setDonorForm((f: any) => ({ ...f, email: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Gender" value={donorForm.gender} onChange={e => setDonorForm((f: any) => ({ ...f, gender: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Address" value={donorForm.address} onChange={e => setDonorForm((f: any) => ({ ...f, address: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="City" value={donorForm.city} onChange={e => setDonorForm((f: any) => ({ ...f, city: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Pin" value={donorForm.pin} onChange={e => setDonorForm((f: any) => ({ ...f, pin: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Blood Group" value={donorForm.blood_group} onChange={e => setDonorForm((f: any) => ({ ...f, blood_group: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Last Donation" value={donorForm.last_donation} onChange={e => setDonorForm((f: any) => ({ ...f, last_donation: e.target.value }))} style={{ marginBottom: 12 }} />
            </Modal>
          </div>
        );
      case "requests":
        const filteredRequests = Array.isArray(data.requests) ? data.requests.filter((r: any) => !requestSearch || Object.values(r).join(" ").toLowerCase().includes(requestSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Requests</h2>
            <Input placeholder="Search requests..." value={requestSearch} onChange={e => setRequestSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setShowRequestModal(true); setEditingRequest(null); setRequestForm({ type: "", units: "", status: "", urgency: "" }); }}>Add Request</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('requests.csv', filteredRequests)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>Type</th><th>Units</th><th>Status</th><th>Urgency</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r: any) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{r.type}</td><td>{r.units}</td><td>{r.status}</td><td>{r.urgency}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingRequest(r); setRequestForm({ ...r }); setShowRequestModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleRequestDelete(r.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingRequest ? "Edit Request" : "Add Request"}
              open={showRequestModal}
              onCancel={() => { setShowRequestModal(false); setEditingRequest(null); }}
              onOk={handleRequestSave}
              okText={editingRequest ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input placeholder="Type" value={requestForm.type} onChange={e => setRequestForm((f: any) => ({ ...f, type: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Units" value={requestForm.units} onChange={e => setRequestForm((f: any) => ({ ...f, units: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Status" value={requestForm.status} onChange={e => setRequestForm((f: any) => ({ ...f, status: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Urgency" value={requestForm.urgency} onChange={e => setRequestForm((f: any) => ({ ...f, urgency: e.target.value }))} style={{ marginBottom: 12 }} />
            </Modal>
          </div>
        );
      case "inventory":
        const filteredInventory = Array.isArray(data.inventory) ? data.inventory.filter((i: any) => !inventorySearch || Object.values(i).join(" ").toLowerCase().includes(inventorySearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Inventory</h2>
            <Input placeholder="Search inventory..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setShowInventoryModal(true); setEditingInventory(null); setInventoryForm({ item_name: "", item_type: "", quantity: "", location: "", expiry_date: "" }); }}>Add Inventory</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('inventory.csv', filteredInventory)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>Item Name</th><th>Item Type</th><th>Quantity</th><th>Location</th><th>Expiry Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((i: any) => (
                  <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{i.item_name}</td><td>{i.item_type}</td><td>{i.quantity}</td><td>{i.location}</td><td>{i.expiry_date}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingInventory(i); setInventoryForm({ ...i }); setShowInventoryModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleInventoryDelete(i.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingInventory ? "Edit Inventory" : "Add Inventory"}
              open={showInventoryModal}
              onCancel={() => { setShowInventoryModal(false); setEditingInventory(null); }}
              onOk={handleInventorySave}
              okText={editingInventory ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input placeholder="Item Name" value={inventoryForm.item_name} onChange={e => setInventoryForm((f: any) => ({ ...f, item_name: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Item Type" value={inventoryForm.item_type} onChange={e => setInventoryForm((f: any) => ({ ...f, item_type: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Quantity" value={inventoryForm.quantity} onChange={e => setInventoryForm((f: any) => ({ ...f, quantity: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Location" value={inventoryForm.location} onChange={e => setInventoryForm((f: any) => ({ ...f, location: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Expiry Date" value={inventoryForm.expiry_date} onChange={e => setInventoryForm((f: any) => ({ ...f, expiry_date: e.target.value }))} style={{ marginBottom: 12 }} />
            </Modal>
          </div>
        );
      case "hospitals":
        const filteredHospitals = Array.isArray(data.hospitals) ? data.hospitals.filter((h: any) => !hospitalSearch || Object.values(h).join(" ").toLowerCase().includes(hospitalSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Hospitals</h2>
            <Input placeholder="Search hospitals..." value={hospitalSearch} onChange={e => setHospitalSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setShowHospitalModal(true); setEditingHospital(null); setHospitalForm({ name: "", location: "" }); }}>Add Hospital</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('hospitals.csv', filteredHospitals)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>Name</th><th>Location</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHospitals.map((h: any) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{h.name}</td><td>{h.location}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingHospital(h); setHospitalForm({ ...h }); setShowHospitalModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleHospitalDelete(h.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingHospital ? "Edit Hospital" : "Add Hospital"}
              open={showHospitalModal}
              onCancel={() => { setShowHospitalModal(false); setEditingHospital(null); }}
              onOk={handleHospitalSave}
              okText={editingHospital ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input placeholder="Name" value={hospitalForm.name} onChange={e => setHospitalForm((f: any) => ({ ...f, name: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Location" value={hospitalForm.location} onChange={e => setHospitalForm((f: any) => ({ ...f, location: e.target.value }))} style={{ marginBottom: 12 }} />
            </Modal>
          </div>
        );
      case "bloodbanks":
        const filteredBloodBanks = Array.isArray(data.bloodbanks) ? data.bloodbanks.filter((b: any) => !bloodBankSearch || Object.values(b).join(" ").toLowerCase().includes(bloodBankSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Blood Banks</h2>
            <Input placeholder="Search blood banks..." value={bloodBankSearch} onChange={e => setBloodBankSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button type="primary" style={{ marginBottom: 16 }} onClick={() => { setShowBloodBankModal(true); setEditingBloodBank(null); setBloodBankForm({ name: "", location: "" }); }}>Add Blood Bank</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('bloodbanks.csv', filteredBloodBanks)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Import (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>Name</th><th>Location</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBloodBanks.map((b: any) => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{b.name}</td><td>{b.location}</td>
                    <td>
                      <Button style={{ marginRight: 8 }} onClick={() => { setEditingBloodBank(b); setBloodBankForm({ ...b }); setShowBloodBankModal(true); }}>Edit</Button>
                      <Button danger onClick={() => handleBloodBankDelete(b.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Modal
              title={editingBloodBank ? "Edit Blood Bank" : "Add Blood Bank"}
              open={showBloodBankModal}
              onCancel={() => { setShowBloodBankModal(false); setEditingBloodBank(null); }}
              onOk={handleBloodBankSave}
              okText={editingBloodBank ? "Update" : "Add"}
              style={{ borderRadius: 24, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.18)" }}
            >
              <Input placeholder="Name" value={bloodBankForm.name} onChange={e => setBloodBankForm((f: any) => ({ ...f, name: e.target.value }))} style={{ marginBottom: 12 }} />
              <Input placeholder="Location" value={bloodBankForm.location} onChange={e => setBloodBankForm((f: any) => ({ ...f, location: e.target.value }))} style={{ marginBottom: 12 }} />
            </Modal>
          </div>
        );
      case "auditlogs":
        const filteredAuditLogs = Array.isArray(data.auditlogs) ? data.auditlogs.filter((a: any) => !auditLogSearch || Object.values(a).join(" ").toLowerCase().includes(auditLogSearch.toLowerCase())) : [];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Audit Logs</h2>
            <Input placeholder="Search audit logs..." value={auditLogSearch} onChange={e => setAuditLogSearch(e.target.value)} style={{ marginBottom: 16, width: 320 }} />
            <Button style={{ marginBottom: 16, marginLeft: 16 }} onClick={() => exportToCSV('auditlogs.csv', filteredAuditLogs)}>Export CSV</Button>
            <Button style={{ marginBottom: 16, marginLeft: 16 }} disabled>Advanced Filter (coming soon)</Button>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
              <thead>
                <tr style={{ background: "#e3f2fd" }}>
                  <th>ID</th><th>Action</th><th>User</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td>{a.id}</td><td>{a.action}</td><td>{a.user_id}</td><td>{a.created_at ? new Date(a.created_at).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "settings":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Settings & Configuration</h2>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>App Branding</h3>
                <p>Feature coming soon: Update app name, logo, and color scheme.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Notification Preferences</h3>
                <p>Feature coming soon: Configure notification channels and preferences.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Integrations</h3>
                <p>Feature coming soon: Manage external service integrations (SMS, email, analytics, etc.).</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Feature Toggles</h3>
                <p>Feature coming soon: Enable or disable app features for all users.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 32 }}>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Two-Factor Authentication (2FA)</h3>
                <p>Feature coming soon: Enable 2FA for admin accounts for enhanced security.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Session Management</h3>
                <p>Feature coming soon: View and revoke active sessions for all users.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Password & Account Controls</h3>
                <p>Feature coming soon: Reset passwords, lock accounts, and manage security settings.</p>
              </div>
            </div>
          </div>
        );
      case "logout":
        supabase.auth.signOut();
        router.replace("/login");
        return null;
      case "impersonation":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Impersonation / View-As</h2>
            {impersonatedUser ? (
              <div style={{ marginBottom: 24, padding: 16, background: "rgba(255,0,0,0.08)", borderRadius: 12, color: accent, fontWeight: 700 }}>
                Impersonating: {impersonatedUser.email} <Button style={{ marginLeft: 16 }} onClick={() => setImpersonatedUser(null)}>Return to Admin View</Button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Search user email..."
                  value={impersonateUserId}
                  onChange={e => setImpersonateUserId(e.target.value)}
                  style={{ marginBottom: 16, width: 320 }}
                />
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
                  {Array.isArray(data.users) ? data.users.filter((u: any) => !impersonateUserId || u.email.toLowerCase().includes(impersonateUserId.toLowerCase())).slice(0, 10).map((u: any) => (
                    <div key={u.id} style={{ padding: 8, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{u.email} {u.is_admin && <span style={{ color: accent, fontWeight: 600 }}>(admin)</span>}</span>
                      <Button size="small" onClick={() => setImpersonatedUser(u)}>Impersonate</Button>
                    </div>
                  )) : []}
                </div>
              </>
            )}
            <p style={{ color: '#888', marginTop: 24 }}>When impersonating, you will see the app as the selected user. (Full context switching for all pages will require further integration.)</p>
          </div>
        );
      case "notifications":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Notifications & Alerts</h2>
            <div style={{ marginBottom: 24 }}>
              {Array.isArray(data.notifications) && data.notifications.length === 0 ? (
                <div style={{ color: '#888', fontSize: 16 }}>No notifications yet.</div>
              ) : (
                Array.isArray(data.notifications) ? data.notifications.slice(0, 20).map((n: any, idx: number) => (
                  <div key={n.id || idx} style={{ marginBottom: 16, padding: 18, borderRadius: 16, background: 'rgba(25, 118, 210, 0.08)', boxShadow: '0 2px 8px #1976d222', color: accent, fontWeight: 600 }}>
                    <div style={{ fontSize: 16 }}>{n.message || n.title || 'Notification'}</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                  </div>
                )) : []
              )}
            </div>
            <div style={{ ...glassStyle, marginTop: 32 }}>
              <h3 style={{ color: accent }}>Notification Settings</h3>
              <p>Feature coming soon: Configure in-app, email, and SMS notifications for critical events.</p>
            </div>
          </div>
        );
      case "exportimport":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Export & Import</h2>
            <p>Feature coming soon: Export data to CSV, Excel, PDF, and import from files for bulk uploads.</p>
          </div>
        );
      case "analytics":
        // Example data for charts
        const requestsByStatus = Array.isArray(data.requests) ? Object.entries(data.requests.reduce((acc: any, r: any) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {})).map(([status, count]) => ({ status, count })) : [];
        const inventoryByType = Array.isArray(data.inventory) ? Object.entries(data.inventory.reduce((acc: any, i: any) => { acc[i.item_type] = (acc[i.item_type] || 0) + 1; return acc; }, {})).map(([type, count]) => ({ type, count })) : [];
        // Mocked donations over time
        const donationsOverTime = Array.isArray(data.donors) ? [
          { date: 'Jan', donations: 12 },
          { date: 'Feb', donations: 18 },
          { date: 'Mar', donations: 22 },
          { date: 'Apr', donations: 15 },
          { date: 'May', donations: 30 },
          { date: 'Jun', donations: 25 },
        ] : [];
        const COLORS = ['#1976d2', '#e53935', '#43a047', '#fbc02d', '#8e24aa', '#00acc1'];
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Analytics & Charts</h2>
            <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
              <div style={{ ...glassStyle, minWidth: 180, flex: 1 }}>
                <div style={{ color: accent, fontWeight: 700 }}>Total Users</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{Array.isArray(data.users) ? data.users.length : 0}</div>
              </div>
              <div style={{ ...glassStyle, minWidth: 180, flex: 1 }}>
                <div style={{ color: accent, fontWeight: 700 }}>Total Donors</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{Array.isArray(data.donors) ? data.donors.length : 0}</div>
              </div>
              <div style={{ ...glassStyle, minWidth: 180, flex: 1 }}>
                <div style={{ color: accent, fontWeight: 700 }}>Total Requests</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{Array.isArray(data.requests) ? data.requests.length : 0}</div>
              </div>
              <div style={{ ...glassStyle, minWidth: 180, flex: 1 }}>
                <div style={{ color: accent, fontWeight: 700 }}>Total Inventory Items</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{Array.isArray(data.inventory) ? data.inventory.length : 0}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ ...glassStyle, flex: 1, minWidth: 320, height: 320 }}>
                <h3 style={{ color: accent, marginBottom: 12 }}>Requests by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={requestsByStatus}>
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...glassStyle, flex: 1, minWidth: 320, height: 320 }}>
                <h3 style={{ color: accent, marginBottom: 12 }}>Donations Over Time</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={donationsOverTime}>
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="donations" stroke="#e53935" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ ...glassStyle, flex: 1, minWidth: 320, height: 320 }}>
                <h3 style={{ color: accent, marginBottom: 12 }}>Inventory by Type</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={inventoryByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                      {inventoryByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case "integrations":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Integrations</h2>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>SMS Gateway</h3>
                <p>Status: <b>Connected</b></p>
                <p>Feature coming soon: Configure SMS notifications and alerts.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Email Service</h3>
                <p>Status: <b>Connected</b></p>
                <p>Feature coming soon: Configure email notifications and campaigns.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Analytics Integration</h3>
                <p>Status: <b>Pending</b></p>
                <p>Feature coming soon: Connect to analytics platforms for advanced reporting.</p>
              </div>
            </div>
          </div>
        );
      case "backuprestore":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>Data Backup & Restore</h2>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Export Data</h3>
                <p>Feature coming soon: Export full database or selected tables for backup.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Import Data</h3>
                <p>Feature coming soon: Restore from backup files (CSV, Excel, etc.).</p>
              </div>
            </div>
          </div>
        );
      case "systemhealth":
        return (
          <div style={glassStyle}>
            <h2 style={{ color: accent }}>System Health / Status</h2>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginTop: 24 }}>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Database Status</h3>
                <p>Status: <b>Online</b></p>
                <p>Feature coming soon: Real-time database health and uptime monitoring.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>API Status</h3>
                <p>Status: <b>Online</b></p>
                <p>Feature coming soon: Monitor API response times and errors.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>External Services</h3>
                <p>Status: <b>All Connected</b></p>
                <p>Feature coming soon: Monitor SMS, email, and analytics service health.</p>
              </div>
              <div style={{ ...glassStyle, minWidth: 320, flex: 1 }}>
                <h3 style={{ color: accent }}>Uptime & Error Monitoring</h3>
                <p>Feature coming soon: Track uptime, downtime, and error rates for all services.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(120deg, #e3f2fd 0%, #f8bbd0 100%)" }}>
      {/* Fixed Navbar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 64,
        background: 'rgba(255,255,255,0.95)',
        boxShadow: '0 2px 12px #1976d233',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderBottom: `2px solid ${accent}22`,
      }}>
        <div style={{ fontWeight: 900, fontSize: 24, color: accent, letterSpacing: 1, flex: 1 }}>Admin Dashboard</div>
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ fontWeight: 700, color: accent, fontSize: 17 }}>
              {profile.full_name && profile.full_name.trim() ? profile.full_name : (profile.email || 'Admin')}
            </span>
            <span style={{ color: '#888', fontSize: 15 }}>{profile.email}</span>
          </div>
        )}
      </nav>
      {/* Layout below navbar */}
      <div style={{ display: "flex", paddingTop: 64 }}>
        <aside style={{
          width: 280,
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(10px)",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          boxShadow: `2px 0 24px ${accent}33`,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 18,
          height: 'calc(100vh - 64px)',
          minHeight: 600,
          borderRight: `2px solid ${accent}22`,
          position: 'fixed',
          top: 64,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}>
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #eee" }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
              Admin
            </span>
          </div>
          <nav style={{ flex: 1, overflowY: "auto", padding: "18px 0" }}>
            {sidebar.filter(item => item.tab !== 'logout').map((item, idx) => (
              <div
                key={item.tab}
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
                  marginBottom: 6,
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
          <div style={{ padding: 24, borderTop: "1px solid #eee", textAlign: "center", color: accent, fontWeight: 600, fontSize: 15 }}>
            <button onClick={() => setTab('logout')} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "12px 18px", border: "none", borderRadius: 12, background: tab === 'logout' ? accent : "#fdeaea", color: tab === 'logout' ? "#fff" : accent, fontWeight: 700, fontSize: 17, cursor: "pointer", transition: "background 0.18s, color 0.18s", boxShadow: tab === 'logout' ? `0 2px 12px ${accent}44` : undefined, width: '100%', justifyContent: 'center' }}>
              {sidebar.find(item => item.tab === 'logout')?.icon} Logout
            </button>
          </div>
        </aside>
        <main style={{ flex: 1, padding: "48px 5vw 32px 5vw", display: "flex", flexDirection: "column", gap: 32, minHeight: 'calc(100vh - 64px)', marginLeft: 280 }}>
          {authUsersError && <div style={{ color: 'red', margin: 16 }}>{authUsersError}</div>}
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 