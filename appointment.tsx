"use client";
import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from '../../../utils/supabaseClient';
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaClock, FaTint, FaHospital, FaRegBuilding, FaStickyNote, FaUserTag, FaSyringe, FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";

export default function AppointmentPage() {
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"success" | "error" | "">("");
  const [touched, setTouched] = useState<{[key:string]: boolean}>({});
  const [valid, setValid] = useState<{[key:string]: boolean}>({});
  const [inputValues, setInputValues] = useState<{[key:string]: string}>({});
  const router = useRouter();

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const bloodGroupRef = useRef<HTMLSelectElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const centreRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Floating label logic
  const handleInput = (e: React.ChangeEvent<any>) => {
    setInputValues({ ...inputValues, [e.target.id]: e.target.value });
    setTouched({ ...touched, [e.target.id]: true });
    // Minimal validation for micro-interaction
    if (e.target.type === "email") {
      setValid({ ...valid, [e.target.id]: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.target.value) });
    } else if (e.target.type === "tel") {
      setValid({ ...valid, [e.target.id]: /^\d{10,15}$/.test(e.target.value) });
    } else {
      setValid({ ...valid, [e.target.id]: !!e.target.value });
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormMessage("");
    setFormStatus("");

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (!session || sessionError) {
      setFormMessage("You must be logged in to book an appointment.");
      setFormStatus("error");
      setLoading(false);
      return;
    }
    const user = session.user;

    // Collect form data
    const formData = {
      user_id: user.id,
      full_name: nameRef.current?.value || "",
      email: emailRef.current?.value || "",
      phone: phoneRef.current?.value || "",
      appointment_date: dateRef.current?.value || "",
      time: timeRef.current?.value || "",
      type: typeRef.current?.value || "",
      blood_group: bloodGroupRef.current?.value || "",
      role: roleRef.current?.value || "",
      location: locationRef.current?.value || "",
      centre: centreRef.current?.value || "",
      notes: notesRef.current?.value || "",
      status: "pending",
    };

    // Basic validation
    if (!formData.full_name || !formData.email || !formData.phone || !formData.appointment_date || !formData.time || !formData.type || !formData.blood_group || !formData.role || !formData.location) {
      setFormMessage("Please fill in all required fields.");
      setFormStatus("error");
    } else {
      // Insert into Supabase
      const { error } = await supabase.from("appointments").insert([formData]);
      if (error) {
        setFormMessage(`Booking failed: ${error.message}`);
        setFormStatus("error");
      } else {
        setFormMessage("Appointment booked successfully! A confirmation email has been sent.");
        setFormStatus("success");
        // Optionally reset form
        if (nameRef.current) nameRef.current.value = "";
        if (emailRef.current) emailRef.current.value = "";
        if (phoneRef.current) phoneRef.current.value = "";
        if (dateRef.current) dateRef.current.value = "";
        if (timeRef.current) timeRef.current.value = "";
        if (typeRef.current) typeRef.current.value = "";
        if (bloodGroupRef.current) bloodGroupRef.current.value = "";
        if (roleRef.current) roleRef.current.value = "";
        if (locationRef.current) locationRef.current.value = "";
        if (centreRef.current) centreRef.current.value = "";
        if (notesRef.current) notesRef.current.value = "";
      }
    }
    setLoading(false);
  };

  // Icon mapping for each field
  const icons = {
    name: <FaUser className="input-icon" />, // Full Name
    email: <FaEnvelope className="input-icon" />, // Email
    phone: <FaPhone className="input-icon" />, // Phone
    date: <FaCalendarAlt className="input-icon" />, // Date
    time: <FaClock className="input-icon" />, // Time
    type: <FaSyringe className="input-icon" />, // Appointment Type
    blood: <FaTint className="input-icon" />, // Blood Group
    role: <FaUserTag className="input-icon" />, // Role
    location: <FaHospital className="input-icon" />, // Location
    centre: <FaRegBuilding className="input-icon" />, // Centre
    notes: <FaStickyNote className="input-icon" />, // Notes
  };

  return (
    <main className="appointment-main" style={{ minHeight: "100vh", background: "linear-gradient(120deg, #f7fafd 60%, #f3f6fb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 0" }}>
      <section className="appointment-section" style={{ maxWidth: 600, width: "100%", background: "#fff", padding: "3rem", borderRadius: 16, boxShadow: "0 8px 30px var(--shadow)", margin: "40px 0" }}>
        <div className="section-header" style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 className="section-title" style={{ color: "var(--primary)", fontWeight: 800, fontSize: "2.2rem", margin: 0 }}>Book an Appointment</h2>
          <p className="section-subtitle" style={{ color: "var(--text-secondary)", margin: "10px 0 0 0", fontSize: "1.08rem", fontWeight: 500 }}>Schedule your visit to a donation center.</p>
        </div>
        {/* Section Divider */}
        <div className="section-divider"></div>
        <form onSubmit={handleSubmit} autoComplete="off" className="appointment-form">
          {/* Floating label + micro-interaction + animated placeholder for each field */}
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.name}
              <input type="text" id="apptName" ref={nameRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptName" className={inputValues["apptName"] ? "active" : ""}>Full Name *</label>
              {touched["apptName"] && valid["apptName"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.email}
              <input type="email" id="apptEmail" ref={emailRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptEmail" className={inputValues["apptEmail"] ? "active" : ""}>Email Address *</label>
              {touched["apptEmail"] && valid["apptEmail"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.phone}
              <input type="tel" id="apptPhone" ref={phoneRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptPhone" className={inputValues["apptPhone"] ? "active" : ""}>Phone Number *</label>
              {touched["apptPhone"] && valid["apptPhone"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          {/* Divider for section separation */}
          <div className="section-divider"></div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.date}
              <input type="date" id="apptDate" ref={dateRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptDate" className={inputValues["apptDate"] ? "active" : ""}>Preferred Date *</label>
              {touched["apptDate"] && valid["apptDate"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.time}
              <input type="time" id="apptTime" ref={timeRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptTime" className={inputValues["apptTime"] ? "active" : ""}>Preferred Time *</label>
              {touched["apptTime"] && valid["apptTime"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.type}
              <select id="apptType" ref={typeRef} required className="input" onChange={handleInput} onBlur={handleInput} value={inputValues["apptType"] || ""}>
                <option value="" disabled hidden></option>
                <option value="Blood Donation">Blood Donation</option>
                <option value="Plasma Donation">Plasma Donation</option>
                <option value="Platelet Donation">Platelet Donation</option>
                <option value="Consultation">Consultation</option>
              </select>
              <label htmlFor="apptType" className={inputValues["apptType"] ? "active" : ""}>Appointment Type *</label>
              {touched["apptType"] && valid["apptType"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.blood}
              <select id="apptBloodGroup" ref={bloodGroupRef} required className="input" onChange={handleInput} onBlur={handleInput} value={inputValues["apptBloodGroup"] || ""}>
                <option value="" disabled hidden></option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <label htmlFor="apptBloodGroup" className={inputValues["apptBloodGroup"] ? "active" : ""}>Blood Group *</label>
              {touched["apptBloodGroup"] && valid["apptBloodGroup"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.role}
              <select id="apptRole" ref={roleRef} required className="input" onChange={handleInput} onBlur={handleInput} value={inputValues["apptRole"] || ""}>
                <option value="" disabled hidden></option>
                <option value="Donor">Donor</option>
                <option value="Receiver">Receiver</option>
              </select>
              <label htmlFor="apptRole" className={inputValues["apptRole"] ? "active" : ""}>Role *</label>
              {touched["apptRole"] && valid["apptRole"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.location}
              <input type="text" id="apptLocation" ref={locationRef} required placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptLocation" className={inputValues["apptLocation"] ? "active" : ""}>Location / Center *</label>
              {touched["apptLocation"] && valid["apptLocation"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.centre}
              <input type="text" id="apptCentre" ref={centreRef} placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptCentre" className={inputValues["apptCentre"] ? "active" : ""}>Centre (optional)</label>
              {touched["apptCentre"] && valid["apptCentre"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.notes}
              <textarea id="apptNotes" ref={notesRef} rows={2} placeholder=" " className="input" onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="apptNotes" className={inputValues["apptNotes"] ? "active" : ""}>Notes (optional)</label>
              {touched["apptNotes"] && valid["apptNotes"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-hero submit-btn" style={{ width: "100%", marginTop: 16, position: 'relative' }} disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : "Book Now"}
          </button>
          {formMessage && (
            <div id="form-message" className={`form-message ${formStatus}`} style={{ textAlign: "center", marginTop: 24, fontWeight: "bold", fontSize: "1.05rem", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {formStatus === "success" && <FaCheckCircle style={{ color: '#388e3c' }} />}
              {formStatus === "error" && <FaExclamationCircle style={{ color: '#e53935' }} />}
              {formMessage}
            </div>
          )}
        </form>
      </section>
      <style jsx>{`
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-primary); transition: 0.2s; pointer-events: none; position: absolute; left: 2.5rem; top: 50%; transform: translateY(-50%); background: transparent; z-index: 2; }
        .floating-label .input-wrapper { position: relative; }
        .floating-label input:focus + label,
        .floating-label input:not(:placeholder-shown) + label,
        .floating-label select:focus + label,
        .floating-label select:not([value=""]) + label,
        .floating-label textarea:focus + label,
        .floating-label textarea:not(:placeholder-shown) + label,
        .floating-label .input:focus + label,
        .floating-label .input:not(:placeholder-shown) + label,
        .floating-label .input.active + label {
          top: -0.9rem;
          left: 2.2rem;
          font-size: 0.92rem;
          color: var(--primary);
          background: #fff;
          padding: 0 0.2rem;
        }
        .icon-group .input-wrapper {
          display: flex;
          align-items: center;
          position: relative;
        }
        .input-icon {
          margin-right: 1rem;
          color: var(--primary);
          font-size: 1.15rem;
          flex-shrink: 0;
        }
        .input {
          width: 100%;
          padding: 0.9rem 0.9rem 0.9rem 0.5rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border 0.2s, box-shadow 0.2s, background 0.2s;
          background: var(--bg-secondary);
        }
        .input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 2px 8px rgba(139, 90, 140, 0.08);
          background: var(--bg-primary);
        }
        .btn-primary.btn-hero {
          background: linear-gradient(90deg, var(--primary) 60%, var(--primary-light) 100%);
          color: white;
          border: none;
          padding: 1.1rem;
          font-size: 1.15rem;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.3s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px var(--shadow-light);
        }
        .btn-primary.btn-hero:hover, .btn-primary.btn-hero:focus {
          background: var(--primary-dark);
          transform: scale(1.03);
          box-shadow: 0 4px 16px var(--shadow-light);
        }
        .spinner {
          animation: spin 1s linear infinite;
          font-size: 1.2em;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .valid-icon {
          color: #388e3c;
          font-size: 1.1em;
          margin-left: 0.5rem;
        }
        .form-message.error {
          color: #e53935;
        }
        .form-message.success {
          color: #388e3c;
        }
        .section-divider {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-light) 0%, var(--primary) 100%);
          opacity: 0.08;
          margin: 1.2rem 0 1.5rem 0;
          border-radius: 2px;
        }
      `}</style>
    </main>
  );
} 