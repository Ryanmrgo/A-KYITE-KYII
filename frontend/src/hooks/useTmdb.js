import { useState, useEffect } from 'react';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiUrl = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);
const BASE_URL = apiUrl + '/api/tmdb';
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || apiUrl + '/api/image';
const EMPTY_RESPONSE = { results: [] };

function tmdbFetch(path, signal) {
  return fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    signal,
  }).then((res) => {
    if (!res.ok) throw new Error('Backend Error ' + res.status + ': ' + path);
    return res.json();
  });
}

function useTmdbResource(requestKey, initialData, enabled = true) {
  const [state, setState] = useState({ key: null, data: initialData, error: null });

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    tmdbFetch(requestKey, controller.signal)
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState({ key: requestKey, data: initialData, error: error.message });
        }
      });

    return () => controller.abort();
  }, [requestKey, enabled, initialData]);

  const isCurrentRequest = state.key === requestKey;
  return {
    data: isCurrentRequest ? state.data : initialData,
    loading: enabled && !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
  };
}

export function useMovieDetails(movieId) {
  const requestKey = movieId ? '/movie/' + movieId + '?append_to_response=credits,videos' : '';
  return useTmdbResource(requestKey, null, Boolean(movieId));
}

export function useTvDetails(seriesId) {
  const requestKey = seriesId ? '/tv/' + seriesId + '?append_to_response=credits' : '';
  return useTmdbResource(requestKey, null, Boolean(seriesId));
}

export function useSeasonDetails(seriesId, seasonNumber) {
  const enabled = Boolean(seriesId) && seasonNumber != null;
  const requestKey = enabled ? '/tv/' + seriesId + '/season/' + seasonNumber : '';
  return useTmdbResource(requestKey, null, enabled);
}

export function useTrending(mediaType = 'movie', timeWindow = 'week') {
  const requestKey = '/trending/' + mediaType + '/' + timeWindow;
  const resource = useTmdbResource(requestKey, EMPTY_RESPONSE);
  return { ...resource, data: resource.data.results || [] };
}

export function useSearch(query) {
  const normalizedQuery = query?.trim() || '';
  const enabled = normalizedQuery.length > 0;
  const requestKey = enabled
    ? '/search/multi?query=' + encodeURIComponent(normalizedQuery) + '&include_adult=false'
    : '';
  const resource = useTmdbResource(requestKey, EMPTY_RESPONSE, enabled);
  const data = (resource.data.results || []).filter(
    (result) => result.media_type === 'movie' || result.media_type === 'tv'
  );
  return { ...resource, data };
}

export const posterUrl = (p, s = 'w500') => p ? IMAGE_BASE + '/' + s + p : null;
export const backdropUrl = (p, s = 'w1280') => p ? IMAGE_BASE + '/' + s + p : null;
export const stillUrl = (p, s = 'w300') => p ? IMAGE_BASE + '/' + s + p : null;

export function formatRuntime(m) {
  if (!m) return null;
  const h = Math.floor(m / 60), min = m % 60;
  return h > 0 ? h + 'h ' + min + 'm' : min + 'm';
}
export function getTopCast(credits, n = 5) {
  return credits?.cast?.slice(0, n) || [];
}
export function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
