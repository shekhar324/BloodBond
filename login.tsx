"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../utils/supabaseClient";
import React from 'react';

const countryCodes = [
  { code: "+91", label: "India" },
  { code: "+1", label: "USA" },
  { code: "+44", label: "UK" },
  // Add more as needed
];

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  // Mobile login modal state
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [mobileLoading, setMobileLoading] = useState(false);
  // OTP step state
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digits
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError("Login failed: No user returned.");
      setLoading(false);
      return;
    }
    // Fetch user role
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) {
      setError("Your account is not set up correctly. Please contact an administrator.");
      setLoading(false);
      return;
    }
    setSuccess("Login successful! Redirecting...");
    setLoading(false);
    setTimeout(() => {
      let intendedRole = null;
      if (typeof window !== 'undefined') {
        intendedRole = localStorage.getItem('intendedRole');
      }
      let redirectPath = "/dashboard";
      console.log("[DEBUG] Profile for redirect:", profile);
      if (intendedRole === "admin" || profile?.role === "admin") {
        redirectPath = "/admin-post-login";
      } else if (intendedRole === "hospital_staff" || profile?.role === "hospital_staff") {
        redirectPath = "/hospital-staff-post-login";
      } else if (intendedRole === "blood_bank_admin" || profile?.role === "blood_bank_admin") {
        redirectPath = "/blood-bank-admin-post-login";
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('intendedRole');
      }
      console.log("[DEBUG] Redirecting to:", redirectPath);
      router.push(redirectPath);
    }, 500);
  }

  async function handleResetPassword() {
    setResetMsg(null);
    if (!resetEmail) {
      setResetMsg("Please enter your email.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) setResetMsg(error.message);
    else setResetMsg("Password reset link sent! Check your email.");
  }

  // Handle phone number submit
  async function handleMobileContinue(e: React.FormEvent) {
    e.preventDefault();
    setMobileError("");
    setMobileLoading(true);
    setOtpSentMsg("");
    // Basic validation
    if (!mobile.match(/^\d{8,15}$/)) {
      setMobileError("Enter a valid mobile number.");
      setMobileLoading(false);
      return;
    }
    // Send OTP via Supabase
    const { error } = await supabase.auth.signInWithOtp({ phone: countryCode + mobile });
    if (error) {
      setMobileError(error.message);
      setMobileLoading(false);
      return;
    }
    setMobileLoading(false);
    setOtpSentMsg(`We have sent you an SMS with a code to number ${countryCode} ${mobile}`);
    setStep('otp');
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
  }

  // Handle OTP input
  function handleOtpChange(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < otp.length - 1) {
      const next = document.getElementById(`otp-input-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  }

  // Handle OTP submit
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOtpError("");
    setOtpLoading(true);
    const code = otp.join("");
    if (code.length < 4) {
      setOtpError("Please enter the full code.");
      setOtpLoading(false);
      return;
    }
    // Verify OTP via Supabase
    const { data, error } = await supabase.auth.verifyOtp({ phone: countryCode + mobile, token: code, type: 'sms' });
    if (error) {
      setOtpError(error.message);
      setOtpLoading(false);
      return;
    }
    if (!data.user) {
      setOtpError("Login failed: No user returned.");
      setOtpLoading(false);
      return;
    }
    // Fetch user role and redirect (same as email login)
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, phone")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) {
      setOtpError("Your account is not set up correctly. Please contact an administrator.");
      setOtpLoading(false);
      return;
    }
    setOtpLoading(false);
    setShowMobileModal(false);
    setStep('phone');
    setOtp(['', '', '', '', '', '']);
    // Redirect
    let intendedRole = null;
    if (typeof window !== 'undefined') {
      intendedRole = localStorage.getItem('intendedRole');
    }
    let redirectPath = "/dashboard";
    console.log("[DEBUG] Profile for redirect:", profile);
    if (intendedRole === "admin" || profile?.role === "admin") {
      redirectPath = "/admin-post-login";
    } else if (intendedRole === "hospital_staff" || profile?.role === "hospital_staff") {
      redirectPath = "/hospital-staff-post-login";
    } else if (intendedRole === "blood_bank_admin" || profile?.role === "blood_bank_admin") {
      redirectPath = "/blood-bank-admin-post-login";
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('intendedRole');
    }
    console.log("[DEBUG] Redirecting to:", redirectPath);
    router.push(redirectPath);
  }

  // Resend OTP logic
  async function handleResendOtp() {
    setOtpError("");
    setOtpLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: countryCode + mobile });
    if (error) {
      setOtpError(error.message);
      setOtpLoading(false);
      return;
    }
    setOtpLoading(false);
    setResendTimer(30);
  }

  // Timer effect
  React.useEffect(() => {
    if (step === 'otp' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  if (showMobileModal) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255, 235, 238, 0.97)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400, width: '90vw', borderRadius: 24, background: '#fff', boxShadow: '0 8px 32px #e5393533', padding: 36, position: 'relative', margin: '0 auto', zIndex: 10000, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '3px solid #e53935', alignItems: 'center' }}>
          <button style={{ background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 8, padding: '8px 22px', border: 'none', position: 'absolute', right: 18, top: 18, cursor: 'pointer' }} onClick={() => setShowMobileModal(false)}>
            Close
          </button>
          <div style={{ width: '100%', marginTop: 12 }}>
            {step === 'phone' && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 64, height: 64, background: '#fbe9e7', borderRadius: '50%', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 32, color: '#e53935' }}>🩸</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 22, color: '#222', marginBottom: 6, letterSpacing: 0.5 }}>Verify your phone number</h3>
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>Please confirm your country code and enter your phone number</div>
                </div>
                <form onSubmit={handleMobileContinue} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)} style={{ padding: '12px 10px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 16, minWidth: 80, background: '#fafafa' }}>
                      {countryCodes.map(c => <option key={c.code} value={c.code}>{c.code} ({c.label})</option>)}
                    </select>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="Mobile number"
                      style={{ flex: 1, padding: 12, borderRadius: 8, border: '1.5px solid #e0e0e0', fontSize: 16, background: '#fafafa' }}
                      required
                      maxLength={15}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </div>
                  {mobileError && <div style={{ color: '#e53935', fontWeight: 600, marginBottom: 4 }}>{mobileError}</div>}
                  <button type="submit" disabled={mobileLoading} style={{ background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 8, padding: '14px 0', marginTop: 8, letterSpacing: 1, border: 'none', transition: 'background 0.2s', width: '100%' }}>
                    {mobileLoading ? 'Please wait...' : 'Next'}
                  </button>
                </form>
                {otpSentMsg && <div style={{ color: '#888', fontSize: 14, marginTop: 12, textAlign: 'center' }}>{otpSentMsg}</div>}
              </div>
            )}
            {step === 'otp' && (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontWeight: 800, fontSize: 22, color: '#222', marginBottom: 6, letterSpacing: 0.5 }}>Phone Verification</h3>
                  <div style={{ color: '#888', fontSize: 15, marginBottom: 18, textAlign: 'center' }}>Enter your OTP code here</div>
                </div>
                <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(idx, e.target.value)}
                        style={{ width: 48, height: 56, fontSize: 28, textAlign: 'center', border: '2px solid #e53935', borderRadius: 10, background: '#fbe9e7', color: '#e53935', fontWeight: 700, outline: 'none', boxShadow: '0 2px 8px #e5393522', transition: 'border 0.2s' }}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>
                  {otpError && <div style={{ color: '#e53935', fontWeight: 600, marginBottom: 4 }}>{otpError}</div>}
                  <button type="submit" disabled={otpLoading} style={{ background: '#e53935', color: '#fff', fontWeight: 700, fontSize: 18, borderRadius: 8, padding: '14px 0', marginTop: 8, letterSpacing: 1, border: 'none', transition: 'background 0.2s', width: 180 }}>
                    {otpLoading ? 'Verifying...' : 'Verify'}
                  </button>
                </form>
                <div style={{ marginTop: 18, textAlign: 'center', color: '#888', fontSize: 14 }}>
                  {resendTimer > 0 ? (
                    <>Resend code in <span style={{ color: '#e53935', fontWeight: 700 }}>{resendTimer}s</span></>
                  ) : (
                    <span style={{ color: '#e53935', cursor: 'pointer', fontWeight: 700 }} onClick={handleResendOtp}>Resend a new code.</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main login container, dimmed if modal is open */}
      <div className="auth-container" style={showMobileModal ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 } : {}}>
        <div className="auth-header">
          <div className="logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1>🩸 BloodBond</h1>
          </div>
          <p>Sign in to your account to continue</p>
        </div>
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          <form onSubmit={handleLogin} autoComplete="on">
            <div className="input-group">
              <span className="input-group-text">📧</span>
              <input type="email" className="form-control" ref={emailRef} placeholder="Email address" required autoComplete="email" />
            </div>
            <div className="input-group">
              <span className="input-group-text">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                ref={passwordRef}
                placeholder="Password"
                required
                autoComplete="current-password"
                style={{ paddingRight: 36 }}
              />
              <span
                style={{ position: 'absolute', right: 12, top: 10, cursor: 'pointer', fontSize: 18 }}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(v => !v); }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            <div className="input-group-text input-group-remember">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" ref={rememberRef} id="rememberMe" />
                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button type="submit" className="btn-login" disabled={loading} style={{ maxWidth: 320, width: '100%' }}>
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </div>
            <div className="login-options">
              <a href="#" style={{ color: 'var(--primary)' }} onClick={e => { e.preventDefault(); setShowForgot(true); }}>Forgot password?</a>
              <a href="/signup" style={{ color: 'var(--primary)' }}>Create account</a>
            </div>
          </form>
          {error && <div className="custom-alert alert-danger" style={{ marginTop: 16 }}>{error}</div>}
          {success && <div className="custom-alert alert-success" style={{ marginTop: 16 }}>{success}</div>}
          {/* New: Connect with Phone Number button */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <button
              type="button"
              className="btn-login"
              style={{
                background: 'linear-gradient(90deg, #e53935 0%, #fbb6b6 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16, // smaller font
                borderRadius: 10, // smaller radius
                padding: '10px 0', // less padding
                width: '100%',
                maxWidth: 280, // a bit narrower
                boxShadow: '0 4px 16px #e5393533',
                letterSpacing: 1,
                border: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 32px #e5393533'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px #e5393533'; }}
              onClick={() => setShowMobileModal(true)}
            >
              Connect with Phone Number
            </button>
          </div>
        </div>
        <div className="divider">
          <div className="divider-line"></div>
          <div className="divider-text">or sign in with</div>
          <div className="divider-line"></div>
        </div>
        <div className="social-login">
          <div className="social-btn google" title="Google">G</div>
          <div className="social-btn facebook" title="Facebook">f</div>
          <div className="social-btn apple" title="Apple">🍎</div>
          <div className="social-btn twitter" title="Twitter">𝕏</div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-backdrop show" onClick={() => setShowForgot(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Password</h3>
              <button className="modal-close" onClick={() => setShowForgot(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Enter your email address and we'll send you a link to reset your password.</p>
              <div className="input-group mt-3">
                <span className="input-group-text">📧</span>
                <input type="email" className="form-control" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="Email address" required />
              </div>
              {resetMsg && <div style={{ marginTop: 8, color: resetMsg.includes('sent') ? '#43a047' : '#e53935' }}>{resetMsg}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-secondary" onClick={() => setShowForgot(false)}>Cancel</button>
              <button className="modal-btn modal-btn-primary" onClick={e => { e.preventDefault(); handleResetPassword(); }}>Send Reset Link</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 