import { useState } from "react";

export default function VideoPlayer({ movie, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!movie) return null;

  const toggleFullscreen = () => {
    const el = document.getElementById("video-player-container");
    if (!document.fullscreenElement) {
      el?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div id="video-player-section" className="animate-scale-in w-full">
      {/* Player Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
          <h2 className="font-headline text-lg sm:text-xl font-semibold text-on-surface tracking-tight">
            Now Playing
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest
                       text-on-surface-variant hover:text-on-surface transition-all duration-300 cursor-pointer"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <span className="material-symbols-outlined text-sm">
              {isFullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest
                       text-on-surface-variant hover:text-on-surface transition-all duration-300 cursor-pointer"
            aria-label="Close player"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div
        id="video-player-container"
        className="relative w-full rounded-2xl overflow-hidden border border-outline-variant/20 shadow-2xl"
        style={{ aspectRatio: "16/9" }}
      >
        <iframe
          src={`https://vidfast.co/e/${movie.videoId}`}
          title={`Playing: ${movie.title}`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          style={{ border: "none" }}
        />
      </div>

      {/* Movie Info */}
      <div className="mt-5 px-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
              {movie.title?.replace("\n", " ")}
            </h3>
            {movie.genreLabel && (
              <span className="text-primary text-sm font-medium mt-1 block">
                {movie.genreLabel}
              </span>
            )}
            {movie.genre && (
              <span className="text-primary text-sm font-medium mt-1 block">
                {movie.genre}
              </span>
            )}
          </div>
          {movie.rating && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/15 border border-primary-container/20">
              <span
                className="material-symbols-outlined text-yellow-400 text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-primary text-sm font-semibold">
                {movie.rating}
              </span>
            </div>
          )}
        </div>
        {movie.description && (
          <p className="mt-3 text-on-surface-variant text-sm leading-relaxed max-w-3xl">
            {movie.description}
          </p>
        )}
      </div>
    </div>
  );
}
