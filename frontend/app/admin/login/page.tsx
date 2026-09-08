"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Admin credentials stored in .env.local (frontend-only)
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@store.com";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@1234";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already admin-logged in, redirect to dashboard
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    if (isAdmin) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate a small delay for UX
    await new Promise((r) => setTimeout(r, 600));

    try {
      // Frontend-only credential check
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        // Store admin session in localStorage
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", email.trim().toLowerCase());
        router.push("/admin");
      } else {
        setError("Invalid admin credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="admin-login-container">
        {/* Brand */}
        <div className="admin-login-brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Admin Console</h1>
            <p className="brand-subtitle">E-Commerce Management System</p>
          </div>
        </div>

        {/* Card */}
        <div className="admin-login-card">
          <div className="card-header">
            <h2>Administrator Login</h2>
            <p>Sign in with your admin credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="error-alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="admin-email">Email Address</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10,17 15,12 10,7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In to Admin
                </>
              )}
            </button>
          </form>

          <div className="card-footer">
            <Link href="/" className="back-to-store">
              ← Back to Store
            </Link>
          </div>
        </div>

        <p className="security-note">
          🔒 This area is restricted to authorized administrators only
        </p>
      </div>

      <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f1e;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .admin-login-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.15;
          animation: float 8s ease-in-out infinite;
        }
        .blob-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #3b82f6, #1e40af);
          top: -100px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #6366f1, #4338ca);
          bottom: -100px; right: -50px;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #06b6d4, #0e7490);
          top: 50%; left: 60%;
          animation-delay: -6s;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        .admin-login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
        }
        .admin-login-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          color: white;
        }
        .brand-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          padding: 12px;
          box-shadow: 0 8px 32px rgba(99,102,241,0.4);
        }
        .brand-icon svg { width: 100%; height: 100%; color: white; }
        .brand-title {
          font-size: 22px; font-weight: 800;
          color: white; letter-spacing: -0.5px; margin: 0;
        }
        .brand-subtitle {
          font-size: 12px; color: #64748b; margin: 2px 0 0; font-weight: 500;
        }
        .admin-login-card {
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 36px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
        }
        .card-header { margin-bottom: 28px; text-align: center; }
        .card-header h2 {
          font-size: 22px; font-weight: 700;
          color: #f1f5f9; margin: 0 0 6px; letter-spacing: -0.3px;
        }
        .card-header p { font-size: 13px; color: #64748b; margin: 0; }
        .admin-login-form { display: flex; flex-direction: column; gap: 18px; }
        .error-alert {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 12px; color: #fca5a5;
          font-size: 13px; font-weight: 500;
        }
        .error-alert svg { width: 18px; height: 18px; flex-shrink: 0; color: #ef4444; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: #94a3b8; letter-spacing: 0.3px; }
        .input-wrapper { position: relative; display: flex; align-items: center; }
        .input-icon {
          position: absolute; left: 14px;
          width: 16px; height: 16px;
          color: #475569; pointer-events: none; flex-shrink: 0;
        }
        .input-wrapper input {
          width: 100%;
          padding: 13px 46px 13px 42px;
          background: rgba(30,41,59,0.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; color: #e2e8f0;
          font-size: 14px; font-family: inherit; outline: none;
          transition: all 0.2s ease;
        }
        .input-wrapper input:focus {
          border-color: rgba(99,102,241,0.6);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
          background: rgba(30,41,59,1);
        }
        .input-wrapper input::placeholder { color: #475569; }
        .toggle-password {
          position: absolute; right: 14px;
          background: none; border: none; cursor: pointer; padding: 0;
          display: flex; align-items: center;
        }
        .toggle-password svg { width: 17px; height: 17px; color: #475569; transition: color 0.2s; }
        .toggle-password:hover svg { color: #94a3b8; }
        .admin-login-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          color: white; font-size: 15px; font-weight: 700;
          font-family: inherit; border: none; border-radius: 12px;
          cursor: pointer; transition: all 0.2s ease; margin-top: 6px;
          box-shadow: 0 4px 20px rgba(99,102,241,0.35); letter-spacing: 0.2px;
        }
        .admin-login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.5);
          background: linear-gradient(135deg, #2563eb, #4f46e5);
        }
        .admin-login-btn:active:not(:disabled) { transform: translateY(0); }
        .admin-login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .admin-login-btn svg { width: 18px; height: 18px; }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.8s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .card-footer { margin-top: 20px; text-align: center; }
        .back-to-store {
          font-size: 13px; color: #64748b;
          text-decoration: none; font-weight: 500; transition: color 0.2s;
        }
        .back-to-store:hover { color: #94a3b8; }
        .security-note { font-size: 12px; color: #334155; text-align: center; margin: 0; }
      `}</style>
    </div>
  );
}
