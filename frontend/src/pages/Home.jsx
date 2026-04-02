import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTrending, backdropUrl, posterUrl } from "../hooks/useTmdb";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, deleteField } from "firebase/firestore";
import { getContinueWatchingList } from "../hooks/useWatchProgress";
import { Trash2 } from "lucide-react";

const S = {
  bg: "#131313",
  surface: "#1a1a1a",
  surfaceHigh: "#222",
  border: "#2a2a2a",
  text: "#e5e2e1",
  muted: "#9ca3af",
  faint: "#6b7280",
  red: "#e50914",
  redDim: "rgba(229,9,20,0.15)",
};

/* ── Movie Card ───────────────────────────────────────── */
function MovieCard({ item, type, index }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const poster = posterUrl(item.poster_path, "w342");
  const title = item.title ?? item.name;
  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const score = item.vote_average?.toFixed(1);

  return (
    <button
      onClick={() => navigate(`/${type}/${item.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column",
        width: "100%",
        background: "none", border: "none", padding: 0,
        cursor: "pointer", textAlign: "left", outline: "none",
        transform: hovered ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)",
        transition: "transform 0.3s ease",
      }}
    >
      {/* Poster */}
      <div style={{
        position: "relative", borderRadius: "12px", overflow: "hidden",
        aspectRatio: "2/3", backgroundColor: S.surfaceHigh,
        boxShadow: hovered ? "0 24px 56px rgba(0,0,0,0.75)" : "0 4px 16px rgba(0,0,0,0.4)",
        border: hovered ? `2px solid ${S.red}` : "2px solid transparent",
        transition: "box-shadow 0.3s, border-color 0.3s",
      }}>
        {poster ? (
          <img src={poster} alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
              transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.5s ease" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "2.5rem", color: S.faint }}>🎬</div>
        )}

        {/* Rank badge */}
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          backgroundColor: "rgba(0,0,0,0.75)", borderRadius: "6px",
          padding: "2px 7px", fontSize: "0.7rem", fontWeight: 800, color: S.muted,
        }}>
          #{index + 1}
        </div>

        {/* Score */}
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          backgroundColor: "rgba(0,0,0,0.8)", borderRadius: "6px",
          padding: "2px 7px", fontSize: "0.7rem", fontWeight: 700,
          color: score >= 7 ? "#4ade80" : score >= 5 ? "#fbbf24" : "#f87171",
          display: "flex", alignItems: "center", gap: "3px",
        }}>
          ★ {score}
        </div>

        {/* Hover play button */}
        {hovered && (
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div className="glass-btn" style={{
              width: "48px", height: "48px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ color: "#fff", fontSize: "1.2rem", marginLeft: "4px" }}>▶</span>
            </div>
          </div>
        )}
      </div>

      {/* Title + year */}
      <p style={{
        marginTop: "0.6rem", fontSize: "0.88rem", fontWeight: 600,
        color: hovered ? "#fff" : S.muted,
        transition: "color 0.2s",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {title}
      </p>
      {year && (
        <p style={{ fontSize: "0.76rem", color: S.faint, marginTop: "0.2rem" }}>{year}</p>
      )}
    </button>
  );
}

/* ── Skeleton Card ────────────────────────────────────── */
function SkeletonCard({ delay = 0 }) {
  return (
    <div>
      <div style={{
        aspectRatio: "2/3", borderRadius: "12px",
        backgroundColor: S.surfaceHigh,
        animation: `pulse-bg 1.4s ease-in-out ${delay}s infinite`,
      }} />
      <div style={{ height: "13px", borderRadius: "4px", marginTop: "10px", width: "80%",
        backgroundColor: S.surfaceHigh, animation: `pulse-bg 1.4s ease-in-out ${delay + 0.1}s infinite` }} />
      <div style={{ height: "11px", borderRadius: "4px", marginTop: "6px", width: "45%",
        backgroundColor: S.surfaceHigh, animation: `pulse-bg 1.4s ease-in-out ${delay + 0.2}s infinite` }} />
    </div>
  );
}

/* ── Hero Slider ──────────────────────────────────────── */
function HeroSlider({ items }) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { currentUser } = useAuth();
  const [addingFav, setAddingFav] = useState(false);
  const [addedFavId, setAddedFavId] = useState(null);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000); // 6 seconds fade
    return () => clearInterval(interval);
  }, [items]);

  if (!items || items.length === 0) return null;
  const item = items[currentIndex];
  const title = item.title ?? item.name;
  const type = item.media_type === "tv" ? "tv" : "movie";
  const isFavorite = (currentUser?.profile?.favorites || []).some(f => f.id === item.id) || addedFavId === item.id;

  return (
    <div style={{ position: "relative", height: "clamp(320px, 52vw, 540px)", overflow: "hidden" }}>
      {/* Background images (crossfading) */}
      {items.map((it, idx) => {
        const isActive = idx === currentIndex;
        const bg = backdropUrl(it.backdrop_path, "original");
        return (
          <div key={it.id} style={{
            position: "absolute", inset: 0,
            opacity: isActive ? 1 : 0, 
            transition: "opacity 1s ease-in-out",
            zIndex: isActive ? 1 : 0, 
            pointerEvents: isActive ? "auto" : "none",
          }}>
            {bg && (
              <img src={bg} alt="" aria-hidden
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            {/* Gradients */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(19,19,19,1) 0%, rgba(19,19,19,0.75) 40%, rgba(19,19,19,0) 100%)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(19,19,19,1) 0%, transparent 50%)",
            }} />
          </div>
        );
      })}

      {/* Content overlay */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: "2.5rem 2rem",
        maxWidth: "600px", zIndex: 10, pointerEvents: "none"
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          marginBottom: "0.75rem",
        }}>
          <span style={{
            padding: "0.15rem 0.6rem", borderRadius: "4px",
            backgroundColor: S.red, color: "#fff",
            fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {type === "movie" ? "Movie" : "TV Series"}
          </span>
          <span style={{ color: S.muted, fontSize: "0.8rem" }}>
            ★ {item.vote_average?.toFixed(1)} · Trending #{currentIndex + 1}
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Epilogue', sans-serif",
          fontSize: "clamp(1.8rem, 5vw, 3.2rem)", fontWeight: 900,
          lineHeight: 1.05, color: "#fff", margin: 0,
          textTransform: "uppercase", letterSpacing: "-0.02em",
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}>
          {title}
        </h1>

        {item.overview && (
          <p style={{
            marginTop: "0.75rem", fontSize: "0.88rem", color: S.muted,
            lineHeight: 1.6, maxWidth: "50ch",
            display: "-webkit-box", WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical", overflow: "hidden",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}>
            {item.overview}
          </p>
        )}

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", pointerEvents: "auto" }}>
          <button
            className="glass-btn"
            onClick={() => navigate(`/${type}/${item.id}`)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              width: "190px", height: "48px", padding: 0, borderRadius: "9999px",
              color: "#fff",
              border: "none", fontSize: "0.95rem", fontWeight: 700,
              cursor: "pointer",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            ▶ Watch Now
          </button>

          <button
            className="glass-btn-dark"
            disabled={addingFav || isFavorite}
            onClick={async () => {
              if (!currentUser) return alert("Please Sign In first to save favorites!");
              setAddingFav(true);
              try {
                await updateDoc(doc(db, "users", currentUser.uid), {
                  favorites: arrayUnion({
                    id: item.id,
                    title: title,
                    type: type,
                    poster_path: item.poster_path,
                    addedAt: new Date().toISOString()
                  })
                });
                setAddedFavId(item.id);
              } catch (e) {
                console.error(e);
                alert("Failed to save favorite.");
              } finally {
                setAddingFav(false);
              }
            }}
            style={{
              position: "relative",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: "190px", height: "48px", padding: "0", borderRadius: "9999px",
              color: "#fff", border: "none", fontSize: "0.95rem", fontWeight: 600,
              cursor: (addingFav || isFavorite) ? "default" : "pointer",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)", opacity: addingFav ? 0.7 : 1,
            }}
          >
            {/* Standard Text + Icon */}
            <div style={{
              position: "absolute", display: "flex", alignItems: "center", gap: "0.5rem",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              opacity: isFavorite ? 0 : 1,
              transform: isFavorite ? "translateY(-15px)" : "translateY(0px)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {addingFav ? "Adding..." : "Add to Favorites"}
            </div>

            {/* Filled Heart Success State */}
            <div style={{
              position: "absolute", display: "flex", alignItems: "center", gap: "0.4rem", justifyContent: "center",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              opacity: isFavorite ? 1 : 0,
              transform: isFavorite ? "translateY(0) scale(1)" : "translateY(15px) scale(0.5)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                style={{ fill: "#fff", filter: "drop-shadow(0 0 8px rgba(255,255,255,0.6))" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              <span>Added</span>
            </div>
          </button>
        </div>
      </div>

      {/* Slider Indicators */}
      <div style={{ position: "absolute", bottom: "1.5rem", right: "2rem", display: "flex", gap: "0.5rem", zIndex: 10 }}>
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: currentIndex === idx ? "24px" : "6px", height: "6px",
              borderRadius: "4px", border: "none", padding: 0, margin: 0,
              backgroundColor: currentIndex === idx ? S.red : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const CARD_WIDTH = 175;   // px — card width
const CARD_GAP   = 20;    // px — gap between cards
const SCROLL_BY  = (CARD_WIDTH + CARD_GAP) * 4; // scroll 4 at a time
const MAX_ITEMS  = 10;

/* ── Section UI (Generic Wrapper) ─────────────────────── */
function SectionUI({ title, loading, items, renderItem }) {
  const rowRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);

  const updateArrows = () => {
    const el = rowRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -SCROLL_BY : SCROLL_BY, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [items, loading]);

  return (
    <section style={{ padding: "2.5rem 0 0" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "1.25rem", padding: "0 2rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: "4px", height: "22px", backgroundColor: S.red,
            borderRadius: "2px", flexShrink: 0,
          }} />
          <h2 style={{
            fontFamily: "'Epilogue', sans-serif",
            fontSize: "1.2rem", fontWeight: 800, color: S.text,
            margin: 0, textTransform: "uppercase", letterSpacing: "-0.01em",
          }}>
            {title}
          </h2>
        </div>

      </div>

      {/* Track */}
      <div style={{ position: "relative" }}>
        {/* Scroll Buttons */}
        {!loading && items && items.length > 0 && !atStart && (
          <button
            onClick={(e) => { e.preventDefault(); scroll("left"); }}
            style={{
              position: "absolute", left: "0.5rem", top: "calc(50% - 25px)", transform: "translateY(-50%)",
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

        {!loading && items && items.length > 0 && !atEnd && (
          <button
            onClick={(e) => { e.preventDefault(); scroll("right"); }}
            style={{
              position: "absolute", right: "0.5rem", top: "calc(50% - 25px)", transform: "translateY(-50%)",
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
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "3rem", zIndex: 2,
          background: "linear-gradient(to right, #131313, transparent)",
          pointerEvents: "none", opacity: atStart ? 0 : 1, transition: "opacity 0.3s",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "4rem", zIndex: 2,
          background: "linear-gradient(to left, #131313, transparent)",
          pointerEvents: "none", opacity: atEnd ? 0 : 1, transition: "opacity 0.3s",
        }} />

        <div
          ref={rowRef}
          onScroll={updateArrows}
          style={{
            display: "flex", gap: `${CARD_GAP}px`,
            overflowX: "auto", overflowY: "visible", scrollbarWidth: "none",
            msOverflowStyle: "none", padding: "0.5rem 2rem 1.25rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: `${CARD_WIDTH}px` }}>
                  <SkeletonCard delay={i * 0.07} />
                </div>
              ))
            : items.map((item, i) => (
                <div key={item.id} style={{ flexShrink: 0, width: `${CARD_WIDTH}px`, scrollSnapAlign: "start" }}>
                  {renderItem(item, i)}
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}



/* ── Section Rows ────────────────────────────────────── */
function TrendingSection({ title, items, type, loading }) {
  const visible = (items ?? []).slice(0, MAX_ITEMS);
  return (
    <SectionUI
      title={title}
      loading={loading}
      items={visible}
      renderItem={(item, i) => <MovieCard item={item} type={type} index={i} />}
    />
  );
}

function ContinueWatchingSection({ items, currentUser }) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <SectionUI
      title="Continue Watching"
      loading={false}
      items={items}
      renderItem={(item) => {
        const pct = Math.round((item.progress.watched / item.progress.duration) * 100);
        const isMovie = item.type === "movie";
        const epLabel = !isMovie && item.last_season_watched
          ? `S${String(item.last_season_watched).padStart(2, "0")} E${String(item.last_episode_watched).padStart(2, "0")}`
          : "Movie";
        
        const isHov = hoveredId === item.id;

        return (
          <button
            onClick={() => navigate(`/${item.type}/${item.id}`)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "flex", flexDirection: "column", width: "100%",
              background: "none", border: "none", padding: 0,
              cursor: "pointer", textAlign: "left", outline: "none",
              transform: isHov ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            <div style={{
              position: "relative", borderRadius: "12px", overflow: "hidden",
              aspectRatio: "2/3", backgroundColor: S.surfaceHigh,
              boxShadow: isHov ? "0 24px 56px rgba(0,0,0,0.75)" : "0 4px 16px rgba(0,0,0,0.4)",
              border: isHov ? `2px solid ${S.red}` : "2px solid transparent",
              transition: "box-shadow 0.3s, border-color 0.3s",
            }}>
              {item.poster_path ? (
                <img src={posterUrl(item.poster_path, "w342")} alt={item.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                    transform: isHov ? "scale(1.08)" : "scale(1)", transition: "transform 0.5s ease" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "2.5rem", color: S.faint }}>🎬</div>
              )}

              {/* Progress Bar (Always visible at bottom of poster) */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "4px",
                backgroundColor: "rgba(255,255,255,0.2)",
              }}>
                <div style={{
                  height: "100%", width: `${pct}%`, backgroundColor: S.red,
                  boxShadow: "0 0 10px rgba(229,9,20,0.8)",
                }} />
              </div>

              {/* Delete Trash Button */}
              <div
                onClick={async (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (!currentUser?.uid) return;
                  if (window.confirm("Remove from continue watching?")) {
                    const key = isMovie ? `m${item.id}` : `t${item.id}`;
                    try {
                      await updateDoc(doc(db, "users", currentUser.uid), {
                        [`watchProgress.${key}`]: deleteField()
                      });
                    } catch (err) {
                      console.error("Failed to remove item:", err);
                    }
                  }
                }}
                style={{
                  position: "absolute", top: "8px", left: "8px",
                  backgroundColor: "rgba(0,0,0,0.7)",
                  borderRadius: "6px", width: "24px", height: "24px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", cursor: "pointer", zIndex: 10,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = S.red; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.7)"; }}
              >
                <Trash2 size={13} strokeWidth={2.5} />
              </div>

              {/* Type Badge */}
              <div style={{
                position: "absolute", top: "8px", right: "8px",
                backgroundColor: isMovie ? S.red : "#3b82f6",
                borderRadius: "4px", padding: "2px 6px",
                fontSize: "0.6rem", fontWeight: 800, color: "#fff", textTransform: "uppercase",
              }}>
                {isMovie ? "Movie" : "TV"}
              </div>

              {/* Play Button Overlay */}
              {isHov && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div className="glass-btn" style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontSize: "1.2rem", marginLeft: "4px" }}>▶</span>
                  </div>
                </div>
              )}
            </div>

            <p style={{
              marginTop: "0.6rem", fontSize: "0.88rem", fontWeight: 700,
              color: isHov ? "#fff" : S.muted, transition: "color 0.2s",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {item.title}
            </p>
            <p style={{ fontSize: "0.76rem", color: S.faint, marginTop: "0.2rem" }}>
              {epLabel} · {pct}% watched
            </p>
          </button>
        );
      }}
    />
  );
}





/* ── Page ─────────────────────────────────────────────── */
export default function Home() {
  const { data: trendingAll, loading: loadingAll } = useTrending("all", "week");
  const { data: trendingMovies, loading: loadingMovies } = useTrending("movie", "week");
  const { data: trendingTv, loading: loadingTv } = useTrending("tv", "week");
  const { currentUser } = useAuth();

  const top5 = (trendingAll ?? [])
    .filter(i => i.media_type === "movie" || i.media_type === "tv")
    .slice(0, 5);

  const continueWatching = getContinueWatchingList(currentUser?.profile);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: S.bg }}>
      {/* Hero Slider */}
      {!loadingAll && top5.length > 0 && (
        <HeroSlider items={top5} />
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <ContinueWatchingSection items={continueWatching} currentUser={currentUser} />
      )}

      {/* Trending Movies */}
      <TrendingSection
        title="Trending Movies This Week"
        items={trendingMovies}
        type="movie"
        loading={loadingMovies}
      />

      {/* Trending TV */}
      <TrendingSection
        title="Trending TV Shows This Week"
        items={trendingTv}
        type="tv"
        loading={loadingTv}
      />

      <div style={{ height: "3rem" }} />

      <style>{`
        @keyframes pulse-bg {
          0%,100% { background-color: #222; }
          50%      { background-color: #2a2a2a; }
        }
      `}</style>
    </div>
  );
}
