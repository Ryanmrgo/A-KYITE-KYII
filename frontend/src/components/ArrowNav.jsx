import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ArrowNav({ onOpenSearch, onOpenAuth }) {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    {
      id: "home",
      label: "Home",
      to: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      ),
    },
    {
      id: "search",
      label: "Search",
      action: onOpenSearch,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      ),
    },
    {
      id: "movies",
      label: "Movies",
      to: "/movies",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M7 4v16M17 4v16M2 12h20M2 8h5M17 8h5M2 16h5M17 16h5" />
        </svg>
      ),
    },
    {
      id: "tv",
      label: "TV Shows",
      to: "/tv",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <rect x="2" y="7" width="20" height="13" rx="2" />
          <path d="M16 3L12 7 8 3" />
        </svg>
      ),
    },
    {
      id: "favorites",
      label: "Watchlist",
      to: "/favorites",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      id: "profile",
      label: currentUser ? (currentUser.displayName || currentUser.email?.split("@")[0] || "Account") : "Sign In",
      action: onOpenAuth,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
          <circle cx="12" cy="8" r="4" />
          <path d="M5.5 20a6.5 6.5 0 0113 0" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Desktop Floating Left Dock (ArrowTV Style) ── */}
      <nav
        className="hidden md:flex flex-col items-center justify-between"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "68px",
          zIndex: 500,
          padding: "1.25rem 0",
          background: "linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.2) 80%, transparent 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Brand Arrow Logo */}
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, rgba(229,9,20,0.85) 0%, rgba(229,9,20,0.3) 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 20px rgba(229,9,20,0.4)",
            textDecoration: "none",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {/* ArrowTV Arrow Icon */}
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2L4 10h5v10h6V10h5L12 2z" transform="rotate(90 12 12)" />
          </svg>
        </Link>

        {/* Center Icons Stack */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          {navItems.map((item) => {
            const isActive = item.to ? pathname === item.to : false;
            const isHovered = hoveredItem === item.id;

            const buttonStyle = {
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "14px",
              background: isActive
                ? "rgba(255,255,255,0.14)"
                : isHovered
                ? "rgba(255,255,255,0.07)"
                : "transparent",
              color: isActive ? "#ffffff" : isHovered ? "#ffffff" : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: isActive ? "0 0 0 1px rgba(255,255,255,0.12) inset, 0 4px 12px rgba(0,0,0,0.5)" : "none",
              textDecoration: "none",
            };

            const content = (
              <>
                {item.icon}

                {/* ArrowTV Style Floating Tooltip */}
                {isHovered && (
                  <span
                    style={{
                      position: "absolute",
                      left: "calc(100% + 14px)",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(16,16,16,0.96)",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "6px 12px",
                      borderRadius: "8px",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      zIndex: 999,
                      animation: "fade-in-up 0.15s ease-out both",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </>
            );

            if (item.to) {
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  style={buttonStyle}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  aria-label={item.label}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                style={buttonStyle}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                aria-label={item.label}
              >
                {content}
              </button>
            );
          })}
        </div>

        {/* Bottom spacer for balance */}
        <div style={{ width: "44px", height: "44px" }} />
      </nav>

      {/* ── Mobile Floating Bottom Dock ── */}
      <nav
        className="md:hidden flex items-center justify-around"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          zIndex: 500,
          background: "rgba(8,8,8,0.92)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "0 0.5rem",
        }}
      >
        {navItems.map((item) => {
          const isActive = item.to ? pathname === item.to : false;
          const buttonStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
            color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
            transition: "all 0.2s ease",
          };

          if (item.to) {
            return (
              <Link key={item.id} to={item.to} style={buttonStyle}>
                {item.icon}
              </Link>
            );
          }

          return (
            <button key={item.id} onClick={item.action} style={buttonStyle}>
              {item.icon}
            </button>
          );
        })}
      </nav>
    </>
  );
}
