import { Filter, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

const genres = [
  "All",
  "Sci-Fi",
  "Action",
  "Thriller",
  "Fantasy",
  "Horror",
  "Romance",
  "Drama",
  "Adventure",
  "Crime",
];

export default function GenreFilter({ activeGenre, onGenreChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Desktop genre chips */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer
                       ${
                         activeGenre === genre
                           ? "bg-accent-primary text-white shadow-[0_0_20px_var(--color-accent-glow)]"
                           : "bg-surface-tertiary/60 text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-border-subtle"
                       }`}
          >
            {genre === "All" && <Sparkles size={11} className="inline mr-1 -mt-0.5" />}
            {genre}
          </button>
        ))}
      </div>

      {/* Mobile dropdown */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-sm text-text-secondary
                     hover:text-text-primary transition-all duration-300 cursor-pointer"
        >
          <Filter size={14} />
          <span>{activeGenre}</span>
          <ChevronDown
            size={14}
            className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 w-48 rounded-xl glass p-2 space-y-0.5 z-40 animate-scale-in">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  onGenreChange(genre);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                           ${
                             activeGenre === genre
                               ? "bg-accent-primary/15 text-accent-primary font-medium"
                               : "text-text-secondary hover:text-text-primary hover:bg-surface-tertiary"
                           }`}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
