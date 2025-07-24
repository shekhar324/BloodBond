"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaSearch, FaTint, FaMapMarkerAlt, FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle, FaSort, FaSortUp, FaSortDown, FaPhone, FaHeartbeat, FaClock, FaBolt, FaRulerHorizontal, FaCalendarAlt, FaStar, FaBookmark, FaRegBookmark, FaShareAlt, FaQrcode } from "react-icons/fa";
import { QRCodeCanvas } from 'qrcode.react';
import { useCurrentUser } from "../../../utils/useCurrentUser";
import { supabase } from "../../../utils/supabaseClient";

const Map = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MOCK_RESULTS = [
  { id: 1, name: "Rohit Kumar", blood_group: "A+", city: "Delhi", last_donation: "2024-06-01", eligible: true, status: "Active", lat: 28.6139, lng: 77.2090, type: "donor" },
  { id: 2, name: "Priya Singh", blood_group: "O-", city: "Noida", last_donation: "2024-05-15", eligible: false, status: "Unavailable", lat: 28.5355, lng: 77.3910, type: "donor" },
  { id: 3, name: "Amit Sharma", blood_group: "B+", city: "Gurgaon", last_donation: "2024-04-20", eligible: true, status: "Active", lat: 28.4595, lng: 77.0266, type: "receiver" },
  { id: 4, name: "Neha Verma", blood_group: "AB-", city: "Delhi", last_donation: "2024-03-10", eligible: true, status: "Active", lat: 28.7041, lng: 77.1025, type: "receiver" },
];
const MOCK_CONTACT_PREFS: Record<number, string> = {
  1: "In-app only",
  2: "Email",
  3: "Phone",
  4: "In-app only",
};
const MOCK_CHAT_HISTORY = [
  { from: "You", text: "Hi, I need blood urgently.", time: "10:01 AM" },
  { from: "Priya Singh", text: "I can help!", time: "10:02 AM" },
];
const MOCK_TEMPLATES = [
  "Can you donate blood this week?",
  "Are you available for a call?",
  "Thank you for your help!",
];

// Mock verification and rating logic
const MOCK_VERIFIED = [1, 3]; // user ids that are verified
const MOCK_RATINGS: { [key: string]: { stars: number; feedback: number } } = {
  1: { stars: 5, feedback: 12 },
  2: { stars: 4, feedback: 3 },
  3: { stars: 5, feedback: 8 },
  4: { stars: 3, feedback: 1 },
};

type SortKey = "name" | "blood_group" | "city" | "last_donation";

// Add a mock function to determine best matches (top 2 for demo)
const getBestMatches = (results: typeof MOCK_RESULTS) => results.slice(0, 2);

function getNextEligibleDate(lastDonation: string) {
  const last = new Date(lastDonation);
  last.setDate(last.getDate() + 56); // 56 days between donations
  return last.toLocaleDateString();
}

export default function FindDonorReceiverPage() {
  const [search, setSearch] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showMap, setShowMap] = useState(true);
  const [radius, setRadius] = useState(20); // km
  const [recentDays, setRecentDays] = useState(30);
  const [availDate, setAvailDate] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState(MOCK_CHAT_HISTORY);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingWith, setBookingWith] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ blood: '', location: '', units: '', message: '' });
  const [saved, setSaved] = useState<{ [key: string]: boolean }>({});
  const [shareOpen, setShareOpen] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  // Filter and sort results (mock logic for distance, recent activity, availability)
  const filtered = MOCK_RESULTS.filter(r =>
    (!search || r.name.toLowerCase().includes(search.toLowerCase())) &&
    (!bloodGroup || r.blood_group === bloodGroup) &&
    (!city || r.city.toLowerCase().includes(city.toLowerCase())) &&
    (!type || r.type === type) &&
    (!availDate || new Date(r.last_donation) >= new Date(availDate)) &&
    (!recentDays || (new Date().getTime() - new Date(r.last_donation).getTime()) / (1000 * 60 * 60 * 24) <= recentDays)
    // Distance filter would require real geolocation logic
  ).sort((a, b) => {
    let vA: any = a[sortBy], vB: any = b[sortBy];
    if (sortBy === "last_donation") {
      vA = new Date(a.last_donation).getTime();
      vB = new Date(b.last_donation).getTime();
    }
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const bestMatches = getBestMatches(filtered);

  useEffect(() => {
    if (!user?.id) return;
    const fetchRequests = async () => {
      const { data: sent, error: sentError } = await supabase.from('requests').select('*').eq('sender_id', user.id).order('created_at', { ascending: false });
      if (sentError) {
        console.error('Error fetching sent requests:', sentError.message);
        setSentRequests([]);
      } else {
        setSentRequests(sent || []);
      }
      const { data: received, error: receivedError } = await supabase.from('requests').select('*').eq('receiver_id', user.id).order('created_at', { ascending: false });
      if (receivedError) {
        console.error('Error fetching received requests:', receivedError.message);
        setReceivedRequests([]);
      } else {
        setReceivedRequests(received || []);
      }
    };
    fetchRequests();
    // Real-time subscription
    const channel = supabase.channel('requests-changes-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchRequests)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(120deg, #f7fafd 60%, #f3f6fb 100%)", padding: "2.5rem 0" }}>
      <section style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#e53935", marginBottom: 32, letterSpacing: 1 }}>Find Donor / Receiver</h1>
        {/* Emergency Broadcast Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
          <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 700, fontSize: 17, cursor: 'pointer', boxShadow: '0 2px 8px #e5393533', transition: 'background 0.18s' }} onClick={() => setBroadcastOpen(true)}>
            🚨 Emergency Broadcast
          </button>
        </div>
        {/* Privacy & Anonymity Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#e53935', cursor: 'pointer', fontSize: 16 }}>
            <input type="checkbox" checked={anonymous} onChange={e => setAnonymous(e.target.checked)} style={{ accentColor: '#e53935', width: 18, height: 18 }} />
            Send requests anonymously
          </label>
          <span style={{ color: '#888', fontSize: 14, fontWeight: 500 }}>(Your name will be hidden until the request is accepted)</span>
        </div>
        {/* Smart Recommendations */}
        {bestMatches.length > 0 && (
          <div style={{ marginBottom: 32, animation: 'fadeIn 0.5s' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#e53935', marginBottom: 16, fontWeight: 700, letterSpacing: 0.5 }}>Recommended for You <span style={{ fontSize: 15, color: '#888', fontWeight: 400 }}>(AI-powered)</span></h2>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {bestMatches.map((r, i) => (
                <div key={r.id} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.09)', padding: 24, minWidth: 280, flex: 1, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', border: '2px solid #e53935', animation: `fadeInUp 0.5s ${i * 0.04}s both` }}>
                  <span style={{ position: 'absolute', top: 16, right: 16, background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '4px 12px', boxShadow: '0 2px 8px #e5393533', letterSpacing: 0.5 }}>Best Match</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fdeaea', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{r.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 17, color: '#e53935', letterSpacing: 0.5 }}>{r.name}</div>
                      <div style={{ fontSize: 14, color: '#888', fontWeight: 500 }}>{r.type === 'donor' ? 'Donor' : 'Receiver'} &middot; {r.city}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: '#e53935', fontSize: 14 }}><FaTint /> {r.blood_group}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500, color: '#1976d2', fontSize: 14 }}><FaMapMarkerAlt /> {r.city}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 500, color: '#888', fontSize: 14 }}><FaClock /> Last Donation: {r.last_donation}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 15, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }}>{r.type === 'donor' ? 'Request Blood' : 'Offer to Donate'}</button>
                    <button style={{ background: '#fafafa', color: '#e53935', border: '1.5px solid #e53935', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 15, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }}><FaEnvelope style={{ marginRight: 5 }} />Contact</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search & Filters */}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 28, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <FaSearch style={{ position: "absolute", left: 14, top: 16, color: "#aaa", fontSize: 16 }} />
            <input type="text" placeholder="Search by name..." aria-label="Search by name" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} />
          </div>
          <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} aria-label="Filter by blood group" style={{ minWidth: 120, padding: '0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16 }}>
            <option value="">All Groups</option>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          <input type="text" placeholder="City/Area..." aria-label="City or Area" value={city} onChange={e => setCity(e.target.value)} style={{ minWidth: 120, padding: '0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16 }} />
          <select value={type} onChange={e => setType(e.target.value)} aria-label="Filter by type" style={{ minWidth: 120, padding: '0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16 }}>
            <option value="">All Types</option>
            <option value="donor">Donor</option>
            <option value="receiver">Receiver</option>
          </select>
          {/* Distance filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 160 }}>
            <FaRulerHorizontal style={{ color: '#e53935', fontSize: 18 }} />
            <input type="range" min={1} max={100} value={radius} onChange={e => setRadius(Number(e.target.value))} aria-label="Distance radius in km" style={{ flex: 1 }} />
            <span style={{ fontWeight: 600, color: '#e53935', minWidth: 36 }}>{radius} km</span>
          </div>
          {/* Recent activity filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 160 }}>
            <FaClock style={{ color: '#e53935', fontSize: 18 }} />
            <input type="number" min={1} max={365} value={recentDays} onChange={e => setRecentDays(Number(e.target.value))} aria-label="Recent activity in days" style={{ width: 60, borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.5rem' }} />
            <span style={{ fontWeight: 600, color: '#e53935' }}>days</span>
          </div>
          {/* Availability date filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 180 }}>
            <FaCalendarAlt style={{ color: '#e53935', fontSize: 18 }} />
            <input type="date" value={availDate} onChange={e => setAvailDate(e.target.value)} aria-label="Available after date" style={{ borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.5rem' }} />
          </div>
          <button onClick={() => setShowMap(v => !v)} style={{ background: showMap ? '#e53935' : '#fafafa', color: showMap ? '#fff' : '#e53935', border: '1.5px solid #e53935', borderRadius: 8, padding: '0.7rem 1.2rem', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.2s' }}>{showMap ? 'Show List' : 'Show Map'}</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, color: '#888' }}>Sort by:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)} aria-label="Sort by" style={{ minWidth: 100, padding: '0.6rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15 }}>
              <option value="name">Name</option>
              <option value="blood_group">Blood Group</option>
              <option value="city">City</option>
              <option value="last_donation">Last Donation</option>
            </select>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} style={{ background: 'none', border: 'none', color: '#e53935', fontSize: 18, cursor: 'pointer' }}>{sortDir === 'asc' ? <FaSortUp /> : <FaSortDown />}</button>
          </div>
        </div>
        {/* Map/List View */}
        {showMap ? (
          <div style={{ width: '100%', height: 400, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 32, background: '#fff', animation: 'fadeIn 0.5s' }}>
            {typeof window !== 'undefined' && Map && (
              <Map center={[28.6139, 77.2090]} zoom={10} style={{ width: '100%', height: 400 }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {filtered.map((r, i) => (
                  <Marker key={i} position={[r.lat, r.lng]}>
                    <Popup>
                      <b>{r.name}</b><br />
                      {r.type === 'donor' ? 'Donor' : 'Receiver'}<br />
                      Blood Group: {r.blood_group}<br />
                      City: {r.city}<br />
                      Last Donation: {r.last_donation}<br />
                      <button style={{ marginTop: 8, background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>{r.type === 'donor' ? 'Request Blood' : 'Offer to Donate'}</button>
                    </Popup>
                  </Marker>
                ))}
              </Map>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 28, marginBottom: 32, animation: 'fadeIn 0.5s' }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', fontSize: 18, padding: 32 }}>No results found.</div>
            ) : filtered.map((r, i) => (
              <div key={r.id} style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 28, display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', transition: 'box-shadow 0.2s, transform 0.2s', animation: `fadeInUp 0.5s ${i * 0.04}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fdeaea', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>{r.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 19, color: '#e53935', letterSpacing: 0.5 }}>{r.name}
                      {/* Verified Badge */}
                      {MOCK_VERIFIED.includes(Number(r.id)) && (
                        <span style={{ marginLeft: 8, background: '#e8f5e9', color: '#43a047', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}><FaCheckCircle style={{ fontSize: 15 }} />Verified</span>
                      )}
                    </div>
                    <div style={{ fontSize: 15, color: '#888', fontWeight: 500 }}>{r.type === 'donor' ? 'Donor' : 'Receiver'} &middot; {r.city}</div>
                  </div>
                  {/* Contact Preference Badge */}
                  <span style={{ marginLeft: 'auto', background: '#fbe9e7', color: '#e53935', fontWeight: 600, fontSize: 13, borderRadius: 8, padding: '4px 10px', boxShadow: '0 2px 8px #e5393533', letterSpacing: 0.5 }}>{MOCK_CONTACT_PREFS[Number(r.id)]}</span>
                </div>
                {/* Trust Badge: Star Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, marginBottom: 2 }}>
                  {MOCK_RATINGS[String(r.id)] && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', background: '#fffde7', color: '#fbc02d', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: 13, gap: 4 }}>
                      <FaStar style={{ fontSize: 15 }} />
                      {MOCK_RATINGS[String(r.id)].stars} ({MOCK_RATINGS[String(r.id)].feedback} reviews)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, color: '#e53935', fontSize: 15 }}><FaTint /> {r.blood_group}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#1976d2', fontSize: 15 }}><FaMapMarkerAlt /> {r.city}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#888', fontSize: 15 }}><FaClock /> Last Donation: {r.last_donation}</span>
                  {/* Next Eligible Date for Donors */}
                  {r.type === 'donor' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#43a047', fontSize: 15 }}><FaCalendarAlt /> Next Eligible: {getNextEligibleDate(r.last_donation)}</span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: r.eligible ? '#43a047' : '#e53935', fontSize: 15 }}>{r.eligible ? <FaCheckCircle /> : <FaTimesCircle />} {r.eligible ? 'Eligible' : 'Not Eligible'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: r.status === 'Active' ? '#43a047' : '#e53935', fontSize: 15 }}>{r.status === 'Active' ? <FaBolt /> : <FaTimesCircle />} {r.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  {/* Save/Bookmark Button */}
                  <button
                    style={{ background: saved[r.id] ? '#fffde7' : '#fafafa', color: '#fbc02d', border: '1.5px solid #fbc02d', borderRadius: 8, padding: '10px 14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', transition: 'background 0.18s' }}
                    title={saved[r.id] ? 'Remove from Saved' : 'Save'}
                    onClick={() => setSaved(s => ({ ...s, [r.id]: !s[r.id] }))}
                  >
                    {saved[r.id] ? <FaBookmark /> : <FaRegBookmark />}
                  </button>
                  {/* Share Button */}
                  <button
                    style={{ background: '#e3f2fd', color: '#1976d2', border: '1.5px solid #1976d2', borderRadius: 8, padding: '10px 14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', transition: 'background 0.18s' }}
                    title="Share"
                    onClick={() => {
                      const url = `${window.location.origin}/find-donor-receiver?id=${r.id}`;
                      navigator.clipboard.writeText(url);
                      setShareOpen(String(r.id));
                    }}
                  >
                    <FaShareAlt />
                  </button>
                  {/* QR Code Modal */}
                  {shareOpen === String(r.id) && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShareOpen(null)}>
                      <div style={{ background: '#fff', borderRadius: 18, width: 320, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, animation: 'fadeIn 0.3s' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: 18, color: '#1976d2' }}>Share Profile</span>
                          <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setShareOpen(null)}>&times;</button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
                          <QRCodeCanvas value={`${window.location.origin}/find-donor-receiver?id=${r.id}`} size={160} />
                          <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 600, wordBreak: 'break-all', textAlign: 'center' }}>{`${window.location.origin}/find-donor-receiver?id=${r.id}`}</div>
                          <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Link copied to clipboard!</div>
                        </div>
                      </div>
                    </div>
                  )}
                  <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }}>{anonymous ? 'Send Anonymously' : (r.type === 'donor' ? 'Request Blood' : 'Offer to Donate')}</button>
                  <button style={{ background: '#fafafa', color: '#e53935', border: '1.5px solid #e53935', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }}><FaEnvelope style={{ marginRight: 6 }} />Contact</button>
                  <button style={{ background: '#fff', color: '#1976d2', border: '1.5px solid #1976d2', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }} onClick={() => { setChatWith(r.name); setChatOpen(true); }}><FaUser style={{ marginRight: 6 }} />Chat</button>
                  {/* Book Appointment for Receivers */}
                  {r.type === 'donor' && (
                    <button style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', flex: 1, transition: 'background 0.18s' }} onClick={() => { setBookingWith(r.name); setBookingOpen(true); }}>Book Appointment</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Request Tracking & Status */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 36, flexWrap: 'wrap' }}>
          {/* Sent Requests */}
          <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', color: '#e53935', marginBottom: 14, fontWeight: 700, letterSpacing: 0.5 }}>Sent Requests</h2>
            {sentRequests.length === 0 ? (
              <div style={{ color: '#888', fontSize: 15 }}>No sent requests.</div>
            ) : sentRequests.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '10px 0', borderBottom: '1px solid #f3f3f3' }}>
                <span style={{ fontWeight: 700, color: '#e53935', minWidth: 90 }}>{r.to_name || r.receiver_name || r.receiver_id}</span>
                <span style={{ fontWeight: 600, color: '#1976d2', minWidth: 60 }}>{r.blood_group}</span>
                <span style={{ color: '#888', fontSize: 14 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                <span style={{ fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '3px 10px', background: r.status === 'pending' ? '#fff3e0' : r.status === 'accepted' ? '#e8f5e9' : '#ffebee', color: r.status === 'pending' ? '#ff9800' : r.status === 'accepted' ? '#43a047' : '#e53935', marginLeft: 'auto' }}>{r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : ''}</span>
              </div>
            ))}
          </div>
          {/* Received Requests */}
          <div style={{ flex: 1, minWidth: 320, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24 }}>
            <h2 style={{ fontSize: '1.1rem', color: '#e53935', marginBottom: 14, fontWeight: 700, letterSpacing: 0.5 }}>Received Requests</h2>
            {receivedRequests.length === 0 ? (
              <div style={{ color: '#888', fontSize: 15 }}>No received requests.</div>
            ) : receivedRequests.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '10px 0', borderBottom: '1px solid #f3f3f3' }}>
                <span style={{ fontWeight: 700, color: '#e53935', minWidth: 90 }}>{r.from_name || r.sender_name || r.sender_id}</span>
                <span style={{ fontWeight: 600, color: '#1976d2', minWidth: 60 }}>{r.blood_group}</span>
                <span style={{ color: '#888', fontSize: 14 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                <span style={{ fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '3px 10px', background: r.status === 'pending' ? '#fff3e0' : r.status === 'accepted' ? '#e8f5e9' : '#ffebee', color: r.status === 'pending' ? '#ff9800' : r.status === 'accepted' ? '#43a047' : '#e53935', marginLeft: 'auto' }}>{r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : ''}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Chat Modal */}
        {chatOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setChatOpen(false)}>
            <div style={{ background: '#fff', borderRadius: 18, width: 370, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, animation: 'fadeIn 0.3s' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#e53935' }}>Chat with {chatWith}</span>
                <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setChatOpen(false)}>&times;</button>
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto', padding: '18px 24px', background: '#fafafa', minHeight: 120 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ marginBottom: 12, display: 'flex', flexDirection: msg.from === 'You' ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ background: msg.from === 'You' ? '#e53935' : '#f5f5f5', color: msg.from === 'You' ? '#fff' : '#222', borderRadius: 12, padding: '8px 14px', fontWeight: 500, fontSize: 15, maxWidth: 200, wordBreak: 'break-word', boxShadow: '0 2px 8px #e5393533' }}>{msg.text}</div>
                    <span style={{ fontSize: 12, color: '#888', minWidth: 60, textAlign: 'center' }}>{msg.time}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1.5px solid #eee', background: '#fff' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {MOCK_TEMPLATES.map((tpl, i) => (
                    <button key={i} style={{ background: '#fbe9e7', color: '#e53935', border: 'none', borderRadius: 8, padding: '6px 10px', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'background 0.18s' }} onClick={() => setChatInput(tpl)}>{tpl}</button>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); if (chatInput.trim()) { setChatHistory([...chatHistory, { from: 'You', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); setChatInput(""); } }} style={{ display: 'flex', gap: 8 }}>
                  <input type="text" placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ flex: 1, borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem' }} />
                  <button type="submit" style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '0 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', transition: 'background 0.18s' }}>Send</button>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Booking Modal */}
        {bookingOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setBookingOpen(false)}>
            <div style={{ background: '#fff', borderRadius: 18, width: 350, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, animation: 'fadeIn 0.3s' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#43a047' }}>Book Appointment with {bookingWith}</span>
                <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setBookingOpen(false)}>&times;</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setBookingOpen(false); setBookingDate(""); alert('Appointment booked!'); }} style={{ padding: '24px' }}>
                <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Select Date</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 18 }} title="Select appointment date" placeholder="YYYY-MM-DD" />
                <button type="submit" style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, width: '100%', cursor: 'pointer', transition: 'background 0.18s' }}>Confirm Appointment</button>
              </form>
            </div>
          </div>
        )}
        {/* Emergency Broadcast Modal */}
        {broadcastOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setBroadcastOpen(false)}>
            <div style={{ background: '#fff', borderRadius: 18, width: 370, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: 0, animation: 'fadeIn 0.3s' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#e53935' }}>Emergency Broadcast</span>
                <button style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} onClick={() => setBroadcastOpen(false)}>&times;</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setBroadcastOpen(false); setBroadcastData({ blood: '', location: '', units: '', message: '' }); alert('Emergency broadcast sent!'); }} style={{ padding: '24px' }}>
                <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Blood Group</label>
                <select required value={broadcastData.blood} onChange={e => setBroadcastData(d => ({ ...d, blood: e.target.value }))} style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 14 }} title="Select blood group">
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
                <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Location</label>
                <input required value={broadcastData.location} onChange={e => setBroadcastData(d => ({ ...d, location: e.target.value }))} placeholder="City or Hospital" style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 14 }} />
                <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Units Needed</label>
                <input required type="number" min="1" value={broadcastData.units} onChange={e => setBroadcastData(d => ({ ...d, units: e.target.value }))} placeholder="e.g. 2" style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 14 }} />
                <label style={{ fontWeight: 600, color: '#888', fontSize: 15, marginBottom: 8, display: 'block' }}>Message</label>
                <textarea required value={broadcastData.message} onChange={e => setBroadcastData(d => ({ ...d, message: e.target.value }))} placeholder="Describe the emergency..." style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 15, padding: '0.7rem', marginBottom: 18, minHeight: 60 }} />
                <button type="submit" style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 16, width: '100%', cursor: 'pointer', transition: 'background 0.18s' }}>Send Broadcast</button>
              </form>
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