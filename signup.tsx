"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Swal from "sweetalert2";

const supabase = createClient(
  "https://vwdbpnlqxzgazmjtvqmm.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZGJwbmxxeHpnYXptanR2cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTU1MTQsImV4cCI6MjA2NTM3MTUxNH0.QjXJr02tUbE2DWHcqoXVwW-XcDgAbTFDWtqhn6dDuVI"
);

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  bloodType?: string;
  role?: string;
  dob?: string;
  gender?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [emailSuggestion, setEmailSuggestion] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordStrengthText, setPasswordStrengthText] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength logic
  function checkPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    setPasswordStrength(score);
    if (score === 0) setPasswordStrengthText("");
    else if (score === 1) setPasswordStrengthText("Weak");
    else if (score === 2) setPasswordStrengthText("Fair");
    else if (score === 3) setPasswordStrengthText("Good");
    else if (score === 4) setPasswordStrengthText("Strong");
  }

  // Email suggestion logic (simple version)
  function suggestEmail(email: string) {
    if (email.endsWith("@gamil.com")) setEmailSuggestion(email.replace("gamil", "gmail"));
    else setEmailSuggestion("");
  }

  // Validation
  function validate() {
    const errs: FormErrors = {};
    if (!fullName.trim()) errs.fullName = "Please enter your full name";
    if (!/^\d{10,15}$/.test(phone)) errs.phone = "Please enter a valid phone number";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Please enter a valid email address";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!dob) errs.dob = "Please select your date of birth";
    if (!gender) errs.gender = "Please select your gender";
    if (!bloodType) errs.bloodType = "Please select your blood type";
    if (!role) errs.role = "Please select your role";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      Swal.fire({
        icon: "error",
        title: "Invalid Form",
        text: "Please correct the errors before submitting.",
        confirmButtonColor: "#e53935",
      });
      return;
    }
    setLoading(true);
    // Check if email already exists in profiles table
    const { data: existing, error: existingError } = await supabase.from("profiles").select("id").eq("email", email).single();
    if (existing) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Email Already Used",
        text: "This email is already registered. Please use another email.",
        confirmButtonColor: "#e53935",
      });
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message,
        confirmButtonColor: "#e53935",
      });
      return;
    }
    // Insert profile
    let userId = data?.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          email,
          fullName: fullName,
          phone,
          dob,
          gender,
          role,
          bloodType: bloodType,
          is_admin: role === "admin",
        },
      ]);
      if (profileError) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Profile Error",
          text: profileError.message,
          confirmButtonColor: "#e53935",
        });
        return;
      }
    }
    setLoading(false);
    Swal.fire({
      icon: "success",
      title: "Signup Successful!",
      text: "Your account has been created. Redirecting...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      router.push("/login");
    });
  }

  return (
    <div className="main-content">
      <div className="signup-container">
        <div className="signup-header">
          <h2>🩸 Create Your Account</h2>
          <p>Join our community to save lives</p>
        </div>
        <form id="signupForm" onSubmit={handleSubmit} autoComplete="on">
          <div className="form-group">
            <label htmlFor="fullName">👤 Full Name</label>
            <input
              type="text"
              className={`form-control${errors.fullName ? " is-invalid" : ""}`}
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="phone">📞 Phone Number</label>
            <input
              type="tel"
              className={`form-control${errors.phone ? " is-invalid" : ""}`}
              id="phone"
              placeholder="Enter your phone number"
              pattern="[0-9]{10,15}"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="dob">🎂 Date of Birth</label>
            <input
              type="date"
              className={`form-control${errors.dob ? " is-invalid" : ""}`}
              id="dob"
              value={dob}
              onChange={e => setDob(e.target.value)}
              required
            />
            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="gender">⚧️ Gender</label>
            <select
              className={`form-control${errors.gender ? " is-invalid" : ""}`}
              id="gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              required
            >
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="email">📧 Email Address</label>
            <input
              type="email"
              className={`form-control${errors.email ? " is-invalid" : ""}`}
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                suggestEmail(e.target.value);
              }}
              required
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            {emailSuggestion && (
              <div className="email-suggestion">
                Did you mean <a href="#" onClick={e => { e.preventDefault(); setEmail(emailSuggestion); setEmailSuggestion(""); }}> {emailSuggestion} </a>?
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className={`form-control${errors.password ? " is-invalid" : ""}`}
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
              required
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            <div className="password-strength">
              <div
                className="password-strength-meter"
                style={{
                  width: `${passwordStrength * 25}%`,
                  background:
                    passwordStrength === 1
                      ? "#e53935"
                      : passwordStrength === 2
                      ? "#ffb300"
                      : passwordStrength === 3
                      ? "#43a047"
                      : passwordStrength === 4
                      ? "#1976d2"
                      : "#eee",
                }}
              ></div>
            </div>
            {passwordStrengthText && (
              <div className="password-strength-text">{passwordStrengthText}</div>
            )}
            <span
              style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', fontSize: 18 }}
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
            >
              {showPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">🔐 Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            <span
              style={{ position: 'absolute', right: 12, top: 38, cursor: 'pointer', fontSize: 18 }}
              onClick={() => setShowConfirmPassword(v => !v)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowConfirmPassword(v => !v); }}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </span>
          </div>
          <div className="form-group">
            <label htmlFor="bloodType">🩸 Blood Type</label>
            <select
              className={`form-control${errors.bloodType ? " is-invalid" : ""}`}
              id="bloodType"
              value={bloodType}
              onChange={e => setBloodType(e.target.value)}
              required
            >
              <option value="" disabled>
                Select your blood type
              </option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.bloodType && <div className="invalid-feedback">{errors.bloodType}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="role">👥 Role</label>
            <select
              className={`form-control${errors.role ? " is-invalid" : ""}`}
              id="role"
              value={role}
              onChange={e => {
                setRole(e.target.value);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('intendedRole', e.target.value);
                }
              }}
              required
            >
              <option value="user">User</option>
              <option value="hospital_staff">Hospital Staff</option>
              <option value="blood_bank_admin">Blood Bank Admin</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <div className="invalid-feedback">{errors.role}</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button type="submit" className="btn-signup" disabled={loading} style={{ width: '100%' }}>
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
              <div className="divider" style={{ textAlign: 'center', margin: '20px 0 12px 0', width: '100%' }}>
                <span style={{ display: 'block', fontWeight: 500, color: '#888', fontSize: '1rem', letterSpacing: '0.5px', width: '100%' }}>or sign up with</span>
              </div>
            </div>
          </div>
        </form>
        <div className="social-login">
          <div className="social-btn google-btn">
            G Google
          </div>
          <div className="social-btn facebook-btn">
            f Facebook
          </div>
        </div>
        <div className="signup-options">
          <p>
            Already have an account? <a href="/login">Log In</a>
          </p>
        </div>
        <div className="form-footer">
          <p>
            By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
} 