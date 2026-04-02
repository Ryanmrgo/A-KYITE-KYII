export default function BentoGrid({ data, onPlay }) {
  return (
    <section className="px-6 sm:px-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline text-2xl sm:text-4xl font-black uppercase tracking-tighter">
          Sci-Fi Hits
        </h2>
        <a
          href="#"
          className="text-primary font-bold text-xs sm:text-sm tracking-widest uppercase hover:underline"
        >
          Explore Genre
        </a>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[500px]">
        {/* Main — Large card */}
        <button
          onClick={() => onPlay(data.main)}
          className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl text-left min-h-[300px]"
        >
          <img
            src={data.main.image}
            alt={data.main.title}
            className="w-full h-full object-cover group-hover:scale-105 duration-1000 transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end">
            <h3 className="font-headline text-2xl sm:text-3xl font-bold mb-2">
              {data.main.title}
            </h3>
            <p className="text-on-surface-variant max-w-sm mb-6 text-sm sm:text-base">
              {data.main.description}
            </p>
            <span className="bg-primary-container text-on-primary-container py-2 px-6 rounded-lg font-bold w-fit hover:bg-red-700 transition-colors text-sm">
              Watch Now
            </span>
          </div>
        </button>

        {/* Side — Tall card */}
        <button
          onClick={() => onPlay(data.side)}
          className="md:col-span-1 relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl text-left min-h-[240px]"
        >
          <img
            src={data.side.image}
            alt={data.side.title}
            className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
            <h3 className="font-bold text-lg sm:text-xl">{data.side.title}</h3>
          </div>
        </button>

        {/* Small — 2 stacked cards */}
        <div className="md:col-span-1 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-4">
          {data.small.map((item) => (
            <button
              key={item.id}
              onClick={() => onPlay(item)}
              className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-2xl text-left min-h-[120px]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 duration-700 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                <h3 className="font-bold text-sm sm:text-base">
                  {item.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
