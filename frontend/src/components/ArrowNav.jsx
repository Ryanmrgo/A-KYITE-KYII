import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ArrowNav({ onOpenSearch, onOpenAuth }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Movies", to: "/movies" },
    { label: "TV Shows", to: "/tv" },
    { label: "Watchlist", to: "/favorites" },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 400,
        backgroundColor: scrolled ? "rgba(8, 8, 8, 0.94)" : "rgba(8, 8, 8, 0.8)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${scrolled ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.04)"}`,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "0 1.25rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* ── Left: Brand & Desktop Nav ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          {/* Brand Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              textDecoration: "none",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "38px",
                height: "38px",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #1f0406 0%, #0a0a0c 100%)",
                border: "1px solid rgba(229, 9, 20, 0.45)",
                boxShadow: "0 0 16px rgba(229, 9, 20, 0.35)",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {/* Aesthetic A-Kyite-Kyi Emblem */}
              <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
                <defs>
                  <linearGradient id="navBrandGrad" x1="0" y1="0" x2="32" y2="32">
                    <stop offset="0%" stopColor="#ff3344" />
                    <stop offset="50%" stopColor="#e50914" />
                    <stop offset="100%" stopColor="#8a0008" />
                  </linearGradient>
                </defs>
                <path d="M16 6 L7 25 L11.5 25 L16 14 Z" fill="url(#navBrandGrad)" />
                <path d="M16 6 L16 14 L20.5 25 L25 25 Z" fill="#b0050e" />
                <polygon points="14,13.5 19.5,17 14,20.5" fill="#ffffff" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              A-Kyite-<span style={{ color: "#e50914" }}>Kyii</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center" style={{ gap: "0.35rem" }}>
            {navLinks.map((item) => {
              const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    position: "relative",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
                    textDecoration: "none",
                    backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "#ffffff";
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "16px",
                        height: "2px",
                        borderRadius: "2px",
                        backgroundColor: "#e50914",
                        boxShadow: "0 0 8px rgba(229, 9, 20, 0.8)",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Right: Search Modal Trigger, Auth & Mobile Menu ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Quick Search Button (opens ArrowSearchModal) */}
          <button
            onClick={onOpenSearch}
            aria-label="Search movies and tv shows"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.09)",
              color: "rgba(255, 255, 255, 0.6)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.09)";
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="hidden sm:inline" style={{ fontSize: "0.82rem" }}>
              Search...
            </span>
            <span
              className="hidden sm:inline-flex items-center justify-center"
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "0.1rem 0.4rem",
                borderRadius: "5px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "rgba(255, 255, 255, 0.5)",
              }}
            >
              Ctrl+K
            </span>
          </button>

          {/* User Auth / Profile Dropdown */}
          {currentUser ? (
            <div style={{ position: "relative" }} ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                aria-label="User profile menu"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e50914 0%, #8b0000 100%)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    boxShadow: "0 2px 8px rgba(229, 9, 20, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {(currentUser.displayName || currentUser.email || "U").charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    right: 0,
                    width: "210px",
                    padding: "0.5rem",
                    borderRadius: "14px",
                    backgroundColor: "rgba(16, 16, 16, 0.98)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 16px 40px rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    zIndex: 500,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  <div
                    style={{
                      padding: "0.6rem 0.75rem",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentUser.displayName || "User"}
                    </p>
                    <p
                      style={{
                        margin: "0.15rem 0 0 0",
                        fontSize: "0.74rem",
                        color: "rgba(255, 255, 255, 0.5)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {currentUser.email}
                    </p>
                  </div>

                  <Link
                    to="/favorites"
                    onClick={() => setProfileMenuOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      color: "#ffffff",
                      fontSize: "0.84rem",
                      textDecoration: "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                    </svg>
                    My Watchlist
                  </Link>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      color: "#ff6b6b",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 75, 75, 0.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              style={{
                padding: "0.45rem 1.15rem",
                borderRadius: "9999px",
                background: "linear-gradient(135deg, #e50914 0%, #b80610 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "0.84rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(229, 9, 20, 0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(229, 9, 20, 0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(229, 9, 20, 0.35)";
              }}
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu (No floating overlay) ── */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden"
          style={{
            padding: "0.75rem 1.25rem 1.25rem",
            backgroundColor: "rgba(10, 10, 10, 0.98)",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
          }}
        >
          {navLinks.map((item) => {
            const isActive = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  padding: "0.65rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.92rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  backgroundColor: isActive ? "rgba(229, 9, 20, 0.15)" : "transparent",
                  borderLeft: isActive ? "3px solid #e50914" : "3px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
