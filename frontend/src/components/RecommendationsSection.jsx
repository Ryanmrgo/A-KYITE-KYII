import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecommendations, posterUrl } from "../hooks/useTmdb";

const S = {
  surface: "#0e0e0e",
  surfaceHigh: "#161616",
  border: "rgba(255,255,255,0.08)",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.65)",
  faint: "rgba(255,255,255,0.4)",
  red: "#e50914",
};

const fallbackPosters = [
  "/posters/neon_horizon.png",
  "/posters/shadow_protocol.png",
  "/posters/last_kingdom.png",
  "/posters/echoes_of_time.png",
  "/posters/crimson_tide.png",
];

export default function RecommendationsSection({ mediaType = "movie", id }) {
  const navigate = useNavigate();
  const { data: items, loading, error } = useRecommendations(mediaType, id);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (error || (!loading && (!items || items.length === 0))) {
    return null;
  }

  return (
    <div style={{ marginTop: "3.5rem", position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div
            style={{
              width: "4px",
              height: "22px",
              borderRadius: "4px",
              backgroundColor: S.red,
              boxShadow: "0 0 10px rgba(229, 9, 20, 0.7)",
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: "1.35rem",
              fontWeight: 800,
              fontFamily: "'Epilogue', sans-serif",
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            More Like This
          </h2>
          {!loading && items?.length > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                color: S.faint,
                fontWeight: 600,
                marginLeft: "0.3rem",
              }}
            >
              ({items.length})
            </span>
          )}
        </div>

        {/* Scroll arrow buttons */}
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: canScrollLeft ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              color: canScrollLeft ? "#ffffff" : "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: canScrollLeft ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            ←
          </button>
          <button
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: canScrollRight ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
              color: canScrollRight ? "#ffffff" : "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: canScrollRight ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Row container with horizontal scroll */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "1rem",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: "165px",
                  maxWidth: "165px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    aspectRatio: "2/3",
                    borderRadius: "12px",
                    backgroundColor: "#181818",
                    animation: "pulse-bg 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
                <div
                  style={{
                    height: "14px",
                    width: "80%",
                    borderRadius: "4px",
                    backgroundColor: "#181818",
                  }}
                />
              </div>
            ))
          : items.map((item, index) => {
              const poster = posterUrl(item.poster_path, "w342");
              const title = item.title ?? item.name;
              const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
              const score = item.vote_average ? item.vote_average.toFixed(1) : null;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/${mediaType}/${item.id}`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    minWidth: "165px",
                    maxWidth: "165px",
                    flexShrink: 0,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Poster Image Container */}
                  <div
                    style={{
                      position: "relative",
                      borderRadius: "12px",
                      overflow: "hidden",
                      aspectRatio: "2/3",
                      backgroundColor: S.surfaceHigh,
                      border: "1px solid rgba(255,255,255,0.06)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
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
                          fontSize: "2rem",
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
                          borderRadius: "6px",
                          padding: "2px 7px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: score >= 7 ? "#4ade80" : score >= 5 ? "#fbbf24" : "#f87171",
                          backdropFilter: "blur(6px)",
                        }}
                      >
                        ★ {score}
                      </div>
                    )}
                  </div>

                  {/* Title & Release Year */}
                  <p
                    style={{
                      margin: "0.55rem 0 0 0",
                      fontSize: "0.86rem",
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
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: S.faint,
                        marginTop: "0.15rem",
                      }}
                    >
                      {year}
                    </span>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
}
