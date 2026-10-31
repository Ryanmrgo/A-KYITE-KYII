export const STREAMING_SERVERS = [
  {
    id: "vidfast",
    name: "Server 1 (VidFast)",
    badge: "Default • Auto-Resume",
    getMovieUrl: (id, startAt = 0) =>
      `https://vidfast.pro/movie/${id}?autoPlay=false${startAt > 30 ? `&startFrom=${startAt}` : ""}`,
    getTvUrl: (id, season, episode, startAt = 0) =>
      `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=false&nextButton=true&autoNext=true${startAt > 30 ? `&startFrom=${startAt}` : ""}`,
  },
  {
    id: "superembed",
    name: "Server 2 (SuperEmbed)",
    badge: "Multi-Source",
    getMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    getTvUrl: (id, season, episode) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc",
    name: "Server 3 (VidSrc)",
    badge: "HD Stream",
    getMovieUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "autoembed",
    name: "Server 4 (AutoEmbed)",
    badge: "Alternative",
    getMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "2embed",
    name: "Server 5 (2Embed)",
    badge: "Backup",
    getMovieUrl: (id) => `https://www.2embed.cc/embed/${id}`,
    getTvUrl: (id, season, episode) =>
      `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
  },
];

export const DEFAULT_SERVER_ID = "vidfast";
