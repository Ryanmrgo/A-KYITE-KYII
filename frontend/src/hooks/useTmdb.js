import { useState, useEffect } from "react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = `${apiUrl}/api/tmdb`;
const IMAGE_BASE = "https://image.tmdb.org/t/p";

function tmdbFetch(path) {
  // path usually starts with a slash like '/movie/popular'
  return fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error(`Backend Error ${res.status}: ${path}`);
    return res.json();
  });
}

/* ── Movie details ───────────────────────────────────── */
export function useMovieDetails(movieId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!movieId) return;
    setLoading(true); setError(null);
    tmdbFetch(`/movie/${movieId}?append_to_response=credits,videos`)
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [movieId]);
  return { data, loading, error };
}

/* ── TV show details ─────────────────────────────────── */
export function useTvDetails(seriesId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!seriesId) return;
    setLoading(true); setError(null);
    tmdbFetch(`/tv/${seriesId}?append_to_response=credits`)
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [seriesId]);
  return { data, loading, error };
}

/* ── Season episodes ─────────────────────────────────── */
export function useSeasonDetails(seriesId, seasonNumber) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!seriesId || seasonNumber == null) return;
    setLoading(true); setError(null);
    tmdbFetch(`/tv/${seriesId}/season/${seasonNumber}`)
      .then((j) => { setData(j); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [seriesId, seasonNumber]);
  return { data, loading, error };
}

/* ── Trending (week) ─────────────────────────────────── */
export function useTrending(mediaType = "movie", timeWindow = "week") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    setLoading(true); setError(null);
    tmdbFetch(`/trending/${mediaType}/${timeWindow}`)
      .then((j) => { setData(j.results ?? []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [mediaType, timeWindow]);
  return { data, loading, error };
}

/* ── Search ──────────────────────────────────────────── */
export function useSearch(query) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query || query.trim() === "") {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true); setError(null);
    // /search/multi catches both tv and movies
    tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`)
      .then((j) => { 
        // Filter out people, keep only movie/tv
        const filtered = (j.results ?? []).filter(r => r.media_type === 'movie' || r.media_type === 'tv');
        setData(filtered); 
        setLoading(false); 
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [query]);

  return { data, loading, error };
}

/* ── Image helpers ───────────────────────────────────── */
export const posterUrl  = (p, s = "w500")  => p ? `${IMAGE_BASE}/${s}${p}` : null;
export const backdropUrl = (p, s = "w1280") => p ? `${IMAGE_BASE}/${s}${p}` : null;
export const stillUrl   = (p, s = "w300")  => p ? `${IMAGE_BASE}/${s}${p}` : null;

/* ── Misc helpers ────────────────────────────────────── */
export function formatRuntime(m) {
  if (!m) return null;
  const h = Math.floor(m / 60), min = m % 60;
  return h > 0 ? `${h}h ${min}m` : `${min}m`;
}
export function getTopCast(credits, n = 5) {
  return credits?.cast?.slice(0, n) ?? [];
}
export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
