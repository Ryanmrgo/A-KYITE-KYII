import { useState, useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Netflix-style SubtitleWrapper
   • First-click overlay auto-syncs the timer (no manual "Start Sync" button)
   • Clean cue display: white text, subtle shadow, smooth fade
   • Floating settings panel (gear icon) for offset, language, upload, font size
   • Keyboard shortcut:  C  → toggle CC
───────────────────────────────────────────────────────────────────────────── */

const FONT_SIZES = ['small', 'medium', 'large', 'xlarge'];
const FONT_SIZE_MAP = {
  small:  'clamp(0.8rem,  1.6vw, 1rem)',
  medium: 'clamp(1rem,    2.2vw, 1.35rem)',
  large:  'clamp(1.2rem,  2.8vw, 1.7rem)',
  xlarge: 'clamp(1.5rem,  3.4vw, 2.1rem)',
};

export function SubtitleWrapper({ children, containerStyle, ...subtitleProps }) {
  const { cues = [], languages = [], selectedLang, setLang, status, error, loadFromFile } = subtitleProps;

  /* ── state ── */
  const [enabled, setEnabled]       = useState(true);
  const [synced,  setSynced]        = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [offsetSec, setOffsetSec]   = useState(0);
  const [fontSize, setFontSize]     = useState('medium');
  const [showSettings, setShowSettings] = useState(false);
  const [toast, setToast]           = useState('');        // brief status toast
  const [clickReady, setClickReady] = useState(false);     // overlay ready after cues load

  /* ── refs ── */
  const timerRef     = useRef(null);
  const startRef     = useRef(null);
  const fileInputRef = useRef(null);
  const settingsRef  = useRef(null);
  const toastTimer   = useRef(null);

  /* ── show toast helper ── */
  const showToast = useCallback((msg, ms = 2200) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), ms);
  }, []);

  /* ── timer ── */
  const startSync = useCallback((extraOffsetMs = 0) => {
    if (timerRef.current) clearInterval(timerRef.current);
    startRef.current = performance.now() - extraOffsetMs;
    setSynced(true);
    timerRef.current = setInterval(() => {
      setElapsed((performance.now() - startRef.current) / 1000);
    }, 80);
  }, []);

  const resetSync = useCallback(() => {
    clearInterval(timerRef.current);
    setSynced(false);
    setElapsed(0);
    startRef.current = null;
    showToast('⏹ Timer reset');
  }, [showToast]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearTimeout(toastTimer.current);
  }, []);

  /* ── show overlay once cues are ready ── */
  useEffect(() => {
    if (status === 'ready' && cues.length > 0 && !synced) {
      setClickReady(true);
    }
  }, [status, cues.length, synced]);

  /* ── keyboard shortcut: C = toggle CC ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'c' || e.key === 'C') {
        setEnabled(v => {
          showToast(v ? 'CC OFF' : 'CC ON');
          return !v;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showToast]);

  /* ── close settings on outside click ── */
  useEffect(() => {
    const onOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  /* ── active cue ── */
  const adjustedTime = elapsed + offsetSec;
  const activeCue = synced && enabled && cues.length > 0
    ? cues.find(c => adjustedTime >= c.start && adjustedTime <= c.end) ?? null
    : null;

  /* ── handlers ── */
  const handleOverlayClick = useCallback(() => {
    setClickReady(false);
    startSync(0);
    showToast('▶ Synced! Subtitles running…');
  }, [startSync, showToast]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { loadFromFile(file); showToast('📂 Subtitle file loaded'); }
    e.target.value = '';
  };

  const cycleFont = () => {
    setFontSize(s => {
      const next = FONT_SIZES[(FONT_SIZES.indexOf(s) + 1) % FONT_SIZES.length];
      showToast(`Font: ${next}`);
      return next;
    });
  };

  /* ── status badge ── */
  const badge = {
    idle:      null,
    loading:   { text: 'Loading subtitles…', color: '#facc15' },
    ready:     { text: `✓ ${cues.length} subtitle cues ready`, color: '#4ade80' },
    error:     { text: `⚠ ${error || 'Subtitle error'}`, color: '#f87171' },
    not_found: { text: '⚠ No subtitles found', color: '#f87171' },
  }[status];

  return (
    <div style={{ width: '100%', position: 'relative' }}>

      {/* ── Video container ── */}
      <div style={{ position: 'relative', ...containerStyle }}>
        {children}

        {/* ── First-click sync overlay ── */}
        {clickReady && !synced && (
          <div
            onClick={handleOverlayClick}
            style={{
              position: 'absolute', inset: 0, zIndex: 20,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {/* Pulse ring */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              border: '3px solid rgba(255,255,255,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
              animation: 'sub-pulse 1.8s ease-in-out infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p style={{
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              margin: 0, letterSpacing: '0.02em',
            }}>
              Click when video starts to sync subtitles
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem',
              marginTop: '0.4rem',
            }}>
              Subtitles ready · {cues.length} cues
            </p>
          </div>
        )}

        {/* ── Netflix-style subtitle cue ── */}
        {activeCue && (
          <div
            key={activeCue.start}
            style={{
              position: 'absolute', bottom: '8%', left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              pointerEvents: 'none', zIndex: 15,
              animation: 'sub-fadein 0.15s ease',
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            <div style={{
              display: 'inline-block',
              padding: '0.3em 0.8em',
              backgroundColor: 'rgba(0,0,0,0.78)',
              color: '#ffffff',
              fontSize: FONT_SIZE_MAP[fontSize],
              fontFamily: "'Netflix Sans', 'Inter', 'Segoe UI', Arial, sans-serif",
              fontWeight: 500,
              lineHeight: 1.5,
              textAlign: 'center',
              maxWidth: '75%',
              whiteSpace: 'pre-line',
              textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6)',
              borderRadius: '4px',
              letterSpacing: '0.01em',
            }}>
              {activeCue.text}
            </div>
          </div>
        )}

        {/* ── Floating controls (top-right corner) ── */}
        <div style={{
          position: 'absolute', top: '0.6rem', right: '0.6rem',
          zIndex: 25, display: 'flex', gap: '0.4rem', alignItems: 'center',
        }}>
          {/* CC toggle */}
          <button
            onClick={() => setEnabled(v => { showToast(v ? 'CC OFF' : 'CC ON'); return !v; })}
            title="Toggle subtitles (C)"
            style={iconBtn(enabled ? '#e50914' : 'rgba(0,0,0,0.55)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <path d="M7 12h2m2 0h4M7 16h4m2 0h2"/>
            </svg>
          </button>

          {/* Settings gear */}
          <div ref={settingsRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSettings(v => !v)}
              title="Subtitle settings"
              style={iconBtn(showSettings ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.55)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            {/* Settings panel */}
            {showSettings && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                backgroundColor: '#141414',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '1rem',
                minWidth: '240px',
                boxShadow: '0 16px 48px rgba(0,0,0,0.8)',
                zIndex: 99,
                color: '#fff',
                fontSize: '0.82rem',
              }}>
                <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}>
                  Subtitle Settings
                </p>

                {/* Font size */}
                <SettingRow label="Size">
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {FONT_SIZES.map(s => (
                      <button key={s} onClick={() => { setFontSize(s); }} style={pillBtn(fontSize === s)}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </SettingRow>

                {/* Sync */}
                <SettingRow label="Sync">
                  {!synced ? (
                    <button
                      onClick={() => { startSync(0); showToast('▶ Timer started'); setShowSettings(false); }}
                      style={{ ...pillBtn(false), backgroundColor: '#16a34a', borderColor: '#15803d' }}
                    >
                      ▶ Start Now
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>
                        ⏱ {Math.floor(elapsed / 60)}:{String(Math.floor(elapsed) % 60).padStart(2, '0')}
                      </span>
                      <button onClick={resetSync} style={{ ...pillBtn(false), backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
                        Reset
                      </button>
                    </div>
                  )}
                </SettingRow>

                {/* Offset */}
                <SettingRow label="Offset">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button onClick={() => setOffsetSec(v => +(v - 0.5).toFixed(1))} style={pillBtn(false)}>−0.5s</button>
                    <span style={{
                      minWidth: '3.5rem', textAlign: 'center', fontWeight: 700,
                      color: offsetSec !== 0 ? '#fbbf24' : 'rgba(255,255,255,0.5)',
                    }}>
                      {offsetSec > 0 ? '+' : ''}{offsetSec}s
                    </span>
                    <button onClick={() => setOffsetSec(v => +(v + 0.5).toFixed(1))} style={pillBtn(false)}>+0.5s</button>
                    {offsetSec !== 0 && (
                      <button onClick={() => setOffsetSec(0)} style={{ ...pillBtn(false), color: 'rgba(255,255,255,0.5)' }}>✕</button>
                    )}
                  </div>
                </SettingRow>

                {/* Language */}
                {languages.length > 0 && (
                  <SettingRow label="Language">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {languages.map(lang => (
                        <button
                          key={lang.fileId}
                          onClick={() => { setLang(lang.fileId); showToast(`Language: ${lang.label}`); }}
                          style={pillBtn(lang.fileId === selectedLang)}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                )}

                {/* Upload */}
                <SettingRow label="Upload">
                  <button onClick={() => fileInputRef.current?.click()} style={pillBtn(false)}>
                    📂 Upload .srt
                  </button>
                </SettingRow>

                <input ref={fileInputRef} type="file" accept=".srt,.vtt" style={{ display: 'none' }} onChange={handleFileChange} />

                {/* Hint */}
                <p style={{ margin: '0.75rem 0 0', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>
                  Press <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '0 4px', borderRadius: 3 }}>C</kbd> to toggle CC
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Status badge (bottom-left, small) ── */}
        {badge && !synced && (
          <div style={{
            position: 'absolute', bottom: '0.5rem', left: '0.6rem',
            zIndex: 15, pointerEvents: 'none',
            backgroundColor: 'rgba(0,0,0,0.65)',
            color: badge.color,
            fontSize: '0.7rem', fontWeight: 600,
            padding: '0.2rem 0.55rem', borderRadius: '999px',
            letterSpacing: '0.02em',
          }}>
            {badge.text}
          </div>
        )}
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(20,20,20,0.95)',
          color: '#fff', padding: '0.55rem 1.2rem',
          borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          zIndex: 9999, pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.1)',
          animation: 'sub-fadein 0.2s ease',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      {/* ── Keyframe styles ── */}
      <style>{`
        @keyframes sub-fadein {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sub-pulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────────────────────────── */

function SettingRow({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.65rem' }}>
      <span style={{ color: 'rgba(255,255,255,0.55)', minWidth: '60px' }}>{label}</span>
      {children}
    </div>
  );
}

function iconBtn(bg) {
  return {
    width: 34, height: 34,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: bg,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.2s',
    flexShrink: 0,
  };
}

function pillBtn(active) {
  return {
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    border: `1px solid ${active ? '#e50914' : 'rgba(255,255,255,0.18)'}`,
    backgroundColor: active ? '#e50914' : 'rgba(255,255,255,0.08)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.76rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  };
}

export default SubtitleWrapper;
