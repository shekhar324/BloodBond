"use client";
import React, { useEffect, useState } from "react";
import { FaTachometerAlt, FaBoxes, FaBell, FaUserMd, FaCalendarCheck, FaChartBar, FaSignOutAlt, FaCog, FaUser, FaSearch, FaFileAlt, FaPlus } from "react-icons/fa";
import { supabase } from "../../../utils/supabaseClient";
import { useCurrentUser } from "../../../utils/useCurrentUser";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from 'react';

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

function SecurityDashboard() {
  const [tab, setTab] = React.useState('users');
  const accent = "#e53935";
  const tabs = [
    { key: 'users', label: 'User Management', icon: <FaUser /> },
    { key: '2fa', label: '2FA', icon: <FaCog /> },
    { key: 'audit', label: 'Audit Logs', icon: <FaFileAlt /> },
    { key: 'sessions', label: 'Sessions', icon: <FaBoxes /> },
    { key: 'password', label: 'Password Policy', icon: <FaCog /> },
    { key: 'alerts', label: 'Alerts', icon: <FaBell /> },
    { key: 'privacy', label: 'Data Privacy', icon: <FaUserMd /> },
    { key: 'devices', label: 'Devices', icon: <FaCalendarCheck /> },
  ];
  return (
    <div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? 'linear-gradient(90deg,#fbe9e7,#f7f8fa)' : '#fff',
              color: tab === t.key ? accent : '#444',
              border: tab === t.key ? `2px solid ${accent}` : '1.5px solid #eee',
              borderRadius: 12,
              padding: '10px 22px',
              fontWeight: 700,
              fontSize: 16,
              boxShadow: tab === t.key ? '0 4px 18px #e5393522' : undefined,
              display: 'flex', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        {tab === 'users' && <UserManagement />}
        {tab === '2fa' && <TwoFAManagement />}
        {tab === 'audit' && <AuditLogs />}
        {tab === 'sessions' && <SessionManagement />}
        {tab === 'password' && <PasswordPolicy />}
        {tab === 'alerts' && <SecurityAlerts />}
        {tab === 'privacy' && <DataPrivacyControls />}
        {tab === 'devices' && <DeviceManagement />}
        {tab !== 'users' && tab !== '2fa' && tab !== 'audit' && tab !== 'sessions' && tab !== 'password' && tab !== 'alerts' && tab !== 'privacy' && tab !== 'devices' && (
          <div style={{ background: '#fff8', borderRadius: 16, padding: 32, minHeight: 220, color: '#b71c1c', fontWeight: 500, fontSize: 18, textAlign: 'center', boxShadow: '0 2px 12px #e5393522' }}>
            <span style={{ fontSize: 22, color: accent }}>{tabs.find(t => t.key === tab)?.label}</span>
            <div style={{ marginTop: 12, color: '#888', fontSize: 16 }}>
              This feature is coming soon!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordPolicy() {
  const accent = "#e53935";
  const [policy, setPolicy] = React.useState({
    minLength: 8,
    requireUpper: true,
    requireLower: true,
    requireNumber: true,
    requireSpecial: false,
    expireDays: 90,
    history: 5,
  });
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, type, checked, value } = e.target;
    setPolicy(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Password Policy</div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e5393522', padding: 32, maxWidth: 480 }}>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Complexity Requirements</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <input type="number" name="minLength" min={6} max={32} value={policy.minLength} onChange={handleChange} style={{ marginRight: 8, width: 60 }} />
            Minimum Length
          </label>
          <label>
            <input type="checkbox" name="requireUpper" checked={policy.requireUpper} onChange={handleChange} style={{ marginRight: 8 }} />
            Require Uppercase Letter
          </label>
          <label>
            <input type="checkbox" name="requireLower" checked={policy.requireLower} onChange={handleChange} style={{ marginRight: 8 }} />
            Require Lowercase Letter
          </label>
          <label>
            <input type="checkbox" name="requireNumber" checked={policy.requireNumber} onChange={handleChange} style={{ marginRight: 8 }} />
            Require Number
          </label>
          <label>
            <input type="checkbox" name="requireSpecial" checked={policy.requireSpecial} onChange={handleChange} style={{ marginRight: 8 }} />
            Require Special Character
          </label>
        </div>
        <div style={{ margin: '24px 0 18px', fontWeight: 600, fontSize: 17 }}>Expiration & History</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <input type="number" name="expireDays" min={0} max={365} value={policy.expireDays} onChange={handleChange} style={{ marginRight: 8, width: 60 }} />
            Password Expires After (days, 0 = never)
          </label>
          <label>
            <input type="number" name="history" min={1} max={20} value={policy.history} onChange={handleChange} style={{ marginRight: 8, width: 60 }} />
            Password History (cannot reuse last N passwords)
          </label>
        </div>
        <div style={{ marginTop: 28, textAlign: 'right' }}>
          <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e5393522', transition: 'background 0.2s, transform 0.18s' }}>
            Save Policy
          </button>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  // Dummy user data for now
  const [users, setUsers] = React.useState([
    { id: 1, name: "Dr. A. Kumar", email: "a.kumar@hospital.com", role: "Admin", status: "Active" },
    { id: 2, name: "Ms. B. Singh", email: "b.singh@hospital.com", role: "Nurse", status: "Active" },
    { id: 3, name: "Mr. C. Patel", email: "c.patel@hospital.com", role: "Doctor", status: "Inactive" },
  ]);
  const [showModal, setShowModal] = React.useState(false);
  const [editUser, setEditUser] = React.useState(null);
  const accent = "#e53935";
  function openAdd() { setEditUser(null); setShowModal(true); }
  function openEdit(user: any) { setEditUser(user); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditUser(null); }
  function handleSave(user: any) {
    if (editUser) {
      setUsers(users.map(u => u.id === user.id ? user : u));
    } else {
      setUsers([...users, { ...user, id: users.length + 1 }]);
    }
    closeModal();
  }
  function handleDelete(id: number) {
    setUsers(users.filter(u => u.id !== id));
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: accent }}>Staff Users</div>
        <button onClick={openAdd} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e5393522', transition: 'background 0.2s, transform 0.18s' }}>+ Add User</button>
      </div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <button onClick={() => openEdit(user)} style={{ marginRight: 8, background: '#fbe9e7', color: accent, border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(user.id)} style={{ background: '#eee', color: '#b71c1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <UserModal user={editUser} onClose={closeModal} onSave={handleSave} accent={accent} />}
    </div>
  );
}

function UserModal({ user, onClose, onSave, accent }: { user: any, onClose: () => void, onSave: (user: any) => void, accent: string }) {
  const [form, setForm] = React.useState(user || { name: '', email: '', role: '', status: 'Active' });
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 32px #e5393533' }}>
        <h3 style={{ marginBottom: 18, color: accent }}>{user ? 'Edit User' : 'Add User'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input name="name" type="text" value={form.name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Role</label>
            <input name="role" type="text" value={form.role} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{ background: '#eee', color: accent, border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 700, cursor: 'pointer' }}>{user ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TwoFAManagement() {
  const accent = "#e53935";
  const [users, setUsers] = React.useState([
    { id: 1, name: "Dr. A. Kumar", email: "a.kumar@hospital.com", twofa: true },
    { id: 2, name: "Ms. B. Singh", email: "b.singh@hospital.com", twofa: false },
    { id: 3, name: "Mr. C. Patel", email: "c.patel@hospital.com", twofa: true },
  ]);
  function toggle2FA(id: number) {
    setUsers(users => users.map(u => u.id === id ? { ...u, twofa: !u.twofa } : u));
  }
  function forceReset(id: number) {
    alert('2FA reset link sent to user ID ' + id);
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Two-Factor Authentication (2FA)</div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Name</th>
              <th>Email</th>
              <th>2FA Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span style={{ color: user.twofa ? '#43a047' : '#b71c1c', fontWeight: 700, marginRight: 12 }}>
                    {user.twofa ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggle2FA(user.id)}
                    style={{ background: user.twofa ? '#fbe9e7' : '#eee', color: accent, border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {user.twofa ? 'Disable' : 'Enable'}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => forceReset(user.id)}
                    style={{ background: '#eee', color: '#b71c1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Force 2FA Reset
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditLogs() {
  const accent = "#e53935";
  const [logs] = React.useState([
    { id: 1, user: "Dr. A. Kumar", action: "Login", date: "2024-07-01 09:12", details: "Successful login from 192.168.1.10" },
    { id: 2, user: "Ms. B. Singh", action: "Password Change", date: "2024-07-01 10:05", details: "Password updated" },
    { id: 3, user: "Mr. C. Patel", action: "2FA Enabled", date: "2024-07-01 10:15", details: "2FA enabled via SMS" },
    { id: 4, user: "Dr. A. Kumar", action: "Access Patient Data", date: "2024-07-01 11:00", details: "Viewed patient record #12345" },
    { id: 5, user: "Ms. B. Singh", action: "Logout", date: "2024-07-01 12:00", details: "User logged out" },
  ]);
  const [search, setSearch] = React.useState("");
  const filtered = logs.filter(
    l => l.user.toLowerCase().includes(search.toLowerCase()) ||
         l.action.toLowerCase().includes(search.toLowerCase()) ||
         l.details.toLowerCase().includes(search.toLowerCase()) ||
         l.date.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Audit Logs</div>
      <input
        placeholder="Search logs..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 14, padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 15, width: 260 }}
      />
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>User</th>
              <th>Action</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{log.user}</td>
                <td>{log.action}</td>
                <td>{log.date}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 24, color: '#b71c1c', textAlign: 'center', fontWeight: 600 }}>No logs found.</div>
        )}
      </div>
    </div>
  );
}

function SessionManagement() {
  const accent = "#e53935";
  const [sessions, setSessions] = React.useState([
    { id: 1, user: "Dr. A. Kumar", device: "Chrome on Windows", location: "Delhi, IN", lastActive: "2024-07-01 09:15", ip: "192.168.1.10" },
    { id: 2, user: "Ms. B. Singh", device: "Safari on iPhone", location: "Mumbai, IN", lastActive: "2024-07-01 10:22", ip: "192.168.1.22" },
    { id: 3, user: "Mr. C. Patel", device: "Edge on Windows", location: "Bangalore, IN", lastActive: "2024-07-01 11:05", ip: "192.168.1.33" },
  ]);
  function forceLogout(id: number) {
    setSessions(sessions => sessions.filter(s => s.id !== id));
    alert('Session forcibly logged out.');
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Active Sessions</div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>User</th>
              <th>Device</th>
              <th>Location</th>
              <th>IP</th>
              <th>Last Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(session => (
              <tr key={session.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{session.user}</td>
                <td>{session.device}</td>
                <td>{session.location}</td>
                <td>{session.ip}</td>
                <td>{session.lastActive}</td>
                <td>
                  <button
                    onClick={() => forceLogout(session.id)}
                    style={{ background: '#eee', color: '#b71c1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Force Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sessions.length === 0 && (
          <div style={{ padding: 24, color: '#b71c1c', textAlign: 'center', fontWeight: 600 }}>No active sessions.</div>
        )}
      </div>
    </div>
  );
}

function SecurityAlerts() {
  const accent = "#e53935";
  const [alerts, setAlerts] = React.useState({
    failedLogin: true,
    privilegeChange: true,
    passwordChange: false,
    suspiciousActivity: true,
    notificationEmail: "admin@hospital.com",
    notificationSMS: "",
  });
  const [history] = React.useState([
    { id: 1, type: "Failed Login", date: "2024-07-01 09:20", channel: "Email", status: "Sent" },
    { id: 2, user: "Ms. B. Singh", action: "Privilege Change", date: "2024-07-01 10:30", channel: "SMS", status: "Sent" },
    { id: 3, user: "Mr. C. Patel", action: "Suspicious Activity", date: "2024-07-01 11:10", channel: "Email", status: "Sent" },
  ]);
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, type, checked, value } = e.target;
    setAlerts(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Security Alerts & Notifications</div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e5393522', padding: 32, maxWidth: 540, marginBottom: 32 }}>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Alert Types</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <label>
            <input type="checkbox" name="failedLogin" checked={alerts.failedLogin} onChange={handleChange} style={{ marginRight: 8 }} />
            Failed Login Attempt
          </label>
          <label>
            <input type="checkbox" name="privilegeChange" checked={alerts.privilegeChange} onChange={handleChange} style={{ marginRight: 8 }} />
            Privilege Change
          </label>
          <label>
            <input type="checkbox" name="passwordChange" checked={alerts.passwordChange} onChange={handleChange} style={{ marginRight: 8 }} />
            Password Change
          </label>
          <label>
            <input type="checkbox" name="suspiciousActivity" checked={alerts.suspiciousActivity} onChange={handleChange} style={{ marginRight: 8 }} />
            Suspicious Activity
          </label>
        </div>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Notification Channels</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            Email: <input type="email" name="notificationEmail" value={alerts.notificationEmail} onChange={handleChange} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #eee', width: 240 }} />
          </label>
          <label>
            SMS: <input type="text" name="notificationSMS" value={alerts.notificationSMS} onChange={handleChange} style={{ marginLeft: 8, padding: 6, borderRadius: 6, border: '1px solid #eee', width: 180 }} placeholder="+91..." />
          </label>
        </div>
        <div style={{ marginTop: 28, textAlign: 'right' }}>
          <button style={{ background: accent, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e5393522', transition: 'background 0.2s, transform 0.18s' }}>
            Save Alerts
          </button>
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 17, color: accent, marginBottom: 12 }}>Alert History</div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
              <th>Date</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map(alert => (
              <tr key={alert.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{alert.type}</td>
                <td>{alert.date}</td>
                <td>{alert.channel}</td>
                <td>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div style={{ padding: 24, color: '#b71c1c', textAlign: 'center', fontWeight: 600 }}>No alert history.</div>
        )}
      </div>
    </div>
  );
}

function DataPrivacyControls() {
  const accent = "#e53935";
  const [access, setAccess] = React.useState({
    patientData: true,
    donorData: true,
    staffData: false,
  });
  const [requests, setRequests] = React.useState([
    { id: 1, user: "Ms. B. Singh", type: "Patient Data", status: "Pending" },
    { id: 2, user: "Mr. C. Patel", type: "Donor Data", status: "Pending" },
  ]);
  const [audit] = React.useState([
    { id: 1, user: "Dr. A. Kumar", action: "Viewed Patient Data", date: "2024-07-01 09:30" },
    { id: 2, user: "Ms. B. Singh", action: "Requested Donor Data", date: "2024-07-01 10:10" },
    { id: 3, user: "Mr. C. Patel", action: "Access Denied: Staff Data", date: "2024-07-01 11:00" },
  ]);
  function toggleAccess(type: string) {
    setAccess(prev => ({ ...prev, [type]: !prev[type as keyof typeof prev] }));
  }
  function approveRequest(id: number) {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: "Approved" } : r));
  }
  function denyRequest(id: number) {
    setRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: "Denied" } : r));
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Data Privacy Controls</div>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e5393522', padding: 32, maxWidth: 540, marginBottom: 32 }}>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Sensitive Data Access</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <label>
            <input type="checkbox" checked={access.patientData} onChange={() => toggleAccess('patientData')} style={{ marginRight: 8 }} />
            Patient Data
          </label>
          <label>
            <input type="checkbox" checked={access.donorData} onChange={() => toggleAccess('donorData')} style={{ marginRight: 8 }} />
            Donor Data
          </label>
          <label>
            <input type="checkbox" checked={access.staffData} onChange={() => toggleAccess('staffData')} style={{ marginRight: 8 }} />
            Staff Data
          </label>
        </div>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17 }}>Access Requests</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.length === 0 && <div style={{ color: '#888', fontWeight: 500 }}>No pending requests.</div>}
          {requests.map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fbe9e7', borderRadius: 8, padding: '10px 18px', marginBottom: 6 }}>
              <span style={{ fontWeight: 600 }}>{r.user}</span>
              <span style={{ color: accent }}>{r.type}</span>
              <span style={{ color: r.status === 'Pending' ? '#b71c1c' : '#43a047', fontWeight: 600 }}>{r.status}</span>
              {r.status === 'Pending' && <>
                <button onClick={() => approveRequest(r.id)} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                <button onClick={() => denyRequest(r.id)} style={{ background: '#b71c1c', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Deny</button>
              </>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontWeight: 600, fontSize: 17, color: accent, marginBottom: 12 }}>Audit Trail</div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>User</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {audit.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{a.user}</td>
                <td>{a.action}</td>
                <td>{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {audit.length === 0 && (
          <div style={{ padding: 24, color: '#b71c1c', textAlign: 'center', fontWeight: 600 }}>No audit trail.</div>
        )}
      </div>
    </div>
  );
}

function DeviceManagement() {
  const accent = "#e53935";
  const [devices, setDevices] = React.useState([
    { id: 1, user: "Dr. A. Kumar", device: "Dell XPS 13 (Chrome)", lastUsed: "2024-07-01 09:15", status: "Trusted" },
    { id: 2, user: "Ms. B. Singh", device: "iPhone 13 (Safari)", lastUsed: "2024-07-01 10:22", status: "Trusted" },
    { id: 3, user: "Mr. C. Patel", device: "HP EliteBook (Edge)", lastUsed: "2024-07-01 11:05", status: "Revoked" },
  ]);
  function revokeDevice(id: number) {
    setDevices(devices => devices.map(d => d.id === id ? { ...d, status: "Revoked" } : d));
  }
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 22, color: accent, marginBottom: 18 }}>Device Management</div>
      <div style={{ overflowX: 'auto', borderRadius: 14, boxShadow: '0 2px 12px #e5393522', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
          <thead>
            <tr style={{ background: '#fbe9e7' }}>
              <th style={{ padding: 12, textAlign: 'left' }}>User</th>
              <th>Device</th>
              <th>Last Used</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 12 }}>{device.user}</td>
                <td>{device.device}</td>
                <td>{device.lastUsed}</td>
                <td>
                  <span style={{ color: device.status === 'Trusted' ? '#43a047' : '#b71c1c', fontWeight: 700 }}>{device.status}</span>
                </td>
                <td>
                  {device.status === 'Trusted' && (
                    <button
                      onClick={() => revokeDevice(device.id)}
                      style={{ background: '#eee', color: '#b71c1c', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Revoke Access
                    </button>
                  )}
                  {device.status === 'Revoked' && (
                    <span style={{ color: '#b71c1c', fontWeight: 600 }}>Revoked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {devices.length === 0 && (
          <div style={{ padding: 24, color: '#b71c1c', textAlign: 'center', fontWeight: 600 }}>No registered devices.</div>
        )}
      </div>
    </div>
  );
}

export default function HospitalStaffDashboard() {
  // Real-time state
  const [inventory, setInventory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({ units: 0, requests: 0, donors: 0, fulfilled: 0 });
  const [hovered, setHovered] = useState(-1);
  const [tab, setTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [donors, setDonors] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ item_name: '', item_type: '', quantity: '', location: '', expiry_date: '' });

  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; email: string; role: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (user && user.id) {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("fullName, email, role")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({ name: data.fullName, email: data.email, role: data.role });
          console.log('[DEBUG] Fetched profile:', data);
        } else {
          setProfile(null);
          console.log('[DEBUG] No profile found for user:', user.id);
        }
        setProfileLoading(false);
      } else {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      console.log('[DEBUG] Profile in state:', profile);
      console.log('[DEBUG] Profile role:', profile.role);
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
    // If user is logged in but not hospital_staff, redirect
    if (!profileLoading && profile && profile.role !== "hospital_staff") {
      router.replace("/login");
    }
  }, [user, loading, profile, profileLoading, router]);

  if (loading || profileLoading || !profile) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#e53935' }}>Loading...</div>;
  }

  // Logout effect (fixes hook error)
  useEffect(() => {
    if (tab === "logout") {
      async function doLogout() {
        await supabase.auth.signOut();
        router.replace("/");
      }
      doLogout();
    }
  }, [tab, router]);

  // Fetch and subscribe to real-time inventory and requests
  useEffect(() => {
    async function fetchData() {
      const { data: inv } = await supabase.from("inventory").select("*");
      setInventory(inv || []);
      const { data: req } = await supabase.from("requests").select("*");
      setRequests(req || []);
      // Donors
      const { data: donorsData } = await supabase.from("donors").select("*");
      setDonors(donorsData || []);
      // Receivers
      const { data: receiversData } = await supabase.from("receivers").select("*");
      setReceivers(receiversData || []);
      // Appointments
      const { data: apptsData, error: apptsError } = await supabase.from("appointments").select("*");
      if (apptsError) {
        console.error('Error fetching appointments:', apptsError.message);
      } else {
        console.log('Fetched appointments:', apptsData);
      }
      setAppointments(apptsData || []);
      // Example stats (replace with real queries)
      setStats({ units: inv?.length || 0, requests: req?.length || 0, donors: donorsData?.length || 0, fulfilled: 8 });
    }
    fetchData();
    // Real-time subscriptions
    const invSub = supabase
      .channel('custom-inventory-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, payload => {
        setInventory(inv => {
          if (payload.eventType === 'INSERT') return [...inv, payload.new];
          if (payload.eventType === 'UPDATE') return inv.map(i => i.id === payload.new.id ? payload.new : i);
          if (payload.eventType === 'DELETE') return inv.filter(i => i.id !== payload.old.id);
          return inv;
        });
      })
      .subscribe();
    const reqSub = supabase
      .channel('custom-requests-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, payload => {
        setRequests(req => {
          if (payload.eventType === 'INSERT') return [...req, payload.new];
          if (payload.eventType === 'UPDATE') return req.map(r => r.id === payload.new.id ? payload.new : r);
          if (payload.eventType === 'DELETE') return req.filter(r => r.id !== payload.old.id);
          return req;
        });
      })
      .subscribe();
    const donorsSub = supabase
      .channel('custom-donors-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, payload => {
        setDonors(donors => {
          if (payload.eventType === 'INSERT') return [...donors, payload.new];
          if (payload.eventType === 'UPDATE') return donors.map(d => d.id === payload.new.id ? payload.new : d);
          if (payload.eventType === 'DELETE') return donors.filter(d => d.id !== payload.old.id);
          return donors;
        });
      })
      .subscribe();
    const receiversSub = supabase
      .channel('custom-receivers-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receivers' }, payload => {
        setReceivers(receivers => {
          if (payload.eventType === 'INSERT') return [...receivers, payload.new];
          if (payload.eventType === 'UPDATE') return receivers.map(r => r.id === payload.new.id ? payload.new : r);
          if (payload.eventType === 'DELETE') return receivers.filter(r => r.id !== payload.old.id);
          return receivers;
        });
      })
      .subscribe();
    const apptsSub = supabase
      .channel('custom-appointments-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, payload => {
        setAppointments(appts => {
          if (payload.eventType === 'INSERT') return [...appts, payload.new];
          if (payload.eventType === 'UPDATE') return appts.map(a => a.id === payload.new.id ? payload.new : a);
          if (payload.eventType === 'DELETE') return appts.filter(a => a.id !== payload.old.id);
          return appts;
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(invSub);
      supabase.removeChannel(reqSub);
      supabase.removeChannel(donorsSub);
      supabase.removeChannel(receiversSub);
      supabase.removeChannel(apptsSub);
    };
  }, []);

  async function handleAddInventory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await supabase.from("inventory").insert([{ ...addForm }]);
    setShowAddModal(false);
    setAddForm({ item_name: '', item_type: '', quantity: '', location: '', expiry_date: '' });
    // Refresh inventory
    const { data: inv } = await supabase.from("inventory").select("*");
    setInventory(inv || []);
  }

  // Sidebar navigation
  const sidebar = [
    { icon: <FaTachometerAlt />, label: "Dashboard", tab: "dashboard" },
    { icon: <FaBoxes />, label: "Inventory", tab: "inventory" },
    { icon: <FaUserMd />, label: "Donors", tab: "donors" },
    { icon: <FaUser />, label: "Receivers", tab: "receivers" },
    { icon: <FaBell />, label: "Requests", tab: "requests" },
    { icon: <FaCalendarCheck />, label: "Appointments", tab: "appointments" },
    { icon: <FaChartBar />, label: "Insights", tab: "insights" },
    { icon: <FaCalendarCheck />, label: "Smart Scheduling", tab: "smart-scheduling" },
    { icon: <FaCog />, label: "Security", tab: "security" },
    { icon: <FaChartBar />, label: "Integrations", tab: "integrations" },
    { icon: <FaUserMd />, label: "UX & Accessibility", tab: "ux-accessibility" },
    { icon: <FaBell />, label: "Emergency", tab: "emergency" },
    { icon: <FaBoxes />, label: "Automation/API", tab: "automation-api" },
    { icon: <FaChartBar />, label: "Reports", tab: "reports" },
    { icon: <FaCog />, label: "Settings", tab: "settings" },
    { icon: <FaSignOutAlt />, label: "Logout", tab: "logout" },
  ];

  // Dummy data for users and appointments
  const users = [
    { id: 1, name: "Dr. A. Kumar", type: "Donor", last: "2024-05-01" },
    { id: 2, name: "Ms. B. Singh", type: "Receiver", last: "2024-05-03" },
  ];

  // Main content by tab
  function renderContent() {
    switch (tab) {
      case "dashboard":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28, marginBottom: 32 }}>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588` }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Total Units</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.units}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588` }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Requests</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.requests}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588` }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Donors</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.donors}</div></div>
            <div style={{ ...cardStyle, border: `2.5px solid #e5393588` }}><div style={{ color: accent, fontWeight: 700, fontSize: 18 }}>Fulfilled</div><div style={{ fontSize: 28, fontWeight: 800 }}>{stats.fulfilled}</div></div>
          </div>
        );
      case "inventory":
        return (
          <>
            <div style={{ ...cardStyle }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ color: accent, fontWeight: 700, fontSize: 22, display: "flex", alignItems: "center", gap: 10 }}><FaBoxes /> Blood Inventory</div>
                <button onClick={() => setShowAddModal(true)} style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 2px 8px #e5393522", transition: "background 0.2s, transform 0.18s" }}><FaPlus style={{ marginRight: 6 }} />Add Inventory</button>
              </div>
              {/* Advanced analytics and warnings */}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 18 }}>
                <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                  <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Total Items</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{inventory.length}</div>
                </div>
                <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                  <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Expiring Soon</div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{inventory.filter(i => i.expiry_date && new Date(i.expiry_date) < new Date(Date.now() + 7*24*60*60*1000)).length}</div>
                </div>
              </div>
              <input placeholder="Search by item name, type, or location..." value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom: 14, padding: 8, borderRadius: 8, border: "1px solid #eee", fontSize: 15, width: 220 }} />
              <div style={{ overflowX: "auto" }}>
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
            </div>
            {/* Add Inventory Modal OUTSIDE the card */}
            {showAddModal && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 4px 32px #e5393533" }}>
                  <h3 style={{ marginBottom: 18, color: accent }}>Add Inventory</h3>
                  <form onSubmit={handleAddInventory}>
                    <div style={{ marginBottom: 12 }}>
                      <label>Item Name</label>
                      <input type="text" value={addForm.item_name} onChange={e => setAddForm(f => ({ ...f, item_name: e.target.value }))} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Item Type</label>
                      <input type="text" value={addForm.item_type} onChange={e => setAddForm(f => ({ ...f, item_type: e.target.value }))} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Quantity</label>
                      <input type="number" value={addForm.quantity} onChange={e => setAddForm(f => ({ ...f, quantity: e.target.value }))} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label>Location</label>
                      <input type="text" value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ marginBottom: 18 }}>
                      <label>Expiry Date</label>
                      <input type="date" value={addForm.expiry_date} onChange={e => setAddForm(f => ({ ...f, expiry_date: e.target.value }))} required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                      <button type="button" onClick={() => setShowAddModal(false)} style={{ background: "#eee", color: accent, border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button type="submit" style={{ background: accent, color: "#fff", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 700, cursor: "pointer" }}>Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        );
      case "requests":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaBell /> Blood Requests</div>
            {/* Advanced stats and quick actions */}
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
            <div style={{ overflowX: "auto" }}>
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
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaUserMd /> Donors</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Manage donors, view their details, and update their information.</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Blood Group</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.filter(d => !search || [d.full_name, d.mobile, d.email, d.blood_group].some(f => f?.toLowerCase().includes(search.toLowerCase()))).map(d => (
                    <tr key={d.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{d.full_name}</td>
                      <td>{d.mobile}</td>
                      <td>{d.email}</td>
                      <td>{d.blood_group}</td>
                      <td>{d.last_activity || '-'} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "receivers":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaUser /> Receivers</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Manage receivers, view their details, and update their information.</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "#fbe9e7" }}>
                    <th style={{ padding: 8, textAlign: "left" }}>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Blood Group</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {receivers.filter(r => !search || [r.full_name, r.mobile, r.email, r.blood_group].some(f => f?.toLowerCase().includes(search.toLowerCase()))).map(r => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: 8 }}>{r.full_name}</td>
                      <td>{r.mobile}</td>
                      <td>{r.email}</td>
                      <td>{r.blood_group}</td>
                      <td>{r.last_activity || '-'} </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "appointments":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaCalendarCheck /> Appointments</div>
            <div style={{ overflowX: "auto" }}>
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
      case "smart-scheduling":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaCalendarCheck /> Smart Scheduling & Appointments</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>AI-powered suggestions and conflict detection for appointments. (Coming soon: calendar view, drag-and-drop!)</div>
            <div style={{ overflowX: "auto" }}>
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
                      <td>{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "collaboration":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaUser /> Collaboration & Communication</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Share notes, tag staff, and coordinate in real time. (Live chat, mentions, and file sharing coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Collaboration features are coming soon!
            </div>
          </div>
        );
      case "security":
        // Modern Security Dashboard with Tabs
        return (
          <div style={{ ...cardStyle, minHeight: 600 }}>
            <div style={{ color: accent, fontWeight: 800, fontSize: 28, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
              <FaCog /> Security & Access Management
            </div>
            <SecurityDashboard />
          </div>
        );
      case "integrations":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaChartBar /> Integrations & External Services</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Connect with hospital systems, government APIs, and third-party tools. (Integration setup and logs coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Integration features are coming soon!
            </div>
          </div>
        );
      case "ux-accessibility":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaUserMd /> UX Enhancements & Accessibility</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Personalize your dashboard, enable accessibility features, and adjust preferences. (Dark mode, font size, and more coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              UX and accessibility features are coming soon!
            </div>
          </div>
        );
      case "emergency":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaBell /> Emergency Management</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Handle urgent situations, send alerts, and manage crisis protocols. (SOS, broadcast, and escalation coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Emergency management features are coming soon!
            </div>
          </div>
        );
      case "automation-api":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaBoxes /> Automation & API</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Automate workflows, set up triggers, and access API keys. (Webhooks, custom scripts, and API docs coming soon!)</div>
            <div style={{ background: "#fff8", borderRadius: 12, padding: 18, minHeight: 80, color: "#b71c1c", fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Automation and API features are coming soon!
            </div>
          </div>
        );
      case "insights":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 22, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaChartBar /> Donor & Receiver Insights</div>
            <div style={{ color: "#888", fontSize: 15, marginBottom: 18 }}>Key stats and trends for donors and receivers. (More analytics coming soon!)</div>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Total Donors</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{donors.length}</div>
              </div>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Total Receivers</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{receivers.length}</div>
              </div>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Recent Donors</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{donors.slice(-3).map(d => d.fullName).join(", ") || '-'}</div>
              </div>
              <div style={{ ...cardStyle, minWidth: 220, flex: 1, background: "rgba(255,255,255,0.75)", border: `2px solid ${accent}33` }}>
                <div style={{ fontWeight: 600, color: accent, marginBottom: 6 }}>Recent Receivers</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{receivers.slice(-3).map(r => r.fullName).join(", ") || '-'}</div>
              </div>
            </div>
          </div>
        );
      case "reports":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaChartBar /> Reports & Analytics</div>
            <div style={{ color: "#888", fontSize: 15 }}>Charts and downloadable reports coming soon.</div>
          </div>
        );
      case "settings":
        return (
          <div style={{ ...cardStyle }}>
            <div style={{ color: accent, fontWeight: 700, fontSize: 20, marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}><FaCog /> Settings</div>
            <div style={{ color: "#888", fontSize: 15 }}>Profile and notification settings coming soon.</div>
          </div>
        );
      case "logout":
        return null;
      default:
        return null;
    }
  }

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
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 70px)" }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 270,
            background: "#fff",
            boxShadow: "2px 0 16px #e5393522",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 70,
            left: 0,
            bottom: 0,
            zIndex: 100,
          }}
        >
          <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #eee" }}>
            <span style={{ color: accent, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>
              <i className="fas fa-tint" style={{ marginRight: 8 }}></i>Hospital Staff
            </span>
          </div>
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
            {profile?.name || "Hospital Staff"}
            <div style={{ fontWeight: 400, color: "#888", fontSize: 13 }}>{profile?.email || "staff@hospital.com"}</div>
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
    </div>
  );
} 