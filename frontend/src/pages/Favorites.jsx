import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { posterUrl } from "../hooks/useTmdb";

const S = {
  bg: "#131313", surface: "#1a1a1a", surfaceHigh: "#222",
  border: "#2a2a2a", text: "#e5e2e1", muted: "#9ca3af",
  faint: "#6b7280", red: "#e50914",
};

export default function Favorites() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // all | movie | tv
  const [removing, setRemoving] = useState(null);

  const rawFavorites = currentUser?.profile?.favorites || [];

  // Deduplicate by id+type — keep the first occurrence (earliest saved)
  const seen = new Set();
  const favorites = rawFavorites.filter((f) => {
    const key = `${f.type}-${f.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Silently clean Firestore if we found duplicates
  useEffect(() => {
    if (!currentUser) return;
    if (favorites.length < rawFavorites.length) {
      // Duplicates found — write cleaned list back
      updateDoc(doc(db, "users", currentUser.uid), { favorites })
        .then(() => {
          if (currentUser.profile) currentUser.profile.favorites = favorites;
        })
        .catch(console.error);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const filtered = favorites.filter((f) => {
    if (filter === "all") return true;
    return f.type === filter;
  });

  async function handleRemove(item) {
    if (!currentUser) return;
    setRemoving(item.id);
    try {
      const newFavs = favorites.filter((f) => !(f.id === item.id && f.type === item.type));
      await updateDoc(doc(db, "users", currentUser.uid), { favorites: newFavs });
      // Optimistically reflect in local profile
      currentUser.profile.favorites = newFavs;
    } catch (e) {
      console.error(e);
    } finally {
      setRemoving(null);
    }
  }

  // Not logged in
  if (!currentUser) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: S.bg, color: S.text }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={S.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1.5rem" }}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Sign in to see your Favorites</h2>
        <p style={{ color: S.muted, marginTop: "0.5rem", fontSize: "0.9rem" }}>Save movies and TV shows to watch later.</p>
        <Link to="/" style={{ marginTop: "1.5rem", padding: "0.7rem 1.8rem", borderRadius: "9999px", backgroundColor: S.red, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: S.bg, color: S.text, fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: S.muted, textDecoration: "none", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
            ← Back to Home
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 900, margin: 0, fontFamily: "'Epilogue', sans-serif" }}>
                My Favorites
                <svg width="28" height="28" viewBox="0 0 24 24" stroke={S.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ fill: S.red, marginLeft: "0.6rem", verticalAlign: "middle", filter: "drop-shadow(0 0 6px rgba(229,9,20,0.5))" }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </h1>
              <p style={{ color: S.muted, marginTop: "0.35rem", fontSize: "0.88rem" }}>
                {favorites.length} saved title{favorites.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: "0.4rem", backgroundColor: S.surface, padding: "0.3rem", borderRadius: "10px", border: `1px solid ${S.border}` }}>
              {[
                { key: "all", label: "All" },
                { key: "movie", label: "Movies" },
                { key: "tv", label: "TV Shows" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: "7px", border: "none",
                    cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
                    backgroundColor: filter === key ? S.red : "transparent",
                    color: filter === key ? "#fff" : S.muted,
                    transition: "all 0.2s ease",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "5rem 2rem", borderRadius: "16px", backgroundColor: S.surface,
            border: `1px solid ${S.border}`, textAlign: "center",
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={S.faint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1.25rem" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p style={{ color: S.muted, fontSize: "1rem", fontWeight: 600, margin: 0 }}>
              {filter === "all" ? "Your favorites list is empty" : `No ${filter === "movie" ? "movies" : "TV shows"} saved yet`}
            </p>
            <p style={{ color: S.faint, fontSize: "0.85rem", marginTop: "0.4rem" }}>
              Hit the heart button on any title to save it here!
            </p>
            <Link to="/" style={{ marginTop: "1.5rem", padding: "0.65rem 1.6rem", borderRadius: "9999px", backgroundColor: S.red, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem" }}>
              Explore Now
            </Link>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1.25rem",
          }}>
            {[...filtered].reverse().map((item) => (
              <FavoriteCard
                key={`${item.type}-${item.id}`}
                item={item}
                isRemoving={removing === item.id}
                onPlay={() => navigate(`/${item.type}/${item.id}`)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-bg { 0%,100%{background-color:#1e1e1e} 50%{background-color:#252525} }
        @keyframes fade-in { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}

function FavoriteCard({ item, isRemoving, onPlay, onRemove }) {
  const [hovered, setHovered] = useState(false);
  const hasPoster = !!item.poster_path;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: "12px", overflow: "hidden",
        cursor: "pointer", animation: "fade-in 0.4s ease-out",
        opacity: isRemoving ? 0.4 : 1, transition: "opacity 0.3s",
        boxShadow: hovered ? "0 16px 40px rgba(0,0,0,0.7)" : "0 4px 16px rgba(0,0,0,0.4)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transitionProperty: "transform, box-shadow",
        transitionDuration: "0.25s",
      }}
    >
      {/* Poster */}
      <div style={{ aspectRatio: "2/3", backgroundColor: S.surfaceHigh, position: "relative" }}>
        {hasPoster ? (
          <img
            src={posterUrl(item.poster_path, "w342")}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "2rem" }}>🎬</span>
          </div>
        )}

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
          opacity: hovered ? 1 : 0, transition: "opacity 0.25s",
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          padding: "0.75rem",
          gap: "0.5rem",
        }}>
          {/* Play button */}
          <button
            onClick={onPlay}
            className="glass-btn"
            style={{
              width: "100%", padding: "0.5rem", borderRadius: "8px",
              border: "none", color: "#fff", fontSize: "0.8rem", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem",
            }}
          >
            ▶ Watch Now
          </button>

          {/* Remove button */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              width: "100%", padding: "0.45rem", borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              backgroundColor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              color: "#fca5a5", fontSize: "0.78rem", fontWeight: 600,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem",
            }}
          >
            Remove
          </button>
        </div>

        {/* Type badge */}
        <div style={{
          position: "absolute", top: "0.5rem", left: "0.5rem",
          padding: "0.15rem 0.5rem", borderRadius: "4px",
          backgroundColor: item.type === "movie" ? S.red : "#3b82f6",
          fontSize: "0.6rem", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {item.type === "movie" ? "Movie" : "TV"}
        </div>
      </div>

      {/* Title + date */}
      <div style={{ padding: "0.6rem 0.5rem 0.75rem", backgroundColor: S.surface }}>
        <p style={{
          margin: 0, fontSize: "0.82rem", fontWeight: 700, color: S.text,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.title}
        </p>
        {item.addedAt && (
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: S.faint }}>
            Added {new Date(item.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}
