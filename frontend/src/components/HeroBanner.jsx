export default function HeroBanner({ movie, onPlay }) {
  if (!movie) return null;

  // Split title on newline for multiline display
  const titleLines = movie.title.split("\n");

  return (
    <section className="relative h-[85vh] sm:h-[90vh] lg:h-[921px] w-full overflow-hidden -mt-[72px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={movie.heroImage}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-12 pb-16 sm:pb-24 max-w-4xl">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
          <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
            {movie.badge}
          </span>
          <span className="text-secondary font-bold text-sm tracking-widest uppercase">
            {movie.genreLabel}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-headline font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-4 tracking-tighter leading-none text-on-surface uppercase animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          {titleLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        {/* Description */}
        <p
          className="text-on-surface-variant text-base sm:text-lg md:text-xl mb-8 max-w-2xl font-light leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {movie.description}
        </p>

        {/* Buttons */}
        <div
          className="flex items-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <button
            id="hero-play-button"
            onClick={() => onPlay(movie)}
            className="flex items-center gap-2 bg-on-surface text-surface font-bold py-3 px-6 sm:px-8 rounded-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              play_arrow
            </span>
            Play
          </button>
          <button className="flex items-center gap-2 bg-surface-variant/40 backdrop-blur-md text-on-surface font-bold py-3 px-6 sm:px-8 rounded-xl border border-outline-variant/20 hover:bg-surface-variant/60 transition-colors cursor-pointer">
            <span className="material-symbols-outlined">add</span>
            My List
          </button>
        </div>
      </div>
    </section>
  );
}
