// Featured hero movie
export const heroMovie = {
  id: "hero-1",
  title: "Nebula\nPulse",
  badge: "Original",
  genreLabel: "Sci-Fi Epic",
  description:
    "In a galaxy fueled by synthetic dreams, one pilot must cross the event horizon to recover a memory that could reset the universe.",
  heroImage: "/scenes/hero_bg.png",
  videoId: "nebula-pulse-2025",
};

// Continue Watching data
export const continueWatching = [
  {
    id: "cw-1",
    title: "The Final Frontier",
    subtitle: "S2 : E4 • 12m left",
    progress: 65,
    image: "/scenes/continue_cosmic.png",
    videoId: "final-frontier-2025",
  },
  {
    id: "cw-2",
    title: "Cinema Classics",
    subtitle: "Episode 1 • 45m left",
    progress: 30,
    image: "/scenes/continue_projector.png",
    videoId: "cinema-classics-2025",
  },
  {
    id: "cw-3",
    title: "Midnight Paradox",
    subtitle: "S1 : E8 • 4m left",
    progress: 90,
    image: "/scenes/continue_portal.png",
    videoId: "midnight-paradox-2025",
  },
];

// Trending posters (reuse existing movie posters)
export const trendingMovies = [
  {
    id: "t-1",
    title: "Shadow Protocol",
    genre: "Adventure",
    rating: 4.8,
    poster: "/posters/shadow_protocol.png",
    videoId: "shadow-protocol-2025",
  },
  {
    id: "t-2",
    title: "The Last Kingdom",
    genre: "Drama",
    rating: 4.9,
    poster: "/posters/last_kingdom.png",
    videoId: "last-kingdom-2024",
  },
  {
    id: "t-3",
    title: "Midnight Run",
    genre: "Action",
    rating: 4.7,
    poster: "/posters/midnight_run.png",
    videoId: "midnight-run-2024",
  },
  {
    id: "t-4",
    title: "Neon Horizon",
    genre: "Thriller",
    rating: 4.6,
    poster: "/posters/neon_horizon.png",
    videoId: "neon-horizon-2025",
  },
  {
    id: "t-5",
    title: "The Frozen Heart",
    genre: "Indie",
    rating: 4.8,
    poster: "/posters/frozen_heart.png",
    videoId: "frozen-heart-2025",
  },
  {
    id: "t-6",
    title: "Echoes of Time",
    genre: "Fantasy",
    rating: 4.5,
    poster: "/posters/echoes_of_time.png",
    videoId: "echoes-of-time-2025",
  },
];

// Sci-Fi Bento Grid
export const sciFiHits = {
  main: {
    id: "sf-1",
    title: "Interstellar Network",
    description:
      "The web that connects us is deeper than we imagined. A journey through the fiber of reality.",
    image: "/scenes/bento_earth.png",
    videoId: "interstellar-network-2025",
  },
  side: {
    id: "sf-2",
    title: "Core Ignition",
    image: "/scenes/bento_lab.png",
    videoId: "core-ignition-2025",
  },
  small: [
    {
      id: "sf-3",
      title: "Horizon Zero",
      image: "/scenes/bento_stars.png",
      videoId: "horizon-zero-2025",
    },
    {
      id: "sf-4",
      title: "Mars Protocol",
      image: "/scenes/bento_mars.png",
      videoId: "mars-protocol-2025",
    },
  ],
};

// Binge-Worthy Dramas (reuse posters as landscape thumbnails)
export const dramaShows = [
  {
    id: "d-1",
    title: "The Last Encore",
    description: "A story of ambition, loss, and the music that remains.",
    badge: "New Episodes",
    image: "/posters/silent_echo.png",
    videoId: "last-encore-2025",
  },
  {
    id: "d-2",
    title: "London Shadows",
    description: "Secrets hidden in plain sight across the ancient city.",
    badge: "Most Popular",
    image: "/posters/crimson_tide.png",
    videoId: "london-shadows-2025",
  },
  {
    id: "d-3",
    title: "Dinner at Eight",
    description: "Small talk has never carried such heavy consequences.",
    badge: null,
    image: "/posters/frozen_heart.png",
    videoId: "dinner-at-eight-2025",
  },
];
