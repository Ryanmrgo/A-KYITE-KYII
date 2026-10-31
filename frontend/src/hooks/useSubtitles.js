import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';

/**
 * Parses an SRT subtitle string into an array of cue objects.
 * Each cue: { id, start, end, text }  (start/end in seconds)
 */
export function parseSRT(srt) {
  const cues = [];
  // Normalize line endings
  const blocks = srt.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    // First line may be index number (optional)
    let idx = 0;
    if (/^\d+$/.test(lines[0].trim())) idx = 1;

    const timeLine = lines[idx];
    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!match) continue;

    const toSec = (h, m, s, ms) => parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
    const start = toSec(match[1], match[2], match[3], match[4]);
    const end = toSec(match[5], match[6], match[7], match[8]);

    const text = lines
      .slice(idx + 1)
      .join('\n')
      // Strip basic HTML tags that appear in some SRT files
      .replace(/<[^>]+>/g, '')
      .trim();

    if (text) cues.push({ start, end, text });
  }
  return cues;
}

/**
 * Fetches subtitle list from our backend proxy → OpenSubtitles
 */
async function fetchSubtitleList(type, tmdbId, season = null, episode = null) {
  const params = new URLSearchParams({ type, tmdb_id: tmdbId, languages: 'en' });
  if (season != null) params.set('season_number', season);
  if (episode != null) params.set('episode_number', episode);

  const res = await fetch(`${API_URL}/api/subtitles/search?${params}`);
  if (!res.ok) throw new Error('Subtitle search failed: ' + res.status);
  return res.json(); // { subtitles: [...] }
}

/**
 * Downloads the actual SRT content via our backend proxy (avoids CORS).
 */
async function downloadSubtitle(fileId) {
  const res = await fetch(`${API_URL}/api/subtitles/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });
  if (!res.ok) throw new Error('Subtitle download failed: ' + res.status);
  const data = await res.json();
  return data.content; // raw SRT text
}

/**
 * Main hook.
 *
 * @param {'movie'|'tv'} type
 * @param {number|string} tmdbId
 * @param {number|null} season   - for TV only
 * @param {number|null} episode  - for TV only
 *
 * Returns:
 *   cues         - parsed subtitle cues array
 *   languages    - available language options [{ label, fileId }]
 *   selectedLang - currently selected fileId
 *   setLang      - select a language to load
 *   status       - 'idle' | 'loading' | 'ready' | 'error' | 'not_found'
 *   error        - error message string or null
 *   loadFromFile - (File) => void  — load a local .srt file
 */
export function useSubtitles(type, tmdbId, season = null, episode = null) {
  const [languages, setLanguages] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [cues, setCues] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  // Fetch the list of available subtitle files whenever the media changes
  useEffect(() => {
    if (!tmdbId) return;
    setStatus('loading');
    setLanguages([]);
    setCues([]);
    setError(null);
    setSelectedFileId(null);

    fetchSubtitleList(type, tmdbId, season, episode)
      .then(({ subtitles }) => {
        if (!subtitles || subtitles.length === 0) {
          setStatus('not_found');
          return;
        }
        // Deduplicate by language, prefer higher download count
        const byLang = {};
        for (const sub of subtitles) {
          const lang = sub.attributes?.language || 'en';
          const count = sub.attributes?.download_count || 0;
          if (!byLang[lang] || count > byLang[lang].count) {
            byLang[lang] = {
              label: sub.attributes?.language?.toUpperCase() || 'EN',
              fileId: sub.attributes?.files?.[0]?.file_id,
              count,
              releaseName: sub.attributes?.release || '',
            };
          }
        }
        const langs = Object.values(byLang).filter((l) => l.fileId);
        setLanguages(langs);
        if (langs.length > 0) {
          setSelectedFileId(langs[0].fileId);
        } else {
          setStatus('not_found');
        }
      })
      .catch((err) => {
        console.error('[useSubtitles] list error:', err);
        setStatus('error');
        setError(err.message);
      });
  }, [type, tmdbId, season, episode]);

  // Download SRT whenever selectedFileId changes
  useEffect(() => {
    if (!selectedFileId) return;
    setStatus('loading');
    setCues([]);

    downloadSubtitle(selectedFileId)
      .then((srtText) => {
        const parsed = parseSRT(srtText);
        if (parsed.length === 0) {
          setStatus('error');
          setError('Subtitle file appears to be empty or malformed.');
        } else {
          setCues(parsed);
          setStatus('ready');
          setError(null);
        }
      })
      .catch((err) => {
        console.error('[useSubtitles] download error:', err);
        setStatus('error');
        setError(err.message);
      });
  }, [selectedFileId]);

  // Allow loading a local file
  const loadFromFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseSRT(e.target.result);
      setCues(parsed);
      setStatus('ready');
      setError(null);
      setLanguages((prev) => {
        const exists = prev.find((l) => l.fileId === '__local__');
        if (exists) return prev;
        return [{ label: 'LOCAL', fileId: '__local__', releaseName: file.name }, ...prev];
      });
      setSelectedFileId('__local__');
    };
    reader.readAsText(file);
  }, []);

  return {
    cues,
    languages,
    selectedLang: selectedFileId,
    setLang: setSelectedFileId,
    status,
    error,
    loadFromFile,
  };
}
