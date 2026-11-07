import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchDiscover, posterUrl } from "../hooks/useTmdb";

const S = {
  bg: "#000000",
  surface: "#0e0e0e",
  surfaceHigh: "#161616",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.65)",
  faint: "rgba(255,255,255,0.4)",
  red: "#e50914",
  redGlow: "0 0 16px rgba(229,9,20,0.5)",
};

const MOVIE_GENRES = [
  { id: "", name: "All Genres" },
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 37, name: "Western" },
];

const TV_GENRES = [
  { id: "", name: "All Genres" },
  { id: 10759, name: "Action & Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 9648, name: "Mystery" },
  { id: 10764, name: "Reality" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10768, name: "War & Politics" },
  { id: 37, name: "Western" },
];

const SORT_OPTIONS = [
  { key: "popularity.desc", label: "Most Popular" },
  { key: "vote_average.desc", label: "Top Rated" },
  { key: "release_date.desc", label: "Latest Releases" },
];

const fallbackPosters = [
  "/posters/neon_horizon.png",
  "/posters/shadow_protocol.png",
  "/posters/last_kingdom.png",
  "/posters/echoes_of_time.png",
  "/posters/crimson_tide.png",
  "/posters/silent_echo.png",
];

export default function Catalog({ type: propType }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Derive media type from prop or path
  const mediaType = propType || (location.pathname.startsWith("/tv") ? "tv" : "movie");
  const isMovie = mediaType === "movie";

  const genres = isMovie ? MOVIE_GENRES : TV_GENRES;

  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedSort, setSelectedSort] = useState("popularity.desc");
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  // Reset pagination when type, genre, or sort changes
  useEffect(() => {
    setSelectedGenre("");
    setSelectedSort("popularity.desc");
    setPage(1);
  }, [mediaType]);

  // Fetch items whenever mediaType, genre, or sort changes (Page 1)
  useEffect(() => {
    let active = true;
    setLoading(true);
    setPage(1);

    const sortParam =
      selectedSort === "release_date.desc"
        ? isMovie
          ? "primary_release_date.desc"
          : "first_air_date.desc"
        : selectedSort;

    fetchDiscover({
      type: mediaType,
      genreId: selectedGenre || undefined,
      sortBy: sortParam,
      page: 1,
    })
      .then((data) => {
        if (!active) return;
        setItems(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total_results || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Discover fetch error:", err);
        setItems([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mediaType, selectedGenre, selectedSort]);

  // Load more items (Page 2, 3...)
  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const sortParam =
      selectedSort === "release_date.desc"
        ? isMovie
          ? "primary_release_date.desc"
          : "first_air_date.desc"
        : selectedSort;

    fetchDiscover({
      type: mediaType,
      genreId: selectedGenre || undefined,
      sortBy: sortParam,
      page: nextPage,
    })
      .then((data) => {
        const newResults = data.results || [];
        setItems((prev) => {
          const seen = new Set(prev.map((i) => i.id));
          const filteredNew = newResults.filter((i) => !seen.has(i.id));
          return [...prev, ...filteredNew];
        });
        setPage(nextPage);
        setLoadingMore(false);
      })
      .catch((err) => {
        console.error("Load more error:", err);
        setLoadingMore(false);
      });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: S.bg,
        color: S.text,
        padding: "2.5rem 1.5rem 5rem",
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
        {/* ── Page Header ── */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: S.red,
                backgroundColor: "rgba(229, 9, 20, 0.12)",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid rgba(229, 9, 20, 0.25)",
              }}
            >
              {isMovie ? "Movies Catalog" : "TV Series Catalog"}
            </span>
            {!loading && totalResults > 0 && (
              <span style={{ fontSize: "0.78rem", color: S.faint }}>
                • {totalResults.toLocaleString()} titles available
              </span>
            )}
          </div>

          <h1
            style={{
              fontFamily: "'Epilogue', sans-serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              margin: 0,
              color: "#ffffff",
            }}
          >
            {isMovie ? "Explore Movies" : "Explore TV Shows"}
          </h1>
          <p style={{ color: S.muted, fontSize: "0.92rem", marginTop: "0.4rem", maxWidth: "60ch" }}>
            {isMovie
              ? "Filter by your favorite genres, sort by highest ratings or latest releases, and start streaming instantly."
              : "Discover binge-worthy series, trending seasons, and critically acclaimed shows across all genres."}
          </p>
        </div>

        {/* ── Interactive Filter & Sort Bar ── */}
        <div
          style={{
            backgroundColor: S.surface,
            borderRadius: "16px",
            border: `1px solid ${S.border}`,
            padding: "1.25rem",
            marginBottom: "2.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top Row: Sort Controls & Active Summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "1rem",
            }}
          >
            {/* Sort Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: S.faint, fontWeight: 600, marginRight: "0.3rem" }}>
                SORT BY:
              </span>
              {SORT_OPTIONS.map((opt) => {
                const isActive = selectedSort === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedSort(opt.key)}
                    style={{
                      padding: "0.4rem 0.9rem",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: isActive ? 700 : 500,
                      border: `1px solid ${isActive ? S.red : "rgba(255,255,255,0.08)"}`,
                      backgroundColor: isActive ? "rgba(229, 9, 20, 0.16)" : "rgba(255,255,255,0.03)",
                      color: isActive ? "#ffffff" : S.muted,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Reset Button if filtered */}
            {(selectedGenre || selectedSort !== "popularity.desc") && (
              <button
                onClick={() => {
                  setSelectedGenre("");
                  setSelectedSort("popularity.desc");
                }}
                style={{
                  fontSize: "0.78rem",
                  color: S.faint,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "0.2rem 0.4rem",
                }}
              >
                Reset filters
              </button>
            )}
          </div>

          {/* Bottom Row: Genre Filter Pills */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
              <span style={{ fontSize: "0.8rem", color: S.faint, fontWeight: 600 }}>GENRE:</span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.45rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {genres.map((g) => {
                const isSelected = selectedGenre === g.id;
                return (
                  <button
                    key={g.name}
                    onClick={() => setSelectedGenre(g.id)}
                    style={{
                      padding: "0.38rem 0.85rem",
                      borderRadius: "9999px",
                      fontSize: "0.8rem",
                      fontWeight: isSelected ? 700 : 500,
                      border: `1px solid ${isSelected ? S.red : "rgba(255,255,255,0.06)"}`,
                      backgroundColor: isSelected ? S.red : "rgba(255,255,255,0.03)",
                      color: isSelected ? "#ffffff" : S.muted,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? S.redGlow : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
                        e.currentTarget.style.color = S.muted;
                      }
                    }}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Content Grid ── */}
        {loading ? (
          /* Shimmer Skeleton Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div
                  style={{
                    aspectRatio: "2/3",
                    borderRadius: "12px",
                    backgroundColor: "#161616",
                    animation: "pulse-bg 1.2s ease-in-out infinite",
                    animationDelay: `${(i % 6) * 0.1}s`,
                  }}
                />
                <div
                  style={{
                    height: "14px",
                    width: "80%",
                    borderRadius: "4px",
                    backgroundColor: "#161616",
                  }}
                />
                <div
                  style={{
                    height: "12px",
                    width: "45%",
                    borderRadius: "4px",
                    backgroundColor: "#161616",
                  }}
                />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div
            style={{
              textAlign: "center",
              padding: "5rem 1.5rem",
              backgroundColor: S.surface,
              borderRadius: "16px",
              border: `1px solid ${S.border}`,
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "#ffffff" }}>
              No titles match your selection
            </h3>
            <p style={{ color: S.muted, fontSize: "0.88rem", margin: "0 0 1.5rem 0" }}>
              Try selecting a different genre or resetting the sort order.
            </p>
            <button
              onClick={() => {
                setSelectedGenre("");
                setSelectedSort("popularity.desc");
              }}
              style={{
                padding: "0.55rem 1.4rem",
                borderRadius: "9999px",
                backgroundColor: S.red,
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                boxShadow: S.redGlow,
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Results Grid */
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {items.map((item, index) => {
                const poster = posterUrl(item.poster_path, "w342");
                const title = item.title ?? item.name;
                const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
                const score = item.vote_average ? item.vote_average.toFixed(1) : null;
                const isHovered = hoveredId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      navigate(`/${mediaType}/${item.id}`);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                      transform: isHovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                      transition: "transform 0.3s ease",
                      position: "relative",
                    }}
                  >
                    {/* Poster Box */}
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        aspectRatio: "2/3",
                        backgroundColor: S.surfaceHigh,
                        boxShadow: isHovered
                          ? "0 20px 48px rgba(0,0,0,0.85)"
                          : "0 4px 16px rgba(0,0,0,0.45)",
                        border: isHovered ? `2px solid ${S.red}` : "2px solid transparent",
                        transition: "box-shadow 0.3s, border-color 0.3s",
                      }}
                    >
                      {poster ? (
                        <img
                          src={poster}
                          alt={title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallbackPosters[index % fallbackPosters.length];
                          }}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transform: isHovered ? "scale(1.07)" : "scale(1)",
                            transition: "transform 0.5s ease",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.5rem",
                            color: S.faint,
                          }}
                        >
                          🎬
                        </div>
                      )}

                      {/* Score Badge */}
                      {score && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            backgroundColor: "rgba(0,0,0,0.8)",
                            backdropFilter: "blur(8px)",
                            borderRadius: "6px",
                            padding: "2px 7px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: score >= 7 ? "#4ade80" : score >= 5 ? "#fbbf24" : "#f87171",
                          }}
                        >
                          ★ {score}
                        </div>
                      )}

                      {/* Hover Overlay Play Icon */}
                      {isHovered && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #e50914 0%, #b80610 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 4px 20px rgba(229, 9, 20, 0.6)",
                              transform: "scale(1.08)",
                              transition: "transform 0.2s",
                            }}
                          >
                            <span style={{ color: "#ffffff", fontSize: "1.2rem", marginLeft: "3px" }}>
                              ▶
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <p
                      style={{
                        marginTop: "0.65rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: isHovered ? "#ffffff" : S.muted,
                        transition: "color 0.2s",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {title}
                    </p>
                    {year && (
                      <span style={{ fontSize: "0.78rem", color: S.faint, marginTop: "0.15rem" }}>
                        {year}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Pagination / Load More Button ── */}
            {page < totalPages && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "3.5rem",
                  gap: "0.75rem",
                }}
              >
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    padding: "0.85rem 2.5rem",
                    borderRadius: "9999px",
                    background: loadingMore
                      ? "rgba(255,255,255,0.1)"
                      : "linear-gradient(135deg, #e50914 0%, #b80610 100%)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    boxShadow: loadingMore ? "none" : S.redGlow,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                  onMouseEnter={(e) => {
                    if (!loadingMore) e.currentTarget.style.transform = "scale(1.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!loadingMore) e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  {loadingMore ? (
                    <>
                      <span
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#ffffff",
                          animation: "spin 0.8s linear infinite",
                          display: "inline-block",
                        }}
                      />
                      Loading more...
                    </>
                  ) : (
                    <>
                      Load More Titles
                      <span style={{ fontSize: "1.1rem" }}>↓</span>
                    </>
                  )}
                </button>

                <span style={{ fontSize: "0.78rem", color: S.faint }}>
                  Showing {items.length} of {totalResults.toLocaleString()} titles (Page {page} of {totalPages})
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-bg { 0%,100%{background-color:#141414} 50%{background-color:#1f1f1f} }
      `}</style>
    </div>
  );
}
