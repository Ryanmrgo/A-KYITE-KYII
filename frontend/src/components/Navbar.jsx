import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSearch, posterUrl } from "../hooks/useTmdb";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";

const S = {
  red: "#e50914",
  bg: "rgba(19,19,19,0.85)",
  surface: "#1a1a1a",
  border: "#2a2a2a",
  text: "#e5e2e1",
  muted: "#9ca3af",
  faint: "#6b7280",
};

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [greetingIndex, setGreetingIndex] = useState(0);
  
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

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

  // Track scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Loop animated text
  useEffect(() => {
    if (!currentUser || scrolled) {
      setGreetingIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setGreetingIndex(prev => (prev + 1) % 2);
    }, 4500); // 4.5 second loop
    return () => clearInterval(interval);
  }, [currentUser, scrolled]);

  // Debounce the typed query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, loading: searching } = useSearch(debouncedQuery);

  const currentHour = new Date().getHours();
  const timeOfDay = currentHour < 12 ? "Morning" : currentHour < 18 ? "Afternoon" : "Evening";
  const firstName = currentUser?.profile?.name?.split(" ")[0] || "there";

  return (
    <>
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
      padding: "0 1.5rem", height: "60px",
      background: S.bg,
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      transition: "all 0.3s ease",
    }}>
      {/* 1. Logo / Greeting (Left) */}
      <div style={{ display: "flex", justifyContent: "flex-start", overflow: "hidden" }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          {currentUser && !scrolled && pathname === "/" ? (
            <div style={{ position: "relative", height: "24px", minWidth: "270px" }}>
              <span style={{
                position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
                fontSize: "1.05rem", fontWeight: 800, color: S.text,
                opacity: greetingIndex === 0 ? 1 : 0,
                transform: greetingIndex === 0 ? "translateY(0)" : "translateY(-15px)",
                transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}>
                Good {timeOfDay}, <span style={{ color: S.red }}>{firstName}</span>
              </span>
              <span style={{
                position: "absolute", left: 0, top: 0, whiteSpace: "nowrap",
                fontSize: "1.05rem", fontWeight: 800, color: S.text,
                opacity: greetingIndex === 1 ? 1 : 0,
                transform: greetingIndex === 1 ? "translateY(0)" : "translateY(15px)",
                transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}>
                What are you going to watch today?
              </span>
            </div>
          ) : (
            <span style={{
              fontSize: "1.3rem", fontWeight: 900, color: S.red,
              fontFamily: "'Epilogue', sans-serif",
              letterSpacing: "-0.04em", textTransform: "uppercase",
              animation: "fade-in-up 0.4s ease-out",
            }}>
              CINEMA
            </span>
          )}
        </Link>
      </div>

      {/* 2. Search Bar (Middle) */}
      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <div style={{
          display: "flex", alignItems: "center",
          backgroundColor: searchFocused ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${searchFocused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: "9999px",
          padding: "0.35rem 1rem",
          width: "280px",
          transition: "all 0.2s ease",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: searchFocused ? "#fff" : S.muted, marginRight: "0.5rem", transition: "color 0.2s" }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search movies, TV..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: "transparent", border: "none", outline: "none",
              color: S.text, fontSize: "0.85rem", width: "100%",
              fontWeight: 500,
            }}
          />
        </div>

        {/* Search Results Dropdown */}
        {searchFocused && query.length > 0 && (
          <div style={{
            position: "absolute", top: "110%", left: 0, right: 0,
            backgroundColor: S.surface,
            border: `1px solid ${S.border}`,
            borderRadius: "10px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            maxHeight: "360px", overflowY: "auto",
            zIndex: 200, display: "flex", flexDirection: "column",
            overflow: "hidden",
          }}>
            {searching ? (
              <div style={{ padding: "1rem", textAlign: "center", color: S.faint, fontSize: "0.85rem" }}>
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: S.faint, fontSize: "0.85rem" }}>
                No results found
              </div>
            ) : (
              results.slice(0, 8).map((item) => {
                const title = item.title || item.name;
                const year = (item.release_date || item.first_air_date || "").slice(0, 4);
                const isMovie = item.media_type === "movie";
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input blur!
                      setQuery("");
                      setSearchFocused(false);
                      navigate(`/${isMovie ? 'movie' : 'tv'}/${item.id}`);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem",
                      cursor: "pointer", borderBottom: `1px solid rgba(255,255,255,0.02)`,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {item.poster_path ? (
                      <img src={posterUrl(item.poster_path, "w92")} alt={title}
                        style={{ width: "32px", height: "48px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "32px", height: "48px", borderRadius: "4px", backgroundColor: "#333", flexShrink: 0 }} />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: S.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {title}
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", marginTop: "0.15rem" }}>
                        <span style={{ fontSize: "0.65rem", color: isMovie ? S.red : "#3b82f6", fontWeight: 700, textTransform: "uppercase" }}>
                          {isMovie ? "Movie" : "TV"}
                        </span>
                        {year && <span style={{ fontSize: "0.7rem", color: S.faint }}>• {year}</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. Nav links (Right) */}
      <nav style={{ display: "flex", gap: "0.25rem", justifyContent: "flex-end", alignItems: "center" }}>
        {[
          { label: "Home", to: "/" },
          { label: "Favorites", to: "/favorites" },
        ].map(({ label, to }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: "6px",
                fontSize: "0.82rem",
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : S.muted,
                textDecoration: "none",
                whiteSpace: "nowrap",
                backgroundColor: active ? "rgba(229,9,20,0.12)" : "transparent",
                borderBottom: active ? `2px solid ${S.red}` : "2px solid transparent",
                transition: "color 0.2s, background 0.2s",
              }}
            >
              {label}
            </Link>
          );
        })}
        <div style={{ width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.1)", margin: "0 0.5rem", flexShrink: 0 }} />

        {currentUser ? (
          <div style={{ position: "relative", flexShrink: 0 }} ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.3rem 0.6rem", borderRadius: "8px",
                background: "none", border: "none", cursor: "pointer",
                transition: "transform 0.2s",
                transform: profileMenuOpen ? "scale(1.05)" : "scale(1)"
              }}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                backgroundColor: S.red, color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800,
                boxShadow: "0 4px 12px rgba(229,9,20,0.4)"
              }}>
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
            </button>

            {profileMenuOpen && (
              <div 
                style={{
                  position: "absolute", top: "calc(100% + 15px)", right: 0,
                  width: "170px", padding: "0.5rem", borderRadius: "16px",
                  display: "flex", flexDirection: "column", gap: "0.25rem",
                  background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(15,15,15,0.95) 100%)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  zIndex: 200,
                  animation: "scale-in 0.2s ease-out"
                }}
              >
                {[
                  { label: "Logout", action: () => { setProfileMenuOpen(false); logout(); }, isRed: true },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    style={{
                      padding: "0.5rem 0.75rem", borderRadius: "8px",
                      background: "transparent", border: "none", textAlign: "left",
                      color: item.isRed ? "#ff7b7b" : "#fff",
                      fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="glass-btn"
            style={{
              padding: "0.5rem 1.4rem", borderRadius: "9999px",
              color: "#fff", border: "none", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0
            }}
          >
            Sign In
          </button>
        )}
      </nav>
    </header>
    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
