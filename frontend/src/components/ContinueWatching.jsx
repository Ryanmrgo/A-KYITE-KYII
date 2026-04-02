export default function ContinueWatching({ items, onPlay }) {
  return (
    <section className="pl-6 sm:pl-12">
      <h2 className="font-headline text-xl sm:text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
        Continue Watching
        <span className="material-symbols-outlined text-primary-container text-sm">
          chevron_right
        </span>
      </h2>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pr-6 sm:pr-12">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onPlay(item)}
            className="flex-none w-64 sm:w-80 group cursor-pointer text-left"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-2xl">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface text-5xl opacity-0 group-hover:opacity-100 transition-opacity">
                  play_circle
                </span>
              </div>
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-container-highest">
                <div
                  className="h-full bg-primary-container transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
            <h3 className="font-bold text-sm text-on-surface">{item.title}</h3>
            <p className="text-xs text-on-surface-variant font-medium">
              {item.subtitle}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
