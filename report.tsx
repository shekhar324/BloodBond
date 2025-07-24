"use client";

import React, { useRef, useState, useEffect } from "react";
import { useCurrentUser } from "../../../utils/useCurrentUser";
import { supabase } from "../../../utils/supabaseClient";
import StatsCard from "../../../components/StatsCard";
import RecentDonations from "../../../components/RecentDonations";
import UpcomingAppointments from "../../../components/UpcomingAppointments";
import NotificationsList from "../../../components/NotificationsList";
import HealthTrendsWidget from "../../../components/HealthTrendsWidget";
import ImpactWidget from "../../../components/ImpactWidget";
import Leaderboard from "../../../components/Leaderboard";
import FulfillmentRate from "../../../components/FulfillmentRate";
import Recommendations from "../../../components/Recommendations";
import RequestStatus from "../../../components/RequestStatus";
import UrgentNeeds from "../../../components/UrgentNeeds";
import NextEligibleDate from "../../../components/NextEligibleDate";
import DonationFrequencyChart from "../../../components/DonationFrequencyChart";
import { FaUser, FaTint, FaCalendarAlt, FaDownload } from "react-icons/fa";
import styles from "./report.module.css";
import html2pdf from "html2pdf.js";

const ReportPage = () => {
  const { user, loading } = useCurrentUser();
  const reportRef = useRef<HTMLDivElement>(null);

  // State for all widget data
  const [stats, setStats] = useState<{ icon: React.ReactNode; value: string; label: string; color?: string }>({ icon: <FaUser />, value: '', label: '', color: '' });
  const [impact, setImpact] = useState<{ livesSaved: number; totalDonations: number }>({ livesSaved: 0, totalDonations: 0 });
  const [nextEligibleDate, setNextEligibleDate] = useState<string>('');
  const [fulfillmentRate, setFulfillmentRate] = useState<number>(0);
  const [donationFrequency, setDonationFrequency] = useState<{ month: string; donations: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ name: string; value: number }[]>([]);
  const [requestStatus, setRequestStatus] = useState<{ status: string; unitsNeeded: number; bloodType: string; location: string }>({ status: '', unitsNeeded: 0, bloodType: '', location: '' });
  const [urgentNeeds, setUrgentNeeds] = useState<{ id: string | number; bloodType: string; units: number; location: string }[]>([]);
  const [recentDonations, setRecentDonations] = useState<{ id: string | number; donorName: string; date: string; units: number; bloodType: string }[]>([]);
  const [appointments, setAppointments] = useState<{ id: string | number; date: string; time: string; name: string; location: string }[]>([]);
  const [notifications, setNotifications] = useState<{ id: string | number; message: string; date?: string }[]>([]);
  const [healthTrends, setHealthTrends] = useState<{ date: string; hemoglobin: number; bp: number }[]>([]);
  const [recommendations, setRecommendations] = useState<{ id: string | number; message: string; icon?: React.ReactNode }[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    // Example: Fetch all data in parallel (replace with real queries)
    const fetchData = async () => {
      // StatsCard (mocked)
      setStats({
        icon: <FaTint color="#e53935" />,
        value: user.role === "donor" ? "5" : "3",
        label: user.role === "donor" ? "Total Donations" : "Total Requests",
        color: "bg-white",
      });
      // ImpactWidget (mocked)
      setImpact({ livesSaved: 12, totalDonations: 5 });
      // NextEligibleDate (mocked)
      setNextEligibleDate("2024-07-15");
      // FulfillmentRate (mocked)
      setFulfillmentRate(92);
      // DonationFrequencyChart (mocked)
      setDonationFrequency([
        { month: "Jan", donations: 1 },
        { month: "Feb", donations: 0 },
        { month: "Mar", donations: 2 },
        { month: "Apr", donations: 1 },
        { month: "May", donations: 1 },
      ]);
      // Leaderboard (mocked)
      setLeaderboard([
        { name: "Alice", value: 8 },
        { name: "You", value: 5 },
        { name: "Bob", value: 4 },
      ]);
      // RequestStatus (mocked)
      setRequestStatus({ status: "Fulfilled", unitsNeeded: 2, bloodType: "A+", location: "City Hospital" });
      // UrgentNeeds (mocked)
      setUrgentNeeds([
        { id: 1, bloodType: "O-", units: 3, location: "Central Clinic" },
        { id: 2, bloodType: "A+", units: 2, location: "City Hospital" },
      ]);
      // RecentDonations (mocked)
      setRecentDonations([
        { id: 1, donorName: user.name || "You", date: "2024-06-01", units: 1, bloodType: "A+" },
        { id: 2, donorName: user.name || "You", date: "2024-04-15", units: 2, bloodType: "A+" },
      ]);
      // Appointments (mocked)
      setAppointments([
        { id: 1, date: "2024-07-20", time: "10:00", name: "Donation", location: "Central Clinic" },
      ]);
      // Notifications (mocked)
      setNotifications([
        { id: 1, message: "Thank you for your donation!", date: "2024-06-01" },
        { id: 2, message: "Upcoming appointment reminder.", date: "2024-07-18" },
      ]);
      // HealthTrendsWidget (mocked)
      setHealthTrends([
        { date: "2024-01", hemoglobin: 13.5, bp: 120 },
        { date: "2024-02", hemoglobin: 13.7, bp: 118 },
        { date: "2024-03", hemoglobin: 13.6, bp: 119 },
      ]);
      // Recommendations (mocked)
      setRecommendations([
        { id: 1, message: "Stay hydrated before your next donation." },
        { id: 2, message: "Eat iron-rich foods this week." },
      ]);
      setDataLoading(false);
    };
    fetchData();
  }, [user]);

  const handleDownloadReport = () => {
    if (!reportRef.current) return;
    html2pdf()
      .from(reportRef.current)
      .set({
        margin: 0.5,
        filename: "BloodBond_Report.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      })
      .save();
  };

  if (loading || dataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your report.</div>;
  }

  const isDonor = user.role === "donor";
  const isReceiver = user.role === "receiver";

  return (
    <div className={styles.reportContainer}>
      <div className={styles.reportHeader}>
        <h1 style={{ color: "#e53935", fontWeight: 800, fontSize: 32, letterSpacing: 1, margin: 0 }}>Your BloodBond Report</h1>
        <button className={styles.downloadBtn} onClick={handleDownloadReport}>
          <FaDownload style={{ fontSize: 20 }} /> Download Full Report
        </button>
      </div>
      <div ref={reportRef} className={styles.reportGrid}>
        <div className={styles.glassCard}><StatsCard {...stats} /></div>
        <div className={styles.glassCard}><ImpactWidget {...impact} /></div>
        <div className={styles.glassCard}><NextEligibleDate date={nextEligibleDate} /></div>
        <div className={styles.glassCard}><FulfillmentRate rate={fulfillmentRate} /></div>
        <div className={styles.glassCard}><DonationFrequencyChart data={donationFrequency} /></div>
        <div className={styles.glassCard}><Leaderboard entries={leaderboard} /></div>
        <div className={styles.glassCard}><RequestStatus {...requestStatus} /></div>
        <div className={styles.glassCard}><UrgentNeeds needs={urgentNeeds} /></div>
        <div className={styles.glassCard}><RecentDonations donations={recentDonations} /></div>
        <div className={styles.glassCard}><UpcomingAppointments appointments={appointments} /></div>
        <div className={styles.glassCard}><NotificationsList notifications={notifications} /></div>
        <div className={styles.glassCard}><HealthTrendsWidget data={healthTrends} /></div>
        <div className={styles.glassCard}><Recommendations recommendations={recommendations} /></div>
      </div>
    </div>
  );
};

export default ReportPage; 