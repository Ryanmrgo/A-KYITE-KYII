import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSearch, posterUrl } from "../hooks/useTmdb";

export default function ArrowSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'movie', 'tv'
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, loading } = useSearch(debouncedQuery);

  if (!isOpen) return null;

  const filteredResults = (results || []).filter((item) => {
    if (filterType === "movie") return item.media_type === "movie";
    if (filterType === "tv") return item.media_type === "tv";
    return item.media_type === "movie" || item.media_type === "tv";
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 600,
        backgroundColor: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1.5rem 1rem",
        overflowY: "auto",
        animation: "fade-in-up 0.2s ease-out both",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "840px",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Search Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            backgroundColor: "rgba(22,22,22,0.95)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "0.75rem 1.25rem",
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: "rgba(255,255,255,0.4)" }}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, TV shows, actors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "#ffffff",
              fontSize: "1.05rem",
              fontWeight: 500,
            }}
          />

          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
              }}
            >
              ✕
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: "0.3rem 0.65rem",
              borderRadius: "8px",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ESC
          </button>
        </div>

        {/* Filter Chips */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[
            { id: "all", label: "All Titles" },
            { id: "movie", label: "Movies" },
            { id: "tv", label: "TV Series" },
          ].map((tab) => {
            const active = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                style={{
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  border: `1px solid ${active ? "#e50914" : "rgba(255,255,255,0.08)"}`,
                  backgroundColor: active ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.04)",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Results Body */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "rgba(255,255,255,0.4)", fontSize: "0.95rem" }}>
            Searching ArrowTV database...
          </div>
        )}

        {!loading && debouncedQuery && filteredResults.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "rgba(255,255,255,0.4)" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>No results found</p>
            <p style={{ fontSize: "0.85rem" }}>Try checking your spelling or searching for a different title.</p>
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "1rem",
              marginTop: "0.5rem",
            }}
          >
            {filteredResults.map((item) => {
              const title = item.title || item.name;
              const year = (item.release_date || item.first_air_date || "").slice(0, 4);
              const isMovie = item.media_type === "movie";
              const score = item.vote_average?.toFixed(1);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    navigate(`/${isMovie ? "movie" : "tv"}/${item.id}`);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "2/3",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#161616",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {item.poster_path ? (
                      <img
                        src={posterUrl(item.poster_path, "w342")}
                        alt={title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontSize: "2rem" }}>
                        🎬
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        backgroundColor: isMovie ? "#e50914" : "#3b82f6",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      {isMovie ? "Movie" : "TV"}
                    </div>

                    {/* Rating */}
                    {score && score > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "6px",
                          right: "6px",
                          backgroundColor: "rgba(0,0,0,0.8)",
                          color: "#fbbf24",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        ★ {score}
                      </div>
                    )}
                  </div>

                  <p
                    style={{
                      marginTop: "0.45rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#ffffff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {title}
                  </p>
                  {year && (
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: "0.1rem" }}>
                      {year}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
