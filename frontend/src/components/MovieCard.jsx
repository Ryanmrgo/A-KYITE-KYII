import { Play, Star, Clock } from "lucide-react";
import { useState } from "react";

export default function MovieCard({ movie, isActive, onClick, index }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <button
      id={`movie-card-${movie.id}`}
      onClick={onClick}
      className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer
                  transition-all duration-500 ease-out outline-none w-full text-left
                  ${
                    isActive
                      ? "ring-2 ring-accent-primary shadow-[0_0_30px_var(--color-accent-glow)]"
                      : "ring-1 ring-border-subtle hover:ring-border-active"
                  }
                  hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_30px_var(--color-accent-glow)]
                  focus-visible:ring-2 focus-visible:ring-accent-primary
                  bg-surface-secondary`}
      style={{
        animationDelay: `${index * 80}ms`,
      }}
      aria-label={`Play ${movie.title}`}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {/* Shimmer loading skeleton */}
        {!isImageLoaded && (
          <div
            className="absolute inset-0 bg-surface-tertiary"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        )}

        <img
          src={movie.poster}
          alt={movie.title}
          className={`w-full h-full object-cover transition-all duration-700 ease-out
                     group-hover:scale-110 group-hover:brightness-110
                     ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      flex items-center justify-center"
        >
          <div
            className="w-14 h-14 rounded-full bg-accent-primary/90 backdrop-blur-sm flex items-center justify-center
                        transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out
                        shadow-[0_0_30px_var(--color-accent-glow)]"
          >
            <Play size={22} fill="white" className="text-white ml-0.5" />
          </div>
        </div>

        {/* Rating badge */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full
                      glass text-xs font-semibold"
        >
          <Star size={11} className="text-accent-amber" fill="currentColor" />
          <span className="text-text-primary">{movie.rating}</span>
        </div>

        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-primary/90 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-bold uppercase tracking-wider">
              Playing
            </span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="p-4 flex flex-col gap-1.5">
        <h3
          className="font-display font-semibold text-sm text-text-primary truncate
                     group-hover:text-accent-primary transition-colors duration-300"
        >
          {movie.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-xs">{movie.genre}</span>
          <div className="flex items-center gap-1 text-text-muted">
            <Clock size={10} />
            <span className="text-[10px]">{movie.duration}</span>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500
                   ${
                     isActive
                       ? "bg-gradient-to-r from-accent-primary via-accent-cyan to-accent-pink opacity-100"
                       : "bg-gradient-to-r from-accent-primary to-accent-cyan opacity-0 group-hover:opacity-100"
                   }`}
      />
    </button>
  );
}
