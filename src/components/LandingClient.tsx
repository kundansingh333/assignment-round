"use client";
import { FaBoxOpen, FaChartSimple, FaFlask, FaLock, FaMagnifyingGlass, FaMoneyBillWave, FaRocket, FaScaleBalanced, FaArrowDown } from 'react-icons/fa6';
import { useEffect, useState, useRef } from "react";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, hasAnimated]);

  return (
    <div ref={ref} style={{ fontSize: "2.25rem", fontWeight: 800 }}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

function FloatingOrb({ size, top, left, delay, color }: { size: number; top: string; left: string; delay: string; color: string }) {
  return (
    <div
      className="icon-float"
      style={{
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top,
        left,
        animationDelay: delay,
        pointerEvents: "none",
        opacity: 0.6,
        filter: "blur(1px)",
      }}
    />
  );
}

function AnimatedHeroSVG() {
  return (
    <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.15))' }}>
      <style>
        {`
          @keyframes dash { to { stroke-dashoffset: 0; } }
          @keyframes float-svg { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
          @keyframes pulse-svg { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
          @keyframes fill-up { 0% { height: 0; y: 250; } 100% { height: 120px; y: 110; } }
          @keyframes bubble-rise { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: translateY(-80px) scale(1.2); opacity: 0; } }
          
          .svg-float { animation: float-svg 6s ease-in-out infinite; }
          .svg-pulse { animation: pulse-svg 3s ease-in-out infinite; }
          .svg-path { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 3s ease-out forwards; }
          .svg-liquid { animation: fill-up 2s ease-out forwards; }
          .svg-bubble { animation: bubble-rise 2.5s infinite ease-in; }
          .d1 { animation-delay: 0s; }
          .d2 { animation-delay: 0.8s; }
          .d3 { animation-delay: 1.6s; }
        `}
      </style>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        {/* Expanded filter bounds to prevent clipping (sharp edges) */}
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Tech Elements */}
      <g className="svg-float" opacity="0.6">
        <circle cx="250" cy="250" r="180" fill="none" stroke="var(--accent-primary)" opacity="0.2" strokeWidth="2" strokeDasharray="10 10" className="svg-pulse" style={{ transformOrigin: '250px 250px' }} />
        <circle cx="250" cy="250" r="140" fill="none" stroke="var(--accent-info)" opacity="0.2" strokeWidth="1" />
        <path d="M 50 250 L 450 250 M 250 50 L 250 450" stroke="var(--border-primary)" strokeWidth="1.5" />
      </g>

      {/* Main Composition */}
      <g className="svg-float">
        {/* Chart Background */}
        <rect x="200" y="80" width="240" height="160" rx="12" fill="var(--bg-secondary)" stroke="var(--border-primary)" strokeWidth="2" />
        {/* Chart Lines */}
        <path d="M 220 200 L 260 150 L 300 170 L 340 120 L 400 140" fill="none" stroke="url(#grad2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="svg-path" filter="url(#glow)" />
        
        {/* Animated Data Bars */}
        <rect x="230" y="210" width="12" height="0" fill="#3b82f6" rx="3">
           <animate attributeName="height" from="0" to="50" dur="1s" fill="freeze" begin="0.5s" />
           <animate attributeName="y" from="210" to="160" dur="1s" fill="freeze" begin="0.5s" />
        </rect>
        <rect x="260" y="210" width="12" height="0" fill="#8b5cf6" rx="3">
           <animate attributeName="height" from="0" to="80" dur="1s" fill="freeze" begin="0.7s" />
           <animate attributeName="y" from="210" to="130" dur="1s" fill="freeze" begin="0.7s" />
        </rect>
        <rect x="290" y="210" width="12" height="0" fill="#10b981" rx="3">
           <animate attributeName="height" from="0" to="100" dur="1s" fill="freeze" begin="0.9s" />
           <animate attributeName="y" from="210" to="110" dur="1s" fill="freeze" begin="0.9s" />
        </rect>
        <rect x="320" y="210" width="12" height="0" fill="#ec4899" rx="3">
           <animate attributeName="height" from="0" to="60" dur="1s" fill="freeze" begin="1.1s" />
           <animate attributeName="y" from="210" to="150" dur="1s" fill="freeze" begin="1.1s" />
        </rect>

        {/* Central Chemistry Flask */}
        <g transform="translate(60, 150)">
          {/* Flask Glass */}
          <path d="M 80 20 L 120 20 L 120 80 L 170 180 A 20 20 0 0 1 150 210 L 50 210 A 20 20 0 0 1 30 180 L 80 80 Z" fill="var(--glass-bg)" stroke="var(--border-secondary)" strokeWidth="4" />
          
          {/* Liquid inside Flask */}
          <clipPath id="flaskClip">
            <path d="M 80 20 L 120 20 L 120 80 L 170 180 A 20 20 0 0 1 150 210 L 50 210 A 20 20 0 0 1 30 180 L 80 80 Z" />
          </clipPath>
          <rect x="0" y="250" width="200" height="0" fill="url(#grad1)" clipPath="url(#flaskClip)" className="svg-liquid" />
          
          {/* Bubbles */}
          <circle cx="100" cy="180" r="8" fill="rgba(255,255,255,0.9)" className="svg-bubble d1" />
          <circle cx="120" cy="190" r="5" fill="rgba(255,255,255,0.9)" className="svg-bubble d2" />
          <circle cx="80" cy="170" r="10" fill="rgba(255,255,255,0.9)" className="svg-bubble d3" />
          <circle cx="110" cy="200" r="6" fill="rgba(255,255,255,0.9)" className="svg-bubble d1" style={{ animationDelay: '1.2s' }} />
        </g>
        
        {/* Floating Data Nodes */}
        <g transform="translate(340, 260)">
          <g className="svg-pulse" style={{ transformOrigin: '40px 40px' }}>
            <circle cx="40" cy="40" r="35" fill="var(--bg-elevated)" stroke="#10b981" strokeWidth="2" filter="url(#glow)" />
            <text x="40" y="46" fill="#10b981" fontSize="20" fontWeight="bold" textAnchor="middle">99%</text>
          </g>
        </g>
      </g>
    </svg>
  );
}

export function LandingClient() {
  const [scrolled, setScrolled] = useState(false);
  const featuresRef = useRef<HTMLElement>(null);
  const [featuresVisible, setFeaturesVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setFeaturesVisible(true);
      },
      { threshold: 0.1 }
    );
    if (featuresRef.current) observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: <FaScaleBalanced />, title: "Smart Unit Conversion", desc: "Seamlessly convert between grams, kilograms, liters, milliliters, and units. All calculations are precise to 6 decimal places." },
    { icon: <FaMoneyBillWave />, title: "INR Pricing Engine", desc: "Automatic price calculation based on quantity and unit selection. Supports high-precision decimal values for accurate chemical pricing." },
    { icon: <FaBoxOpen />, title: "Order Management", desc: "Full quotation-to-delivery workflow with status tracking. Admins can review orders with complete conversion breakdowns." },
    { icon: <FaLock />, title: "Role-Based Access", desc: "Three distinct roles — Admin, Seller, and Buyer — each with tailored dashboards and permissions." },
    { icon: <FaMagnifyingGlass />, title: "Smart Search & Filter", desc: "Find products instantly with full-text search, category filters, dimension filters, and price sorting." },
    { icon: <FaChartSimple />, title: "Inventory Analytics", desc: "Real-time stock levels, low-stock alerts, and revenue tracking on the admin dashboard." },
  ];

  return (
    <div>
      {/* Navigation */}
      <nav className="landing-nav" style={{
        boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.1)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
      }}>
        <span className="logo"><FaFlask className="icon-inline" /> AasaMedChem</span>
        <div className="nav-links">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost">Sign In</Link>
          <Link href="/register" className="btn btn-primary btn-ripple">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-hero" style={{ padding: "120px 5% 80px", alignItems: "center" }}>
        {/* Floating decorative orbs */}
        <FloatingOrb size={120} top="15%" left="10%" delay="0s" color="rgba(59, 130, 246, 0.15)" />
        <FloatingOrb size={80} top="60%" left="80%" delay="2s" color="rgba(139, 92, 246, 0.12)" />
        <FloatingOrb size={60} top="30%" left="75%" delay="4s" color="rgba(16, 185, 129, 0.1)" />
        <FloatingOrb size={100} top="70%" left="20%" delay="1s" color="rgba(236, 72, 153, 0.08)" />
        <FloatingOrb size={40} top="20%" left="50%" delay="3s" color="rgba(59, 130, 246, 0.12)" />

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "64px",
          alignItems: "center",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          textAlign: "left"
        }}>
          {/* Left Column: Text */}
          <div className="animate-in stagger-1">
            <h1 style={{ fontSize: "3.5rem", lineHeight: 1.1, marginBottom: "24px", fontWeight: 800 }}>
              Precision Inventory for<br />
              <span className="highlight" style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradientShift 4s ease infinite"
              }}>Chemical Excellence</span>
            </h1>
            <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", marginBottom: "40px", maxWidth: "540px", lineHeight: 1.6 }}>
              Manage your lab inventory with exact unit conversions, smart quotations, 
              and real-time order tracking. Built for chemical suppliers who demand accuracy.
            </p>
            <div className="cta-group" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/register" className="btn btn-primary btn-lg btn-ripple">
                <FaRocket className="icon-inline" /> Start Free
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Sign In →
              </Link>
            </div>
          </div>

          {/* Right Column: Animated SVG */}
          <div className="animate-in stagger-3">
            <AnimatedHeroSVG />
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          animation: "float 2s ease-in-out infinite",
          opacity: 0.5,
          cursor: "pointer",
        }}
          onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
        >
          <FaArrowDown style={{ fontSize: "1.2rem", color: "var(--text-tertiary)" }} />
        </div>
      </section>

      {/* Trust Section */}
      <section style={{
        display: "flex",
        justifyContent: "center",
        gap: "64px",
        padding: "48px 24px",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-primary)",
        borderBottom: "1px solid var(--border-primary)",
        flexWrap: "wrap",
      }}>
        {[
          { value: 500, suffix: "+", label: "Chemical Products" },
          { value: 99, suffix: "%", label: "Calculation Accuracy" },
          { value: 3, suffix: "", label: "User Roles" },
          { value: 24, suffix: "/7", label: "Real-time Tracking" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center", minWidth: "140px" }}>
            <div style={{ color: "var(--accent-primary)" }}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "4px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section ref={featuresRef} className="landing-features">
        {features.map((feature, i) => (
          <div
            key={i}
            className="feature-card card card-shine"
            style={{
              animation: featuresVisible
                ? `cardEntrance 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100}ms both`
                : "none",
              opacity: featuresVisible ? undefined : 0,
            }}
          >
            <div className="icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={{
        textAlign: "center",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{
          fontSize: "2rem",
          fontWeight: 800,
          marginBottom: "16px",
          position: "relative",
        }}>
          Ready to streamline your inventory?
        </h2>
        <p style={{
          color: "var(--text-secondary)",
          fontSize: "1.1rem",
          maxWidth: "500px",
          margin: "0 auto 32px",
          position: "relative",
        }}>
          Join AasaMedChem today and experience precision chemical inventory management.
        </p>
        <Link href="/register" className="btn btn-primary btn-lg btn-ripple" style={{ position: "relative" }}>
          <FaRocket className="icon-inline" /> Get Started for Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: "center", 
        padding: "48px 24px", 
        color: "var(--text-tertiary)",
        fontSize: "0.85rem",
        borderTop: "1px solid var(--border-primary)",
        position: "relative",
      }}>
        <p><FaFlask className="icon-inline" /> AasaMedChem — Inventory & Order Management System</p>
        <p style={{ marginTop: "8px" }}>
          Built with Next.js 15 · Neon PostgreSQL · Drizzle ORM
        </p>
      </footer>
    </div>
  );
}
