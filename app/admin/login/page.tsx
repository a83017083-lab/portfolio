"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "password" | "enroll" | "totp";

interface SetupData {
  qr: string;
  manual: string;
  issuer: string;
  account: string;
}

export default function AdminLogin() {
  const [stage, setStage] = useState<Stage>("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.needEnroll) {
        const s = await fetch("/api/admin/totp/setup");
        const sd = await s.json().catch(() => ({}));
        if (s.ok && !sd.enrolled) {
          setSetup(sd);
          setStage("enroll");
        } else {
          setError("Could not start authenticator setup - try again.");
        }
      } else if (res.ok && data.needTotp) {
        setStage("totp");
      } else if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error || "Login failed.");
      }
    } catch {
      setError("Network issue - try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(data.error || "That code did not work.");
      }
    } catch {
      setError("Network issue - try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="aurora" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
      </div>

      {stage === "password" && (
        <form className="admin-login-card" onSubmit={submitPassword}>
          <h1>
            Admin<span style={{ color: "var(--accent-2)" }}>.</span>
          </h1>
          <p className="sub">Portfolio control panel - sign in to continue.</p>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              autoComplete="current-password"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy || !password}>
            {busy ? "Checking..." : "Sign in"}
          </button>
        </form>
      )}

      {stage === "enroll" && setup && (
        <form className="admin-login-card" onSubmit={submitCode}>
          <h1>
            Set up 2FA<span style={{ color: "var(--accent-2)" }}>.</span>
          </h1>
          <p className="sub">
            One-time setup: open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code.
          </p>
          <div style={{ background: "#fff", borderRadius: 12, padding: 12, width: "fit-content", margin: "4px auto" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qr} alt="Authenticator QR code" width={220} height={220} />
          </div>
          <p className="sub" style={{ textAlign: "center" }}>
            Can't scan? Add it manually - name: <strong>{setup.issuer}</strong> ({setup.account}), key:{" "}
            <code style={{ letterSpacing: 1, userSelect: "all" }}>{setup.manual}</code>
          </p>
          <label>
            Enter the 6-digit code from the app
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy || code.length !== 6}>
            {busy ? "Verifying..." : "Confirm & enable 2FA"}
          </button>
        </form>
      )}

      {stage === "totp" && (
        <form className="admin-login-card" onSubmit={submitCode}>
          <h1>
            Two-factor<span style={{ color: "var(--accent-2)" }}>.</span>
          </h1>
          <p className="sub">Enter the 6-digit code from your authenticator app.</p>
          <label>
            Code
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={busy || code.length !== 6}>
            {busy ? "Verifying..." : "Verify"}
          </button>
        </form>
      )}
    </div>
  );
}
