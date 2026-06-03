"use client";
import { FaFlask, FaVial } from 'react-icons/fa6';


import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="auth-container">
      <div className="auth-card page-enter">
        <div style={{ position: "absolute", top: "20px", right: "20px" }}>
          <ThemeToggle />
        </div>

        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "2.5rem" }}><FaFlask /></span>
        </div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your AasaMedChem account</p>

        {/* Google Auth */}
        <button className="btn-google" onClick={handleGoogleSignIn} type="button">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider">or continue with email</div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: "10px 14px",
              background: "var(--accent-danger-light)",
              color: "var(--accent-danger)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              fontWeight: 500,
              marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? <span className="spinner" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link href="/register">Create one</Link>
        </p>

        {/* Test Credentials */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "var(--bg-tertiary)",
          borderRadius: "var(--radius-md)",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}>
          <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "8px" }}>
            <FaVial className="icon-inline" /> Test Credentials
          </strong>
          <div style={{ display: "grid", gap: "4px", fontFamily: "monospace" }}>
            <span>Admin: admin@asamedchem.com / Admin@123</span>
            <span>Seller: seller@asamedchem.com / Seller@123</span>
            <span>Buyer: buyer@asamedchem.com / Buyer@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
