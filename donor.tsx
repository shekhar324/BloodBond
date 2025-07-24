"use client";
import { useRef, useState } from "react";
import { supabase } from '../../../utils/supabaseClient';
import { FaUser, FaBirthdayCake, FaVenusMars, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCity, FaFlag, FaHashtag, FaTint, FaCalendarAlt, FaHeartbeat, FaPills, FaPlane, FaCheckCircle, FaExclamationCircle, FaSpinner, FaHospital } from "react-icons/fa";

export default function BecomeDonorPage() {
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formStatus, setFormStatus] = useState<"success" | "error" | "">("");
  const [touched, setTouched] = useState<{[key:string]: boolean}>({});
  const [valid, setValid] = useState<{[key:string]: boolean}>({});
  const [inputValues, setInputValues] = useState<{[key:string]: string}>({});

  // Form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const dobRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const bloodGroupRef = useRef<HTMLSelectElement>(null);
  const lastDonationRef = useRef<HTMLInputElement>(null);
  const plateletsRef = useRef<HTMLInputElement>(null);
  const donationCenterRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const healthyRef = useRef<HTMLInputElement>(null);
  const chronicRef = useRef<HTMLInputElement>(null);
  const medicationRef = useRef<HTMLInputElement>(null);
  const travelRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const contactConsentRef = useRef<HTMLInputElement>(null);

  // Floating label logic
  const handleInput = (e: React.ChangeEvent<any>) => {
    setInputValues({ ...inputValues, [e.target.id]: e.target.value });
    setTouched({ ...touched, [e.target.id]: true });
    // Minimal validation for micro-interaction
    if (e.target.type === "email") {
      setValid({ ...valid, [e.target.id]: /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e.target.value) });
    } else if (e.target.type === "tel") {
      setValid({ ...valid, [e.target.id]: /^\d{10,15}$/.test(e.target.value) });
    } else if (e.target.type === "number") {
      setValid({ ...valid, [e.target.id]: !!e.target.value && !isNaN(Number(e.target.value)) });
    } else {
      setValid({ ...valid, [e.target.id]: !!e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormMessage("");
    setFormStatus("");

    // Collect form data
    let genderValue = genderRef.current?.value || "";
    if (genderValue === "0") genderValue = "Male";
    else if (genderValue === "1") genderValue = "Female";
    else if (genderValue === "2") genderValue = "Other";
    const formData = {
      full_name: nameRef.current?.value || "",
      dob: dobRef.current?.value || "",
      gender: genderValue,
      mobile: mobileRef.current?.value || "",
      email: emailRef.current?.value || "",
      address: addressRef.current?.value || "",
      city: cityRef.current?.value || "",
      state: stateRef.current?.value || "",
      pin: pinRef.current?.value || "",
      blood_group: bloodGroupRef.current?.value || "",
      last_donation: lastDonationRef.current?.value || "",
      platelets: plateletsRef.current?.checked || false,
      donation_center: donationCenterRef.current?.value || "",
      weight: weightRef.current?.value || "",
      healthy: healthyRef.current?.checked || false,
      chronic: chronicRef.current?.value || "",
      medication: medicationRef.current?.value || "",
      travel: travelRef.current?.value || "",
      consent: consentRef.current?.checked || false,
      contact_consent: contactConsentRef.current?.checked || false,
    };

    // Basic validation
    if (!formData.full_name || !formData.dob || !formData.gender || !formData.mobile || !formData.email || !formData.address || !formData.city || !formData.state || !formData.pin || !formData.blood_group || !formData.weight || !formData.consent) {
      setFormMessage("Please fill in all required fields and confirm your information.");
      setFormStatus("error");
      setLoading(false);
      return;
    }

    // Insert into Supabase
    const { error } = await supabase.from("donors").insert([formData]);
    if (error) {
      setFormMessage(`Registration failed: ${error.message}`);
      setFormStatus("error");
    } else {
      setFormMessage("Thank you for registering as a donor!");
      setFormStatus("success");
      // Optionally reset form
      if (nameRef.current) nameRef.current.value = "";
      if (dobRef.current) dobRef.current.value = "";
      if (genderRef.current) genderRef.current.value = "";
      if (mobileRef.current) mobileRef.current.value = "";
      if (emailRef.current) emailRef.current.value = "";
      if (addressRef.current) addressRef.current.value = "";
      if (cityRef.current) cityRef.current.value = "";
      if (stateRef.current) stateRef.current.value = "";
      if (pinRef.current) pinRef.current.value = "";
      if (bloodGroupRef.current) bloodGroupRef.current.value = "";
      if (lastDonationRef.current) lastDonationRef.current.value = "";
      if (plateletsRef.current) plateletsRef.current.checked = false;
      if (donationCenterRef.current) donationCenterRef.current.value = "";
      if (weightRef.current) weightRef.current.value = "";
      if (healthyRef.current) healthyRef.current.checked = false;
      if (chronicRef.current) chronicRef.current.value = "";
      if (medicationRef.current) medicationRef.current.value = "";
      if (travelRef.current) travelRef.current.value = "";
      if (consentRef.current) consentRef.current.checked = false;
      if (contactConsentRef.current) contactConsentRef.current.checked = false;
    }
    setLoading(false);
  };

  // Icon mapping for each field
  const icons = {
    name: <FaUser className="input-icon" />,
    dob: <FaBirthdayCake className="input-icon" />,
    gender: <FaVenusMars className="input-icon" />,
    mobile: <FaPhone className="input-icon" />,
    email: <FaEnvelope className="input-icon" />,
    address: <FaMapMarkerAlt className="input-icon" />,
    city: <FaCity className="input-icon" />,
    state: <FaFlag className="input-icon" />,
    pin: <FaHashtag className="input-icon" />,
    blood: <FaTint className="input-icon" />,
    lastDonation: <FaCalendarAlt className="input-icon" />,
    platelets: <FaHeartbeat className="input-icon" />,
    donationCenter: <FaHospital className="input-icon" />,
    weight: <FaHashtag className="input-icon" />,
    healthy: <FaCheckCircle className="input-icon" />,
    chronic: <FaHeartbeat className="input-icon" />,
    medication: <FaPills className="input-icon" />,
    travel: <FaPlane className="input-icon" />,
    consent: <FaCheckCircle className="input-icon" />,
    contactConsent: <FaCheckCircle className="input-icon" />,
  };

  return (
    <main className="donor-main" style={{ minHeight: "100vh", background: "linear-gradient(120deg, #f7fafd 60%, #f3f6fb 100%)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2rem 0" }}>
      <section className="donor-section container" style={{ maxWidth: 900, width: "100%", margin: "40px auto", borderRadius: 18, boxShadow: "0 8px 30px var(--shadow)", background: "var(--bg-primary)", padding: "2.5rem 1.5rem 2rem 1.5rem" }}>
        <div className="section-header">
          <div className="section-title-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 className="section-title" style={{ color: "var(--primary)", fontWeight: 800, fontSize: "2.2rem", margin: "0 0 8px 0", textAlign: 'center' }}>Become a Donor</h2>
            <p className="section-subtitle" style={{ color: "var(--text-secondary)", margin: 0, fontSize: "1.08rem", fontWeight: 500, textAlign: "center" }}>Register to save lives. Your donation matters!</p>
          </div>
        </div>
        {/* Section Divider */}
        <div className="section-divider"></div>
        <form onSubmit={handleSubmit} autoComplete="off" className="donor-form">
          {/* Floating label + micro-interaction + animated placeholder for each field */}
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.name}
              <input type="text" id="fullName" ref={nameRef} required autoComplete="off" className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="fullName" className={inputValues["fullName"] ? "active" : ""}>Full Name *</label>
              {touched["fullName"] && valid["fullName"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="row">
            <div className="form-group icon-group floating-label">
              <div className="input-wrapper">
                {icons.dob}
                <input type="date" id="dob" ref={dobRef} required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
                <label htmlFor="dob" className={inputValues["dob"] ? "active" : ""}>Date of Birth *</label>
                {touched["dob"] && valid["dob"] && <FaCheckCircle className="valid-icon" />}
              </div>
            </div>
            <div className="form-group icon-group floating-label">
              <div className="input-wrapper">
                {icons.gender}
                <select id="gender" ref={genderRef} required className="input" onChange={handleInput} onBlur={handleInput} value={inputValues["gender"] || ""}>
                  <option value="" disabled hidden></option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
                <label htmlFor="gender" className={inputValues["gender"] ? "active" : ""}>Gender *</label>
                {touched["gender"] && valid["gender"] && <FaCheckCircle className="valid-icon" />}
              </div>
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.mobile}
              <input type="tel" id="mobile" ref={mobileRef} pattern="[0-9]{10,15}" required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="mobile" className={inputValues["mobile"] ? "active" : ""}>Mobile Number *</label>
              {touched["mobile"] && valid["mobile"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.email}
              <input type="email" id="email" ref={emailRef} required autoComplete="off" className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="email" className={inputValues["email"] ? "active" : ""}>Email Address *</label>
              {touched["email"] && valid["email"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.address}
              <textarea id="address" ref={addressRef} rows={2} required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="address" className={inputValues["address"] ? "active" : ""}>Address *</label>
              {touched["address"] && valid["address"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="row">
            <div className="form-group icon-group floating-label">
              <div className="input-wrapper">
                {icons.city}
                <input type="text" id="city" ref={cityRef} required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
                <label htmlFor="city" className={inputValues["city"] ? "active" : ""}>City *</label>
                {touched["city"] && valid["city"] && <FaCheckCircle className="valid-icon" />}
              </div>
            </div>
            <div className="form-group icon-group floating-label">
              <div className="input-wrapper">
                {icons.state}
                <input type="text" id="state" ref={stateRef} required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
                <label htmlFor="state" className={inputValues["state"] ? "active" : ""}>State *</label>
                {touched["state"] && valid["state"] && <FaCheckCircle className="valid-icon" />}
              </div>
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.pin}
              <input type="number" id="pin" ref={pinRef} required className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="pin" className={inputValues["pin"] ? "active" : ""}>Pin Code *</label>
              {touched["pin"] && valid["pin"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.blood}
              <select id="bloodGroup" ref={bloodGroupRef} required className="input" onChange={handleInput} onBlur={handleInput} value={inputValues["bloodGroup"] || ""}>
                <option value="" disabled hidden></option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
              <label htmlFor="bloodGroup" className={inputValues["bloodGroup"] ? "active" : ""}>Blood Group *</label>
              {touched["bloodGroup"] && valid["bloodGroup"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.lastDonation}
              <input type="date" id="lastDonation" ref={lastDonationRef} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="lastDonation" className={inputValues["lastDonation"] ? "active" : ""}>Last Donation Date</label>
              {touched["lastDonation"] && valid["lastDonation"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          {/* Section Divider */}
          <div className="section-divider"></div>
          <div className="checkbox-group icon-group">
            <input type="checkbox" id="platelets" ref={plateletsRef} onChange={handleInput} />
            <span className="input-wrapper">{icons.platelets}</span>
            <label htmlFor="platelets">Willing to donate platelets?</label>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.donationCenter}
              <input type="text" id="donationCenter" ref={donationCenterRef} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="donationCenter" className={inputValues["donationCenter"] ? "active" : ""}>Preferred Donation Center</label>
              {touched["donationCenter"] && valid["donationCenter"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.weight}
              <input type="number" id="weight" ref={weightRef} required min={35} max={200} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="weight" className={inputValues["weight"] ? "active" : ""}>Weight (kg) *</label>
              {touched["weight"] && valid["weight"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="checkbox-group icon-group">
            <input type="checkbox" id="healthy" ref={healthyRef} onChange={handleInput} />
            <span className="input-wrapper">{icons.healthy}</span>
            <label htmlFor="healthy">I am currently healthy</label>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.chronic}
              <input type="text" id="chronic" ref={chronicRef} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="chronic" className={inputValues["chronic"] ? "active" : ""}>Any chronic diseases? (If yes, specify)</label>
              {touched["chronic"] && valid["chronic"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.medication}
              <input type="text" id="medication" ref={medicationRef} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="medication" className={inputValues["medication"] ? "active" : ""}>On medication? (If yes, specify)</label>
              {touched["medication"] && valid["medication"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="form-group icon-group floating-label">
            <div className="input-wrapper">
              {icons.travel}
              <input type="text" id="travel" ref={travelRef} className="input" placeholder=" " onChange={handleInput} onBlur={handleInput} />
              <label htmlFor="travel" className={inputValues["travel"] ? "active" : ""}>Recent travel history? (If yes, specify)</label>
              {touched["travel"] && valid["travel"] && <FaCheckCircle className="valid-icon" />}
            </div>
          </div>
          <div className="checkbox-group icon-group">
            <input type="checkbox" id="consent" ref={consentRef} required onChange={handleInput} />
            <span className="input-wrapper">{icons.consent}</span>
            <label htmlFor="consent">I confirm the above information is accurate.</label>
          </div>
          <div className="checkbox-group icon-group">
            <input type="checkbox" id="contactConsent" ref={contactConsentRef} onChange={handleInput} />
            <span className="input-wrapper">{icons.contactConsent}</span>
            <label htmlFor="contactConsent">I agree to be contacted for donation opportunities.</label>
          </div>
          <button type="submit" className="btn btn-primary btn-hero submit-btn" style={{ width: "100%", marginTop: 16, position: 'relative' }} disabled={loading}>
            {loading ? <FaSpinner className="spinner" /> : "Submit"}
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
        .row {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1.2rem;
        }
        .row > .form-group {
          flex: 1;
          margin-bottom: 0;
        }
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