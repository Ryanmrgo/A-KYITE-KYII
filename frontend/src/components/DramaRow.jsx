export default function DramaRow({ shows, onPlay }) {
  return (
    <section className="pl-6 sm:pl-12">
      <h2 className="font-headline text-xl sm:text-2xl font-bold mb-6 tracking-tight">
        Binge-Worthy Dramas
      </h2>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pr-6 sm:pr-12">
        {shows.map((show) => (
          <button
            key={show.id}
            onClick={() => onPlay(show)}
            className="flex-none w-[260px] sm:w-[320px] group cursor-pointer text-left"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
              <img
                src={show.image}
                alt={show.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {show.badge && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-on-surface">
                  {show.badge}
                </div>
              )}
            </div>
            <h3 className="font-bold text-sm text-on-surface">{show.title}</h3>
            <p className="text-sm text-on-surface-variant line-clamp-1">
              {show.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
