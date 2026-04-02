import { useState, useEffect, useRef } from "react";
import { useSeasonDetails, stillUrl, formatDate, formatRuntime } from "../hooks/useTmdb";

const S = {
  // colours
  bg: "#131313",
  surface: "#1a1a1a",
  surfaceHigh: "#222222",
  border: "#2a2a2a",
  borderActive: "rgba(229,9,20,0.5)",
  text: "#e5e2e1",
  muted: "#9ca3af",
  faint: "#6b7280",
  red: "#e50914",
  redDim: "rgba(229,9,20,0.15)",
};

/* ── Season Dropdown ─────────────────────────────────── */
function SeasonDropdown({ seasons, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const current = seasons.find((s) => s.season_number === selected);

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass-btn-dark"
        style={{
          display: "flex", alignItems: "center", gap: "0.6rem",
          padding: "0.6rem 1rem", borderRadius: "12px", cursor: "pointer",
          color: S.text, fontSize: "0.9rem", fontWeight: 600,
          minWidth: "200px", justifyContent: "space-between", border: "none"
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {current?.name ?? `Season ${selected}`}
        </span>
        <span style={{
          fontSize: "0.75rem", color: S.faint,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
          display: "inline-block",
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          backgroundColor: S.surfaceHigh, border: `1px solid ${S.border}`,
          borderRadius: "10px", zIndex: 50, maxHeight: "260px", overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}>
          {seasons
            .filter((s) => s.season_number > 0) // skip "Specials" (season 0)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => { onChange(s.season_number); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "0.65rem 1rem", cursor: "pointer",
                  backgroundColor: s.season_number === selected ? S.redDim : "transparent",
                  color: s.season_number === selected ? "#fff" : S.muted,
                  border: "none", textAlign: "left", fontSize: "0.875rem", fontWeight: 500,
                  borderLeft: s.season_number === selected ? `3px solid ${S.red}` : "3px solid transparent",
                  transition: "background 0.15s",
                }}
              >
                <span>{s.name}</span>
                <span style={{ fontSize: "0.72rem", color: S.faint }}>
                  {s.episode_count} ep
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Episode Card ─────────────────────────────────────── */
function EpisodeCard({ ep, isActive, onClick }) {
  const [imgOk, setImgOk] = useState(true);
  const still = stillUrl(ep.still_path, "w300");

  return (
    <button
      onClick={onClick}
      title={ep.name}
      style={{
        display: "flex", flexDirection: "column", textAlign: "left",
        background: "none", border: "none", cursor: "pointer", padding: 0,
        outline: "none", width: "175px", flexShrink: 0,
      }}
    >
      {/* Thumbnail */}
      <div style={{
        position: "relative", borderRadius: "8px", overflow: "hidden",
        aspectRatio: "16/9", backgroundColor: S.surfaceHigh,
        border: isActive ? `2px solid ${S.red}` : `2px solid transparent`,
        transition: "border-color 0.2s, transform 0.2s",
        transform: isActive ? "scale(1.02)" : "scale(1)",
      }}>
        {still && imgOk ? (
          <img
            src={still}
            alt={ep.name}
            onError={() => setImgOk(false)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: S.faint, fontSize: "1.2rem",
          }}>🎬</div>
        )}

        {/* Play overlay */}
        <div style={{
          position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: isActive ? 1 : 0, transition: "opacity 0.2s",
        }}
          className="ep-overlay"
        >
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: S.red, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: "1rem", marginLeft: "2px" }}>▶</span>
          </div>
        </div>

        {/* Episode number badge */}
        <div style={{
          position: "absolute", top: "6px", left: "6px",
          backgroundColor: "rgba(0,0,0,0.75)", borderRadius: "4px",
          padding: "2px 6px", fontSize: "0.65rem", fontWeight: 700, color: S.muted,
        }}>
          E{ep.episode_number}
        </div>

        {/* Active "Playing" badge */}
        {isActive && (
          <div style={{
            position: "absolute", top: "6px", right: "6px",
            backgroundColor: S.red, borderRadius: "4px",
            padding: "2px 6px", fontSize: "0.6rem", fontWeight: 700, color: "#fff",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#fff", animation: "pulse 1s infinite" }} />
            Playing
          </div>
        )}

        {/* Runtime */}
        {ep.runtime && (
          <div style={{
            position: "absolute", bottom: "6px", right: "6px",
            backgroundColor: "rgba(0,0,0,0.75)", borderRadius: "4px",
            padding: "2px 6px", fontSize: "0.65rem", color: S.muted,
          }}>
            {formatRuntime(ep.runtime)}
          </div>
        )}
      </div>

      {/* Episode title */}
      <p style={{
        marginTop: "0.4rem", fontSize: "0.8rem", fontWeight: 600,
        color: isActive ? "#fff" : S.muted,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        maxWidth: "100%",
      }}>
        {ep.name}
      </p>

      {/* Air date */}
      {ep.air_date && (
        <p style={{ fontSize: "0.7rem", color: S.faint, marginTop: "0.15rem" }}>
          {formatDate(ep.air_date)}
        </p>
      )}
    </button>
  );
}

/* ── Main Exported Component ─────────────────────────── */
export default function SeasonEpisodePicker({
  seriesId,
  seasons,
  selectedSeason,
  selectedEpisode,
  onSeasonChange,
  onEpisodeSelect,
}) {
  const { data: seasonData, loading } = useSeasonDetails(seriesId, selectedSeason);
  const episodes = seasonData?.episodes ?? [];

  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const SCROLL_BY = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -SCROLL_BY : SCROLL_BY, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  };

  // Check scroll constraints on resize or episodes change
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [episodes, loading]);

  // Auto-select episode 1 when season changes
  useEffect(() => {
    if (episodes.length > 0 && (selectedEpisode == null || selectedEpisode < 1)) {
      onEpisodeSelect(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes]);

  return (
    <div style={{ marginTop: "1.75rem" }}>
      {/* Header row */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem",
      }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: S.text, margin: 0 }}>
          Episodes
          {!loading && episodes.length > 0 && (
            <span style={{ color: S.faint, fontWeight: 400, marginLeft: "0.5rem", fontSize: "0.85rem" }}>
              ({episodes.length})
            </span>
          )}
        </h2>

        <SeasonDropdown
          seasons={seasons}
          selected={selectedSeason}
          onChange={onSeasonChange}
        />
      </div>



      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              width: "160px", borderRadius: "8px", overflow: "hidden",
              backgroundColor: S.surfaceHigh,
              aspectRatio: "16/9",
              animation: "pulse-bg 1.2s ease-in-out infinite",
            }} />
          ))}
        </div>
      )}

      {/* Episode Row with Horizontal Scroll */}
      {!loading && episodes.length > 0 && (
        <div style={{ position: "relative" }}>
          {/* Scroll Buttons */}
          {!atStart && (
            <button
              onClick={(e) => { e.preventDefault(); scroll("left"); }}
              style={{
                position: "absolute", left: "-1rem", top: "45%", transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%", zIndex: 11,
                backgroundColor: "rgba(24, 24, 24, 0.85)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.8)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(45,45,45,0.95)"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(24,24,24,0.85)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}

          {!atEnd && (
            <button
              onClick={(e) => { e.preventDefault(); scroll("right"); }}
              style={{
                position: "absolute", right: "-1rem", top: "45%", transform: "translateY(-50%)",
                width: "44px", height: "44px", borderRadius: "50%", zIndex: 11,
                backgroundColor: "rgba(24, 24, 24, 0.85)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#e5e5e5", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,0.8)", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(45,45,45,0.95)"; e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(24,24,24,0.85)"; e.currentTarget.style.transform = "translateY(-50%) scale(1)"; }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          )}

          {/* Left Fade */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "2rem", zIndex: 10,
            background: "linear-gradient(to right, #131313 0%, transparent 100%)",
            pointerEvents: "none", opacity: atStart ? 0 : 1, transition: "opacity 0.3s",
          }} />
          {/* Right Fade */}
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "3.5rem", zIndex: 10,
            background: "linear-gradient(to left, #131313 0%, transparent 100%)",
            pointerEvents: "none", opacity: atEnd ? 0 : 1, transition: "opacity 0.3s",
          }} />

          <div 
            ref={trackRef}
            onScroll={updateArrows}
            className="custom-scroll"
            style={{
              display: "flex",
              gap: "1.25rem",
              overflowX: "auto",
              padding: "0.5rem 0.5rem 1.25rem",
              scrollBehavior: "smooth",
            }}
          >
            {episodes.map((ep) => (
              <EpisodeCard
                key={ep.id}
                ep={ep}
                isActive={selectedEpisode === ep.episode_number}
                onClick={() => onEpisodeSelect(ep.episode_number)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Global hover style for episode overlay */}
      <style>{`
        button:hover .ep-overlay { opacity: 1 !important; }
        .custom-scroll::-webkit-scrollbar { display: none; }
        .custom-scroll { scrollbar-width: none; ms-overflow-style: none; }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pulse-bg {
          0%,100%{background-color:#222}
          50%{background-color:#2a2a2a}
        }
      `}</style>
    </div>
  );
}
