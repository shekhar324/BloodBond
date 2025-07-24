"use client";
import React, { useState, useEffect } from "react";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaDownload, FaPrint, FaStar, FaHistory, FaTrophy, FaUser, FaMap, FaFileCsv, FaFilePdf, FaHeartbeat, FaBolt, FaGift, FaMedal, FaTint } from "react-icons/fa";
import { supabase } from "../../../utils/supabaseClient";
import { useCurrentUser } from "../../../utils/useCurrentUser";

const TABS = [
  { key: "all", label: "All History" },
  { key: "donations", label: "Donations" },
  { key: "requests", label: "Requests" },
  { key: "appointments", label: "Appointments" },
  { key: "feedback", label: "Feedback" },
  { key: "map", label: "Map View" },
];

export default function HistoryPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ status: "", org: "", date: "" });
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalDonations: 0, totalRequests: 0, totalUnits: 0, livesImpacted: 0, streak: 0, nextEligible: "-", milestones: [] });
  const { user, loading } = useCurrentUser();

  // Fetch all history data for the user
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    async function fetchAll() {
      // Donations (for donors)
      const { data: donations = [] } = await supabase.from("donations").select("*", { count: "exact" }).eq("donor_id", user.id).order("date", { ascending: false });
      // Requests (for receivers)
      const { data: requests = [] } = await supabase.from("requests").select("*", { count: "exact" }).or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`).order("created_at", { ascending: false });
      // Appointments
      const { data: appointments = [] } = await supabase.from("appointments").select("*", { count: "exact" }).or(`donor_id.eq.${user.id},receiver_id.eq.${user.id},user_id.eq.${user.id}`).order("date", { ascending: false });
      // Feedback (if available)
      const { data: feedbackData = [] } = await supabase.from("feedback").select("*").or("user_id.eq." + user.id + ",donor_id.eq." + user.id + ",receiver_id.eq." + user.id).order("created_at", { ascending: false });

      // Defensive: ensure arrays are not null
      const safeDonations = donations || [];
      const safeRequests = requests || [];
      const safeAppointments = appointments || [];
      const safeFeedback = feedbackData || [];

      // Merge all into a single history array
      let allHistory = [
        ...safeDonations.map(d => ({ ...d, type: "donation", date: d.date, org: d.location || d.org || "-", blood_group: d.blood_group, units: d.units, status: d.status || "fulfilled", cert: true, feedback: true })),
        ...safeRequests.map(r => ({ ...r, type: "request", date: r.created_at, org: r.location || r.org || "-", blood_group: r.blood_group, units: r.units, status: r.status, urgent: r.urgent })),
        ...safeAppointments.map(a => ({ ...a, type: "appointment", date: a.date, org: a.location || a.centre || "-", status: a.status })),
      ];
      allHistory = allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      if (isMounted) {
        setHistory(allHistory);
        setFeedback(safeFeedback);
        // Stats
        setStats({
          totalDonations: safeDonations.length,
          totalRequests: safeRequests.length,
          totalUnits: safeDonations.reduce((sum, d) => sum + (d.units || 0), 0),
          livesImpacted: safeDonations.reduce((sum, d) => sum + ((d.units || 0) * 2), 0),
          streak: 0, // Calculate streak logic if needed
          nextEligible: safeDonations[0]?.date ? new Date(new Date(safeDonations[0].date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : "-",
          milestones: [],
        });
      }
    }
    fetchAll();
    // Real-time subscriptions
    const donationsChannel = supabase.channel('donations-changes-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchAll)
      .subscribe();
    const requestsChannel = supabase.channel('requests-changes-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchAll)
      .subscribe();
    const appointmentsChannel = supabase.channel('appointments-changes-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, fetchAll)
      .subscribe();
    return () => {
      isMounted = false;
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [user?.id]);

  // Filtered history
  const filtered = history.filter(h =>
    (!search || (h.location && h.location.toLowerCase().includes(search.toLowerCase())) || (h.blood_group && h.blood_group.toLowerCase().includes(search.toLowerCase()))) &&
    (!filter.status || h.status === filter.status) &&
    (!filter.org || h.org === filter.org) &&
    (!filter.date || h.date === filter.date)
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0 0 0", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#e53935", marginBottom: 32, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 14 }}><FaHistory /> History</h1>
      {/* Stats & Milestones */}
      <section style={{ display: 'flex', gap: 24, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaGift style={{ color: '#e53935', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>{stats.totalDonations} Donations</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaHeartbeat style={{ color: '#e53935', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>{stats.totalRequests} Requests</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaTint style={{ color: '#e53935', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>{stats.totalUnits} Units</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaBolt style={{ color: '#43a047', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>{stats.livesImpacted} Lives Impacted</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaMedal style={{ color: '#fbc02d', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>Streak: {stats.streak}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 18, minWidth: 160, flex: 1, boxShadow: '0 2px 8px #e5393533', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <FaCalendarAlt style={{ color: '#1976d2', fontSize: 22 }} />
          <div style={{ fontWeight: 700, fontSize: 18 }}>Next Eligible: {stats.nextEligible}</div>
        </div>
      </section>
      {/* Tabs */}
      <nav style={{ display: 'flex', gap: 10, marginBottom: 24, borderBottom: '1.5px solid #eee' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setShowMap(t.key === 'map'); }}
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
            <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{t.key === 'all' ? <FaHistory /> : t.key === 'donations' ? <FaGift /> : t.key === 'requests' ? <FaHeartbeat /> : t.key === 'appointments' ? <FaCalendarAlt /> : t.key === 'feedback' ? <FaStar /> : t.key === 'map' ? <FaMap /> : null}</span>
            <span style={{ fontSize: 14 }}>{t.label}</span>
          </button>
        ))}
      </nav>
      {/* Filters & Export */}
      <section style={{ display: 'flex', gap: 14, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search by location or blood group..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', minWidth: 180 }} />
        <select value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} style={{ borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem' }} title="Filter by status">
          <option value="">All Status</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
        </select>
        <select value={filter.org} onChange={e => setFilter(f => ({ ...f, org: e.target.value }))} style={{ borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem' }} title="Filter by organization">
          <option value="">All Orgs</option>
          <option value="Hospital">Hospital</option>
          <option value="Blood Bank">Blood Bank</option>
          <option value="Camp">Camp</option>
        </select>
        <input type="date" value={filter.date} onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} style={{ borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem' }} title="Filter by date" />
        <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaFileCsv /> Export CSV</button>
        <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><FaFilePdf /> Export PDF</button>
      </section>
      {/* History List or Map */}
      {!showMap ? (
        <section style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #e5393533', padding: 24, marginBottom: 32 }}>
          {filtered.length === 0 ? (
            <div style={{ color: '#888', fontSize: 16, textAlign: 'center', padding: 32 }}>No history found.</div>
          ) : filtered.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 18, borderBottom: '1px solid #f3f3f3', padding: '16px 0' }}>
              <div style={{ minWidth: 44, minHeight: 44, borderRadius: 12, background: '#fdeaea', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>{h.type === 'donation' ? <FaGift /> : h.type === 'request' ? <FaHeartbeat /> : <FaCalendarAlt />}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#e53935' }}>{h.type === 'donation' ? 'Donation' : h.type === 'request' ? 'Request' : 'Appointment'} at {h.org}</div>
                <div style={{ color: '#888', fontSize: 15 }}>{h.date} &middot; {h.blood_group} &middot; {h.units} unit{h.units > 1 ? 's' : ''}</div>
                <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 15 }}>{h.org}</div>
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '3px 10px', background: h.status === 'fulfilled' ? '#e8f5e9' : h.status === 'pending' ? '#fff3e0' : '#ffebee', color: h.status === 'fulfilled' ? '#43a047' : h.status === 'pending' ? '#ff9800' : '#e53935', marginLeft: 'auto' }}>{h.status.charAt(0).toUpperCase() + h.status.slice(1)}</span>
              {h.urgent && <span style={{ background: '#e53935', color: '#fff', borderRadius: 8, padding: '3px 10px', fontWeight: 700, fontSize: 13, marginLeft: 8 }}>Urgent</span>}
              {h.cert && <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 14, marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FaDownload /> Certificate</button>}
              {h.feedback && <button style={{ background: '#fbc02d', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 14, marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><FaStar /> Feedback</button>}
              <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontSize: 14, marginLeft: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => setShowDetail(h)}><FaSearch /> Details</button>
            </div>
          ))}
        </section>
      ) : (
        <section style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #e5393533', padding: 24, marginBottom: 32, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 18 }}>
          [Map View Coming Soon]
        </section>
      )}
      {/* Detail Modal */}
      {showDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 18, width: 370, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, animation: 'fadeIn 0.3s' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#e53935' }}>History Details</span>
              <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setShowDetail(null)}>&times;</button>
            </div>
            <div style={{ padding: '24px', fontSize: 15, color: '#444', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><b>Type:</b> {showDetail.type === 'donation' ? 'Donation' : showDetail.type === 'request' ? 'Request' : 'Appointment'}</div>
              <div><b>Date:</b> {showDetail.date}</div>
              <div><b>Location:</b> {showDetail.org}</div>
              <div><b>Blood Group:</b> {showDetail.blood_group}</div>
              <div><b>Units:</b> {showDetail.units}</div>
              <div><b>Status:</b> {showDetail.status}</div>
              <div><b>Organization:</b> {showDetail.org}</div>
              {showDetail.urgent && <div><b>Urgency:</b> Urgent</div>}
              {showDetail.cert && <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700, fontSize: 15, width: '100%', cursor: 'pointer', marginTop: 10 }}><FaDownload /> Download Certificate</button>}
              {showDetail.feedback && <button style={{ background: '#fbc02d', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 0', fontWeight: 700, fontSize: 15, width: '100%', cursor: 'pointer', marginTop: 10 }}><FaStar /> View Feedback</button>}
            </div>
          </div>
        </div>
      )}
      {/* Feedback List */}
      {tab === 'feedback' && (
        <section style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px #fbc02d33', padding: 24, marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#e53935', marginBottom: 18 }}>Your Feedback & Ratings</div>
          {feedback.length === 0 ? (
            <div style={{ color: '#888', fontSize: 16, textAlign: 'center', padding: 32 }}>No feedback yet.</div>
          ) : feedback.map(f => (
            <div key={f.id} style={{ background: '#fffde7', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px #fbc02d33', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: '#e53935', fontSize: 17 }}>{f.org}</div>
              <div style={{ color: '#fbc02d', fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}><FaStar /> {f.rating}</div>
              <div style={{ color: '#888', fontSize: 15 }}>{f.comment}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{f.date}</div>
            </div>
          ))}
        </section>
      )}
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