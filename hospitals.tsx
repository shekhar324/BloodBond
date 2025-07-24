"use client";
import React, { useState } from "react";
import { FaHospital, FaSearch, FaCalendarAlt, FaHeartbeat, FaStar, FaHistory, FaMapMarkerAlt, FaUserMd, FaRegCalendarCheck, FaComments, FaPlus, FaArrowRight } from "react-icons/fa";

const TABS = [
  { key: "find", label: "Find Hospitals", icon: <FaSearch /> },
  { key: "details", label: "Hospital Details", icon: <FaHospital /> },
  { key: "book", label: "Book Appointment", icon: <FaRegCalendarCheck /> },
  { key: "requests", label: "Hospital Requests", icon: <FaHeartbeat /> },
  { key: "events", label: "Events & Drives", icon: <FaCalendarAlt /> },
  { key: "ratings", label: "Ratings & Feedback", icon: <FaStar /> },
  { key: "visits", label: "My Hospital Visits", icon: <FaHistory /> },
];

// Mock data for demo (replace with Supabase real-time hooks)
const MOCK_HOSPITALS = [
  { id: 1, name: "City Hospital", location: "Delhi", blood_groups: ["A+", "O-", "B+"], rating: 4.7, events: 2, requests: 1 },
  { id: 2, name: "Metro Care", location: "Noida", blood_groups: ["O+", "AB-"], rating: 4.5, events: 1, requests: 0 },
  { id: 3, name: "Sunrise Clinic", location: "Gurgaon", blood_groups: ["B-", "A-", "AB+"], rating: 4.9, events: 0, requests: 2 },
];
const MOCK_EVENTS = [
  { id: 1, hospital: "City Hospital", date: "2024-07-15", title: "Mega Blood Drive" },
  { id: 2, hospital: "Metro Care", date: "2024-07-20", title: "World Blood Donor Day" },
];
const MOCK_REQUESTS = [
  { id: 1, hospital: "Sunrise Clinic", blood_group: "A+", units: 2, urgent: true, status: "pending" },
  { id: 2, hospital: "City Hospital", blood_group: "O-", units: 1, urgent: false, status: "fulfilled" },
];
const MOCK_VISITS = [
  { id: 1, hospital: "City Hospital", date: "2024-06-10", type: "Donation" },
  { id: 2, hospital: "Metro Care", date: "2024-05-22", type: "Transfusion" },
];
const MOCK_FEEDBACK = [
  { id: 1, hospital: "City Hospital", user: "Rohit Kumar", rating: 5, comment: "Great staff!" },
  { id: 2, hospital: "Metro Care", user: "Priya Singh", rating: 4, comment: "Very clean and organized." },
];

export default function HospitalsPage() {
  const [tab, setTab] = useState("find");
  const [search, setSearch] = useState("");
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 0 0", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#e53935", marginBottom: 32, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 14 }}><FaHospital /> Hospitals</h1>
      {/* Tabs */}
      <nav style={{ display: 'flex', gap: 10, marginBottom: 28, borderBottom: '1.5px solid #eee' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: tab === t.key ? '#e53935' : '#f7fafd',
              border: tab === t.key ? '1.5px solid #e53935' : '1.5px solid #eee',
              fontWeight: 600,
              fontSize: 14,
              color: tab === t.key ? '#fff' : '#e53935',
              padding: '7px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              borderRadius: 8,
              marginBottom: tab === t.key ? '-2px' : '0',
              transition: 'all 0.16s cubic-bezier(.4,0,.2,1)',
              outline: tab === t.key ? '2px solid #e5393533' : 'none',
              boxShadow: 'none',
              position: 'relative',
              minHeight: 34,
            }}
            onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.background = '#fdeaea'; }}
            onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.background = '#f7fafd'; }}
          >
            <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{t.icon}</span>
            <span style={{ fontSize: 14 }}>{t.label}</span>
          </button>
        ))}
      </nav>
      {/* Tab Content */}
      <section style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: 32, minHeight: 400, animation: 'fadeIn 0.5s' }}>
        {tab === "find" && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <input type="text" placeholder="Search hospitals..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, padding: '0.8rem' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
              {MOCK_HOSPITALS.filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase())).map(h => (
                <div key={h.id} style={{ background: '#f7fafd', borderRadius: 14, padding: 24, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer', border: selectedHospital?.id === h.id ? '2px solid #e53935' : '2px solid transparent', transition: 'border 0.18s' }} onClick={() => { setSelectedHospital(h); setTab('details'); }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 6 }}>{h.name}</div>
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}><FaMapMarkerAlt style={{ marginRight: 6 }} />{h.location}</div>
                  <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Available: {h.blood_groups.join(", ")}</div>
                  <div style={{ color: '#fbc02d', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><FaStar /> {h.rating}</div>
                  <div style={{ color: '#e53935', fontWeight: 600, fontSize: 14, marginTop: 8 }}>{h.requests} urgent requests</div>
                  <div style={{ color: '#43a047', fontWeight: 600, fontSize: 14 }}>{h.events} upcoming events</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "details" && selectedHospital && (
          <div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 26, color: '#e53935', marginBottom: 8 }}>{selectedHospital.name}</div>
                <div style={{ color: '#888', fontSize: 16, marginBottom: 8 }}><FaMapMarkerAlt style={{ marginRight: 6 }} />{selectedHospital.location}</div>
                <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Available Blood: {selectedHospital.blood_groups.join(", ")}</div>
                <div style={{ color: '#fbc02d', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}><FaStar /> {selectedHospital.rating}</div>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Contact: +91-1234567890</div>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Email: info@{selectedHospital.name.toLowerCase().replace(/ /g,"")}.com</div>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 8 }}>Donation Hours: 9am - 6pm</div>
                <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 10 }} onClick={() => setTab('book')}>Book Appointment <FaArrowRight style={{ marginLeft: 8 }} /></button>
              </div>
              <div style={{ minWidth: 220, background: '#f7fafd', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #e5393533', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#e53935', marginBottom: 8 }}>On the Map</div>
                <div style={{ width: '100%', height: 120, background: '#eee', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>[Map]</div>
                <div style={{ color: '#888', fontSize: 14 }}>123 Main St, {selectedHospital.location}</div>
              </div>
            </div>
          </div>
        )}
        {tab === "book" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 18 }}>Book Appointment at {selectedHospital?.name || "Hospital"}</div>
            <form style={{ maxWidth: 400 }} onSubmit={e => { e.preventDefault(); alert('Appointment booked!'); }}>
              <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Select Date</label>
              <input type="date" required style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 14 }} title="Select appointment date" placeholder="YYYY-MM-DD" aria-label="Select appointment date" />
              <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Time Slot</label>
              <select required style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 14 }} title="Select time slot" aria-label="Select time slot">
                <option value="">Select</option>
                <option>9:00 AM - 10:00 AM</option>
                <option>10:00 AM - 11:00 AM</option>
                <option>11:00 AM - 12:00 PM</option>
                <option>2:00 PM - 3:00 PM</option>
                <option>3:00 PM - 4:00 PM</option>
              </select>
              <button type="submit" style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, width: '100%', cursor: 'pointer', transition: 'background 0.18s' }}>Book Now</button>
            </form>
          </div>
        )}
        {tab === "requests" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 18 }}>Urgent Blood Requests from Hospitals</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              {MOCK_REQUESTS.map(r => (
                <div key={r.id} style={{ background: '#fffde7', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: '#e53935', fontSize: 17 }}>{r.hospital}</div>
                  <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 15 }}>Blood Group: {r.blood_group}</div>
                  <div style={{ color: '#888', fontSize: 15 }}>Units Needed: {r.units}</div>
                  <div style={{ color: r.urgent ? '#e53935' : '#43a047', fontWeight: 600, fontSize: 15 }}>{r.urgent ? 'URGENT' : 'Normal'}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>Status: {r.status}</div>
                  <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700, fontSize: 15, marginTop: 8, cursor: 'pointer' }}>Respond</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "events" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 18 }}>Upcoming Hospital Events & Blood Drives</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              {MOCK_EVENTS.map(e => (
                <div key={e.id} style={{ background: '#e3f2fd', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #1976d230', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 17 }}>{e.title}</div>
                  <div style={{ color: '#888', fontSize: 15 }}>{e.hospital}</div>
                  <div style={{ color: '#e53935', fontWeight: 600, fontSize: 15 }}><FaCalendarAlt style={{ marginRight: 6 }} />{e.date}</div>
                  <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700, fontSize: 15, marginTop: 8, cursor: 'pointer' }}>Register</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "ratings" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 18 }}>Hospital Ratings & Feedback</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              {MOCK_FEEDBACK.map(f => (
                <div key={f.id} style={{ background: '#fffde7', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #fbc02d33', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: '#e53935', fontSize: 17 }}>{f.hospital}</div>
                  <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 15 }}><FaUserMd style={{ marginRight: 6 }} />{f.user}</div>
                  <div style={{ color: '#fbc02d', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><FaStar /> {f.rating}</div>
                  <div style={{ color: '#888', fontSize: 15 }}>{f.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "visits" && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#e53935', marginBottom: 18 }}>My Hospital Visits</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              {MOCK_VISITS.map(v => (
                <div key={v.id} style={{ background: '#f7fafd', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: '#e53935', fontSize: 17 }}>{v.hospital}</div>
                  <div style={{ color: '#888', fontSize: 15 }}><FaCalendarAlt style={{ marginRight: 6 }} />{v.date}</div>
                  <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 15 }}>{v.type}</div>
                  <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700, fontSize: 15, marginTop: 8, cursor: 'pointer' }}>Download Certificate</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
} 