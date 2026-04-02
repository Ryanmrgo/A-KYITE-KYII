import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMovieDetails, posterUrl, formatRuntime, getTopCast } from "../hooks/useTmdb";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useWatchProgress, getSavedProgress } from "../hooks/useWatchProgress";

const MOVIE_ID = 533535;

const S = {
  bg: "#131313", surface: "#1a1a1a", border: "#2a2a2a",
  text: "#e5e2e1", muted: "#9ca3af", faint: "#6b7280",
  red: "#e50914", redDim: "rgba(229,9,20,0.15)",
};

function Chip({ children, accent, red }) {
  return (
    <span style={{
      padding: "0.2rem 0.65rem", borderRadius: "9999px",
      fontSize: "0.72rem", fontWeight: 600,
      backgroundColor: red ? "#7f1d1d" : accent ? S.redDim : "#1e1e1e",
      color: red ? "#fca5a5" : accent ? "#ff6b6b" : S.muted,
      border: `1px solid ${red ? "#991b1b" : accent ? "rgba(229,9,20,0.3)" : S.border}`,
    }}>{children}</span>
  );
}

function Detail({ label, children }) {
  return (
    <div style={{ fontSize: "0.85rem" }}>
      <span style={{ color: S.faint }}>{label}: </span>
      <span style={{ color: "#d1d5db" }}>{children}</span>
    </div>
  );
}

export default function MoviePlayer() {
  const { id } = useParams();
  const movieId = id ?? MOVIE_ID;
  const { data: movie, loading, error } = useMovieDetails(movieId);
  const { currentUser } = useAuth();
  const [addingFav, setAddingFav] = useState(false);
  const [addedFav, setAddedFav] = useState(false);

  // Track & save watch progress to Firestore
  useWatchProgress(currentUser);

  // Resume from saved position if available
  const savedProgress = getSavedProgress(currentUser?.profile, movieId, "movie");
  const startFrom = savedProgress ? Math.floor(savedProgress.watched) : 0;
  const progressPct = savedProgress ? Math.round((savedProgress.watched / savedProgress.duration) * 100) : 0;

  const playerSrc = `https://vidfast.pro/movie/${movieId}?autoPlay=false${startFrom > 30 ? `&startFrom=${startFrom}` : ""}`;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: S.bg, color: S.text, fontFamily: "'Inter', sans-serif", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>

        {/* Back link */}
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: S.muted, textDecoration: "none", fontSize: "0.82rem", marginBottom: "1.25rem" }}>
          ← Back to Home
        </Link>

        {/* Player */}
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: "12px", overflow: "hidden" }}>
          <iframe
            src={playerSrc}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            allowFullScreen allow="encrypted-media" title="Movie Player"
          />
        </div>

        {/* Resume indicator */}
        {startFrom > 30 && (
          <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ flex: 1, height: "3px", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, backgroundColor: S.red, borderRadius: "9999px", transition: "width 0.5s" }} />
            </div>
            <span style={{ fontSize: "0.72rem", color: S.muted, whiteSpace: "nowrap" }}>
              Resuming from {Math.floor(startFrom / 60)}m {startFrom % 60}s · {progressPct}%
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "8px", backgroundColor: "#2a1515", border: "1px solid #7f1d1d", color: "#fca5a5", fontSize: "0.875rem" }}>
            ⚠️ Could not load metadata — check your <code>VITE_TMDB_API_KEY</code> in <code>.env</code>.
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div style={{ marginTop: "2rem" }}>
            {[240, 140, 180].map((w, i) => (
              <div key={i} style={{ height: "18px", width: `${w}px`, borderRadius: "6px", backgroundColor: "#1e1e1e", animation: "pulse-bg 1.2s ease-in-out infinite", marginBottom: "0.75rem", animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Movie details */}
        {movie && !loading && (
          <div style={{ marginTop: "1.75rem" }}>
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
              
              {/* Left side: Large Poster + Fav Button */}
              {movie.poster_path && (
                <div style={{ width: "220px", flexShrink: 0, alignSelf: "flex-start", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <img src={posterUrl(movie.poster_path, "w500")} alt={movie.title}
                    style={{ 
                      width: "100%", height: "auto", borderRadius: "12px", 
                      boxShadow: "0 20px 40px rgba(0,0,0,0.6)", 
                      border: `1px solid ${S.border}` 
                    }}
                  />

                  {/* Add to Favorites Button */}
                  {(() => {
                    const isFav = (currentUser?.profile?.favorites || []).some(f => f.id === Number(movieId)) || addedFav;
                    return (
                      <button
                        className="glass-btn-dark"
                        disabled={addingFav || isFav}
                        onClick={async () => {
                          if (!currentUser) return alert("Please Sign In first!");
                          setAddingFav(true);
                          try {
                            await updateDoc(doc(db, "users", currentUser.uid), {
                              favorites: arrayUnion({
                                id: movie.id,
                                title: movie.title,
                                type: "movie",
                                poster_path: movie.poster_path,
                                addedAt: new Date().toISOString()
                              })
                            });
                            setAddedFav(true);
                          } catch (e) {
                            console.error(e);
                            alert("Failed to save.");
                          } finally {
                            setAddingFav(false);
                          }
                        }}
                        style={{
                          position: "relative", width: "100%", height: "44px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          borderRadius: "10px", border: "none", cursor: (addingFav || isFav) ? "default" : "pointer",
                          color: "#fff", fontSize: "0.88rem", fontWeight: 600,
                          overflow: "hidden",
                        }}
                      >
                        {/* Default label */}
                        <div style={{
                          position: "absolute", display: "flex", alignItems: "center", gap: "0.4rem",
                          transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                          opacity: isFav ? 0 : 1,
                          transform: isFav ? "translateY(-14px)" : "translateY(0)",
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          {addingFav ? "Adding..." : "Add to Favorites"}
                        </div>
                        {/* Success state */}
                        <div style={{
                          position: "absolute", display: "flex", alignItems: "center", gap: "0.4rem",
                          transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                          opacity: isFav ? 1 : 0,
                          transform: isFav ? "translateY(0) scale(1)" : "translateY(14px) scale(0.6)",
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ fill: "#fff", filter: "drop-shadow(0 0 6px rgba(255,255,255,0.7))" }}
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          Added
                        </div>
                      </button>
                    );
                  })()}
                </div>
              )}

              {/* Right side: Info */}
              <div style={{ flex: 1, minWidth: "300px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
                  <div>
                    <h1 style={{ fontSize: "clamp(1.6rem, 4.5vw, 2.6rem)", fontWeight: 800, lineHeight: 1.1, margin: 0 }}>
                      {movie.title}
                    </h1>
                    {movie.tagline && (
                      <p style={{ color: S.faint, fontStyle: "italic", marginTop: "0.4rem", fontSize: "0.95rem" }}>
                        "{movie.tagline}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.75rem 1.25rem", borderRadius: "10px", backgroundColor: S.surface, border: `1px solid ${S.border}`, flexShrink: 0 }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 800, color: S.red }}>{(movie.vote_average ?? 0).toFixed(1)}</span>
                    <span style={{ fontSize: "0.65rem", color: S.faint, textTransform: "uppercase", letterSpacing: "0.06em" }}>TMDB</span>
                  </div>
                </div>

                {/* Chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1.25rem" }}>
                  {movie.release_date && <Chip>{new Date(movie.release_date).getFullYear()}</Chip>}
                  {formatRuntime(movie.runtime) && <Chip>{formatRuntime(movie.runtime)}</Chip>}
                  {(movie.genres ?? []).map((g) => <Chip key={g.id} accent>{g.name}</Chip>)}
                </div>

                {/* Overview */}
                {movie.overview && (
                  <p style={{ marginTop: "1.5rem", color: S.muted, lineHeight: 1.75, fontSize: "0.95rem", maxWidth: "72ch" }}>
                    {movie.overview}
                  </p>
                )}

                <hr style={{ border: "none", borderTop: `1px solid ${S.border}`, margin: "1.75rem 0" }} />

                {/* Cast + Details */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
                  <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.faint, marginBottom: "0.75rem" }}>Cast</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {getTopCast(movie.credits, 5).map((a) => (
                        <span key={a.id} style={{ fontSize: "0.85rem" }}>
                          <strong style={{ color: "#f3f4f6" }}>{a.name}</strong>
                          {a.character && <span style={{ color: S.faint }}> as {a.character}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: S.faint, margin: 0 }}>Details</p>
                    {movie.status && <Detail label="Status">{movie.status}</Detail>}
                    {movie.original_language && <Detail label="Language">{movie.original_language.toUpperCase()}</Detail>}
                    {movie.budget > 0 && <Detail label="Budget">${(movie.budget / 1_000_000).toFixed(0)}M</Detail>}
                    {movie.revenue > 0 && <Detail label="Revenue">${(movie.revenue / 1_000_000).toFixed(0)}M</Detail>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse-bg { 0%,100%{background-color:#1e1e1e} 50%{background-color:#252525} }
        code{background:#1e1e1e;padding:.1em .35em;border-radius:4px;font-size:.85em}
      `}</style>
    </div>
  );
}
