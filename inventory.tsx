"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { FaPlus, FaBox, FaTimes, FaCheckCircle, FaExclamationCircle, FaTint, FaSpinner, FaEdit, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaFilter, FaFileExport, FaCheckSquare, FaRegSquare, FaColumns, FaQrcode, FaHistory, FaChartBar, FaMapMarkerAlt } from "react-icons/fa";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { QRCodeCanvas } from 'qrcode.react';
import { useCurrentUser } from "../../../utils/useCurrentUser";
import dynamic from 'next/dynamic';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

function getStatus(units: number, expiryDate: string) {
  const daysUntilExpiry = (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiry < 0) return { text: "Expired", className: "critical" };
  if (units < 10 || daysUntilExpiry < 7) return { text: "Critical", className: "critical" };
  if (units < 50) return { text: "Low", className: "low" };
  return { text: "In Stock", className: "in-stock" };
}

type ColumnKey = 'blood_group' | 'units' | 'location' | 'expiry_date' | 'status' | 'actions';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [summary, setSummary] = useState<{[key:string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"success" | "error" | "">("");
  const [formLoading, setFormLoading] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{open: boolean, item: any|null}>({open: false, item: null});
  const [search, setSearch] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState<string>("blood_group");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    blood_group: true,
    units: true,
    location: true,
    expiry_date: true,
    status: true,
    actions: true
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showQR, setShowQR] = useState<{open: boolean, item: any|null}>({open: false, item: null});
  const [history, setHistory] = useState<any[]>([]);
  const { user, loading: userLoading } = useCurrentUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRestock, setShowRestock] = useState<{open: boolean, item: any|null}>({open: false, item: null});
  const [restockMsg, setRestockMsg] = useState("");

  // Form refs
  const bloodGroupRef = useRef<HTMLSelectElement>(null);
  const unitsRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const expiryDateRef = useRef<HTMLInputElement>(null);

  // Map (Leaflet) - only load on client
  const Map = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
  const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
  const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
  const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
  // Dummy geocode for locations (replace with real geocoding)
  const locationCoords: Record<string, [number, number]> = {
    'Main Branch': [28.6139, 77.2090],
    'City Hospital': [28.7041, 77.1025],
    'Regional Center': [28.5355, 77.3910],
  };

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    setInventory([]);
    setSummary({});
    // Fetch from the new inventory table
    const { data, error } = await supabase.from("inventory").select("*");
    if (error) {
      setInventory([]);
      setLoading(false);
      return;
    }
    setInventory(data || []);
    // Build summary by blood group (item_name)
    const sum: {[key:string]: number} = {};
    (data || []).forEach((item: any) => {
      if (!sum[item.item_name]) sum[item.item_name] = 0;
      sum[item.item_name] += Number(item.quantity);
    });
    setSummary(sum);
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
    // Real-time subscription
    const channel = supabase.channel('inventory-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'inventory', // Changed from 'blood_inventory'
      }, () => {
        fetchInventory();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (user && user.id) {
      supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
        setUserRole(data?.role || null);
      });
    }
  }, [user]);

  // Add stock
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage("");
    setFormStatus("");
    setFormLoading(true);
    const blood_group = bloodGroupRef.current?.value;
    const units = Number(unitsRef.current?.value);
    const location = locationRef.current?.value;
    const expiry_date = expiryDateRef.current?.value;
    if (!blood_group || !units || !location || !expiry_date) {
      setFormMessage("Please fill all fields.");
      setFormStatus("error");
      setFormLoading(false);
      return;
    }
    const { error } = await supabase.from("inventory").insert([{ item_name: blood_group, quantity: units, location, expiry_date }]);
    if (error) {
      setFormMessage("Error saving stock: " + error.message);
      setFormStatus("error");
    } else {
      setFormMessage("Stock added successfully!");
      setFormStatus("success");
      if (bloodGroupRef.current) bloodGroupRef.current.value = "";
      if (unitsRef.current) unitsRef.current.value = "";
      if (locationRef.current) locationRef.current.value = "";
      if (expiryDateRef.current) expiryDateRef.current.value = "";
      setTimeout(() => {
        setModalOpen(false);
        setFormMessage("");
        fetchInventory();
      }, 1200);
    }
    setFormLoading(false);
  };

  // Filtered, searched, and sorted inventory
  const processedInventory = inventory
    .filter(item => {
      const matchesSearch =
        item.item_name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());
      const matchesGroup = filterGroup ? item.item_name === filterGroup : true;
      const status = getStatus(Number(item.quantity), item.expiry_date).text;
      const matchesStatus = filterStatus ? status === filterStatus : true;
      return matchesSearch && matchesGroup && matchesStatus;
    })
    .sort((a, b) => {
      let vA = a[sortBy], vB = b[sortBy];
      if (sortBy === "expiry_date") {
        vA = new Date(a.expiry_date).getTime();
        vB = new Date(b.expiry_date).getTime();
      }
      if (sortBy === "quantity") {
        vA = Number(a.quantity);
        vB = Number(b.quantity);
      }
      if (vA < vB) return sortDir === "asc" ? -1 : 1;
      if (vA > vB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Export logic
  const exportCSV = () => {
    const headers = (Object.keys(visibleColumns) as ColumnKey[]).filter(k => visibleColumns[k] && k !== 'actions');
    const rows = processedInventory.map(item => headers.map(h => h === 'status' ? getStatus(Number(item.quantity), item.expiry_date).text : item[h]));
    let csv = headers.join(',') + '\n';
    rows.forEach(row => { csv += row.join(',') + '\n'; });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simulate fetching audit log (replace with real fetch if available)
  const fetchHistory = async () => {
    // Simulated data
    setHistory([
      { action: 'Added', user: 'Admin', date: new Date().toLocaleString(), details: 'Added 10 units O+ at Main Branch' },
      { action: 'Edited', user: 'Admin', date: new Date(Date.now() - 3600000).toLocaleString(), details: 'Updated expiry for 5 units A-' },
      { action: 'Deleted', user: 'Admin', date: new Date(Date.now() - 7200000).toLocaleString(), details: 'Deleted 2 units B+' },
    ]);
  };

  // Restock request
  const handleRestock = async (item: any, reason: string) => {
    await supabase.from('restock_requests').insert([{ inventory_id: item.id, reason, requested_by: user?.id }]);
    setRestockMsg("Restock request sent!");
    setTimeout(() => { setShowRestock({open: false, item: null}); setRestockMsg(""); }, 1200);
  };

  return (
    <main className="inventory-main" style={{ minHeight: "100vh", background: "linear-gradient(120deg, #f7fafd 60%, #f3f6fb 100%)", padding: "2rem 0" }}>
      <section className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="inventory-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--primary)", display: "flex", alignItems: "center", gap: 12 }}><FaBox /> Blood Inventory</h1>
          {/* Removed Add New Stock button */}
        </div>
        {/* Summary Cards */}
        <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32, rowGap: 24 }}>
          {BLOOD_GROUPS.map((group, i) => (
            <div className="summary-card" key={group} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 24, textAlign: "center", opacity: 1, animation: `fadeInUp 0.5s ${i * 0.05}s both` }}>
              <div className="blood-group" style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><FaTint /> {group}</div>
              <div className="unit-count" style={{ fontSize: 32, fontWeight: 700, color: "#222", marginBottom: 8 }}>{summary[group] || 0}</div>
              <div className={`status ${getStatus(summary[group] || 0, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).className}`} style={{ fontSize: 16, fontWeight: 600, padding: "0.3rem 0.8rem", borderRadius: 20, color: "#fff", display: 'inline-block' }}>{getStatus(summary[group] || 0, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()).text}</div>
            </div>
          ))}
        </div>
        {/* Map Section */}
        {typeof window !== 'undefined' && (
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24, marginBottom: 32 }}>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: 16 }}>Inventory Locations Map</h2>
            <div style={{ width: '100%', height: 320, borderRadius: 12, overflow: 'hidden' }}>
              {Map && (
                <Map center={[28.6139, 77.2090]} zoom={11} style={{ width: '100%', height: 320 }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {inventory.map((item, i) => {
                    const coords = locationCoords[item.location];
                    if (!coords) return null;
                    return (
                      <Marker key={i} position={coords}>
                        <Popup>
                          <b>{item.location}</b><br />
                          {item.item_name}: {item.quantity} units
                        </Popup>
                      </Marker>
                    );
                  })}
                </Map>
              )}
            </div>
            <div style={{ color: '#888', fontSize: 13, marginTop: 8 }}>(Map shows only known locations. More coming soon!)</div>
          </div>
        )}
        {/* Table Controls */}
        {userRole === 'admin' || userRole === 'blood_bank_admin' ? (
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <FaSearch style={{ position: 'absolute', left: 14, top: 16, color: '#aaa', fontSize: 16 }} />
            <input
              type="text"
              placeholder="Search by location or blood group..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16, transition: 'box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: 160 }}>
            <FaFilter style={{ position: 'absolute', left: 14, top: 16, color: '#aaa', fontSize: 16 }} />
            <select
              value={filterGroup}
              onChange={e => setFilterGroup(e.target.value)}
              aria-label="Filter by blood group"
              title="Filter by blood group"
              style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16 }}
            >
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div style={{ position: 'relative', minWidth: 160 }}>
            <FaFilter style={{ position: 'absolute', left: 14, top: 16, color: '#aaa', fontSize: 16 }} />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              aria-label="Filter by status"
              title="Filter by status"
              style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa', fontSize: 16 }}
            >
              <option value="">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low">Low</option>
              <option value="Critical">Critical</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, border: '1.5px solid #eee', background: '#fafafa', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={exportCSV}><FaFileExport /> Export CSV</button>
          <div style={{ position: 'relative' }}>
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, border: '1.5px solid #eee', background: '#fafafa', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setShowColumnPicker(v => !v)}><FaColumns /> Columns</button>
            {showColumnPicker && (
              <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', border: '1.5px solid #eee', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', zIndex: 10, minWidth: 180, padding: 12 }}>
                { (Object.keys(visibleColumns) as ColumnKey[]).filter(k => k !== 'actions').map(col => (
                  <label key={col} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, fontSize: 15, marginBottom: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={visibleColumns[col]} onChange={() => setVisibleColumns(v => ({ ...v, [col]: !v[col] }))} style={{ accentColor: 'var(--primary)' }} />
                    {col.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedRows.size > 0 && (
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, borderRadius: 8, padding: '0.7rem 1.2rem', background: '#e53935', color: '#fff', border: 'none', transition: 'background 0.2s' }} onClick={async () => {
              for (const item of selectedRows) {
                await supabase.from('inventory').delete().eq('id', item.id);
              }
              setSelectedRows(new Set());
              fetchInventory();
            }}><FaTrash /> Delete Selected</button>
          )}
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, border: '1.5px solid #eee', background: '#fafafa', borderRadius: 8, padding: '0.7rem 1.2rem', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => { fetchHistory(); setShowHistory(true); }}><FaHistory /> Audit Log</button>
        </div>
        ) : null}
        {/* Inventory Table */}
        <div className="inventory-table" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.07)", padding: 24, overflowX: "auto", marginTop: 32 }}>
          <h2 style={{ fontSize: "1.5rem", color: "#222", fontWeight: 800, marginBottom: 16 }}>Detailed Stock List</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 700 }}>
            <thead style={{ position: 'sticky', top: 0, background: '#fafafa', zIndex: 2 }}>
              <tr>
                <th style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, color: "#888", background: '#fafafa' }}>Blood Group</th>
                <th style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, color: "#888", background: '#fafafa' }}>Type</th>
                <th style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, color: "#888", background: '#fafafa' }}>Units</th>
                <th style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, color: "#888", background: '#fafafa' }}>Location</th>
                <th style={{ padding: 16, borderBottom: "1px solid #eee", fontWeight: 600, color: "#888", background: '#fafafa' }}>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 32 }}><span>Loading...</span></td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 32 }}>No inventory data found.</td></tr>
              ) : (
                inventory.map((item, i) => (
                  <tr key={item.id || i} style={{ animation: `fadeInUp 0.5s ${i * 0.03}s both`, opacity: 1, background: i % 2 === 0 ? '#fcfcfc' : '#f5f5f5' }}>
                    <td style={{ padding: 16, fontWeight: 700, color: "var(--primary)" }}>{item.item_name}</td>
                    <td style={{ padding: 16 }}>{item.item_type}</td>
                    <td style={{ padding: 16 }}>{item.quantity}</td>
                    <td style={{ padding: 16 }}>{item.location}</td>
                    <td style={{ padding: 16 }}>{item.expiry_date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* Add/Edit Stock Modal */}
      {modalOpen && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div className="modal-content" style={{ background: "#fff", borderRadius: 18, padding: 32, width: "90%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", animation: "fadeIn 0.3s" }}>
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 className="modal-title" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>{editItem ? 'Edit Stock' : 'Add/Update Stock'}</h2>
              <button className="modal-close" style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#888" }} onClick={() => { setModalOpen(false); setEditItem(null); }} title="Close modal"><FaTimes /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setFormMessage("");
              setFormStatus("");
              setFormLoading(true);
              const blood_group = bloodGroupRef.current?.value;
              const units = Number(unitsRef.current?.value);
              const location = locationRef.current?.value;
              const expiry_date = expiryDateRef.current?.value;
              if (!blood_group || !units || !location || !expiry_date) {
                setFormMessage("Please fill all fields.");
                setFormStatus("error");
                setFormLoading(false);
                return;
              }
              if (editItem) {
                // Update
                const { error } = await supabase.from("inventory").update({ item_name: blood_group, quantity: units, location, expiry_date }).eq('id', editItem.id);
                if (error) {
                  setFormMessage("Error updating stock: " + error.message);
                  setFormStatus("error");
                } else {
                  setFormMessage("Stock updated successfully!");
                  setFormStatus("success");
                  setTimeout(() => {
                    setModalOpen(false);
                    setEditItem(null);
                    setFormMessage("");
                    fetchInventory();
                  }, 1200);
                }
              } else {
                // Add
                const { error } = await supabase.from("inventory").insert([{ item_name: blood_group, quantity: units, location, expiry_date }]);
                if (error) {
                  setFormMessage("Error saving stock: " + error.message);
                  setFormStatus("error");
                } else {
                  setFormMessage("Stock added successfully!");
                  setFormStatus("success");
                  setTimeout(() => {
                    setModalOpen(false);
                    setFormMessage("");
                    fetchInventory();
                  }, 1200);
                }
              }
              setFormLoading(false);
            }} autoComplete="off">
              <div className="form-group floating-label" style={{ marginBottom: 18, position: 'relative' }}>
                <select id="bloodGroup" ref={bloodGroupRef} required className="form-control input" style={{ width: '100%', padding: '1rem 0.8rem 0.5rem 0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa' }} defaultValue={editItem?.item_name || ""}>
                  <option value="" disabled hidden></option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
                <label htmlFor="bloodGroup" style={{ left: 14, top: 18, color: '#888', pointerEvents: 'none', position: 'absolute', transition: 'all 0.2s' }}>Blood Group</label>
              </div>
              <div className="form-group floating-label" style={{ marginBottom: 18, position: 'relative' }}>
                <input type="number" id="units" ref={unitsRef} required min={1} className="form-control input" placeholder=" " style={{ width: '100%', padding: '1rem 0.8rem 0.5rem 0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa' }} defaultValue={editItem?.quantity || ""} />
                <label htmlFor="units" style={{ left: 14, top: 18, color: '#888', pointerEvents: 'none', position: 'absolute', transition: 'all 0.2s' }}>Number of Units</label>
              </div>
              <div className="form-group floating-label" style={{ marginBottom: 18, position: 'relative' }}>
                <input type="text" id="location" ref={locationRef} required className="form-control input" placeholder=" " style={{ width: '100%', padding: '1rem 0.8rem 0.5rem 0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa' }} defaultValue={editItem?.location || ""} />
                <label htmlFor="location" style={{ left: 14, top: 18, color: '#888', pointerEvents: 'none', position: 'absolute', transition: 'all 0.2s' }}>Location / Branch</label>
              </div>
              <div className="form-group floating-label" style={{ marginBottom: 18, position: 'relative' }}>
                <input type="date" id="expiryDate" ref={expiryDateRef} required className="form-control input" placeholder=" " style={{ width: '100%', padding: '1rem 0.8rem 0.5rem 0.8rem', borderRadius: 8, border: '1.5px solid #eee', background: '#fafafa' }} defaultValue={editItem?.expiry_date ? editItem.expiry_date.split('T')[0] : ""} />
                <label htmlFor="expiryDate" style={{ left: 14, top: 18, color: '#888', pointerEvents: 'none', position: 'absolute', transition: 'all 0.2s' }}>Expiry Date</label>
              </div>
              <button type="submit" className="add-stock-btn btn btn-primary btn-hero" style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 18 }} disabled={formLoading}>
                {formLoading ? <FaSpinner className="spinner" /> : <FaCheckCircle />} {formLoading ? (editItem ? "Saving..." : "Saving...") : (editItem ? "Save Changes" : "Save Stock")}
              </button>
              {formMessage && (
                <div className={`form-message ${formStatus}`} style={{ textAlign: "center", marginTop: 18, fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {formStatus === "success" && <FaCheckCircle style={{ color: '#388e3c' }} />}
                  {formStatus === "error" && <FaExclamationCircle style={{ color: '#e53935' }} />}
                  {formMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deleteConfirm.open && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div className="modal-content" style={{ background: "#fff", borderRadius: 18, padding: 32, width: "90%", maxWidth: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", animation: "fadeIn 0.3s" }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <FaExclamationCircle style={{ color: '#e53935', fontSize: 36 }} />
              <h3 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>Delete Inventory Item?</h3>
              <p style={{ color: '#888', textAlign: 'center', margin: 0 }}>Are you sure you want to delete this stock entry? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 18 }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 600, color: '#888', border: '1.5px solid #eee', background: '#fafafa', transition: 'background 0.2s' }} onClick={() => setDeleteConfirm({open: false, item: null})}>Cancel</button>
                <button className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', borderRadius: 8, fontWeight: 600, background: '#e53935', color: '#fff', border: 'none', transition: 'background 0.2s' }} onClick={async () => {
                  if (deleteConfirm.item) {
                    await supabase.from('inventory').delete().eq('id', deleteConfirm.item.id);
                    setDeleteConfirm({open: false, item: null});
                    fetchInventory();
                  }
                }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* QR Code Modal */}
      {showQR.open && showQR.item && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
          <div className="modal-content" style={{ background: "#fff", borderRadius: 18, padding: 32, width: "90%", maxWidth: 340, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", animation: "fadeIn 0.3s", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Inventory QR Code</h3>
            <QRCodeCanvas value={JSON.stringify(showQR.item)} size={180} />
            <button className="btn btn-outline" style={{ marginTop: 24, borderRadius: 8, fontWeight: 600, color: '#888', border: '1.5px solid #eee', background: '#fafafa', padding: '0.5rem 1.2rem', transition: 'background 0.2s' }} onClick={() => setShowQR({open: false, item: null})}>Close</button>
          </div>
        </div>
      )}
      {/* Audit Log Modal */}
      {showHistory && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
          <div className="modal-content" style={{ background: "#fff", borderRadius: 18, padding: 32, width: "90%", maxWidth: 420, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", animation: "fadeIn 0.3s" }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18, color: 'var(--primary)' }}>Inventory Audit Log</h3>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {history.length === 0 ? <div style={{ color: '#888', textAlign: 'center' }}>No history found.</div> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {history.map((h, i) => (
                    <li key={i} style={{ marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontWeight: 700, color: h.action === 'Deleted' ? '#e53935' : h.action === 'Edited' ? '#ff9800' : '#388e3c', minWidth: 70 }}>{h.action}</span>
                      <span style={{ color: '#888', fontSize: 13 }}>{h.date}</span>
                      <span style={{ flex: 1 }}>{h.details}</span>
                      <span style={{ color: '#1976d2', fontWeight: 600 }}>{h.user}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button className="btn btn-outline" style={{ marginTop: 18, borderRadius: 8, fontWeight: 600, color: '#888', border: '1.5px solid #eee', background: '#fafafa', padding: '0.5rem 1.2rem', transition: 'background 0.2s' }} onClick={() => setShowHistory(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Restock Request Modal */}
      {showRestock.open && showRestock.item && (
        <div className="modal-backdrop" style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
          <div className="modal-content" style={{ background: "#fff", borderRadius: 18, padding: 32, width: "90%", maxWidth: 340, boxShadow: "0 4px 24px rgba(0,0,0,0.13)", animation: "fadeIn 0.3s", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Request Restock</h3>
            <p style={{ color: '#888', marginBottom: 12 }}>Let the admin know why you need a restock for <b>{showRestock.item.item_name}</b> at <b>{showRestock.item.location}</b>.</p>
            <textarea rows={3} style={{ width: '100%', borderRadius: 8, border: '1.5px solid #eee', padding: 10, marginBottom: 12 }} placeholder="Reason for restock..." id="restockReason"></textarea>
            {restockMsg && <div style={{ color: '#388e3c', fontWeight: 600, marginBottom: 8 }}>{restockMsg}</div>}
            <button className="btn btn-primary" style={{ marginTop: 8, borderRadius: 8, fontWeight: 600, color: '#fff', background: 'var(--primary)', padding: '0.5rem 1.2rem' }} onClick={() => {
              const reason = (document.getElementById('restockReason') as HTMLTextAreaElement)?.value || '';
              handleRestock(showRestock.item, reason);
            }}>Send Request</button>
            <button className="btn btn-outline" style={{ marginTop: 12, borderRadius: 8, fontWeight: 600, color: '#888', border: '1.5px solid #eee', background: '#fafafa', padding: '0.5rem 1.2rem', transition: 'background 0.2s' }} onClick={() => setShowRestock({open: false, item: null})}>Cancel</button>
          </div>
        </div>
      )}
      {/* Analytics Section */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24, marginBottom: 32, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}><FaChartBar style={{ color: 'var(--primary)', fontSize: 22 }} /><h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Inventory Analytics</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <Bar
              data={{
                labels: BLOOD_GROUPS,
                datasets: [{
                  label: 'Units by Blood Group',
                  data: BLOOD_GROUPS.map(bg => summary[bg] || 0),
                  backgroundColor: BLOOD_GROUPS.map(bg => '#e53935'),
                }],
              }}
              options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
              height={180}
            />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <Pie
              data={{
                labels: BLOOD_GROUPS,
                datasets: [{
                  label: 'Units Distribution',
                  data: BLOOD_GROUPS.map(bg => summary[bg] || 0),
                  backgroundColor: BLOOD_GROUPS.map(bg => '#f44336'),
                }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }}
              height={180}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .status.in-stock { background: #4caf50; }
        .status.low { background: #ff9800; }
        .status.critical { background: #f44336; }
        .spinner {
          animation: spin 1s linear infinite;
          font-size: 1.2em;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
} 