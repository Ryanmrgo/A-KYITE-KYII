export default function TrendingRow({ movies, onPlay }) {
  return (
    <section className="pl-6 sm:pl-12">
      <h2 className="font-headline text-xl sm:text-2xl font-bold mb-6 tracking-tight">
        Trending Now
      </h2>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pr-6 sm:pr-12">
        {movies.map((movie) => (
          <button
            key={movie.id}
            onClick={() => onPlay(movie)}
            className="flex-none w-[160px] sm:w-[200px] aspect-[2/3] rounded-xl overflow-hidden
                       relative group cursor-pointer
                       ring-primary/0 hover:ring-2 ring-offset-4 ring-offset-background
                       transition-all duration-300"
          >
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform"
              loading="lazy"
            />
            {/* Hover info overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <span className="text-on-primary-container text-[10px] font-bold uppercase mb-1">
                {movie.genre}
              </span>
              <div className="flex items-center gap-1 mb-2">
                <span
                  className="material-symbols-outlined text-yellow-400 text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="text-xs font-bold text-on-surface">
                  {movie.rating}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
