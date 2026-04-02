import { useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const VIDFAST_ORIGINS = [
  "https://vidfast.pro",
  "https://vidfast.in",
  "https://vidfast.io",
  "https://vidfast.me",
  "https://vidfast.net",
  "https://vidfast.pm",
  "https://vidfast.xyz",
];

const SAVE_INTERVAL_MS = 15_000; // Save to Firestore every 15 seconds

/**
 * Listens to Vidfast MEDIA_DATA postMessage events, buffers them,
 * and throttle-writes progress to Firestore watchProgress field.
 *
 * @param {object} currentUser  - Firebase user from AuthContext
 */
export function useWatchProgress(currentUser) {
  const pendingRef = useRef(null);   // latest progress data waiting to be flushed
  const timerRef = useRef(null);     // throttle timer

  useEffect(() => {
    const handleMessage = ({ origin, data }) => {
      if (!VIDFAST_ORIGINS.includes(origin) || !data) return;
      if (data.type !== "MEDIA_DATA") return;
      if (!currentUser?.uid) return;

      const mediaData = data.data; // The nested object from Vidfast
      if (!mediaData) return;

      // Build our storage key (e.g. "m533535" or "t63174")
      const keys = Object.keys(mediaData);
      if (!keys.length) return;

      // Store latest data for the throttle flush
      pendingRef.current = { uid: currentUser.uid, mediaData };
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentUser?.uid]);

  // Throttle timer — flush to Firestore at most every SAVE_INTERVAL_MS
  useEffect(() => {
    if (!currentUser?.uid) return;

    timerRef.current = setInterval(async () => {
      if (!pendingRef.current) return;
      const { uid, mediaData } = pendingRef.current;
      pendingRef.current = null; // clear buffer

      try {
        // Merge each media key (m123, t456 etc.) into watchProgress
        const updates = {};
        for (const [key, val] of Object.entries(mediaData)) {
          updates[`watchProgress.${key}`] = val;
        }
        await updateDoc(doc(db, "users", uid), updates);
      } catch (e) {
        console.warn("[useWatchProgress] Failed to save progress:", e);
      }
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [currentUser?.uid]);
}

/**
 * Given a user's profile and a media ID + type, returns the saved progress
 * as a { watched, duration } object, or null if none.
 */
export function getSavedProgress(profile, mediaId, mediaType) {
  if (!profile?.watchProgress) return null;
  const key = mediaType === "movie" ? `m${mediaId}` : `t${mediaId}`;
  const entry = profile.watchProgress[key];
  if (!entry?.progress) return null;
  return entry.progress; // { watched, duration }
}

/**
 * Returns the list of "Continue Watching" items from the user's watchProgress,
 * sorted by last_updated desc, filtered to items < 95% complete.
 */
export function getContinueWatchingList(profile) {
  if (!profile?.watchProgress) return [];
  return Object.values(profile.watchProgress)
    .filter((item) => {
      const { watched, duration } = item.progress || {};
      if (!watched || !duration) return false;
      const pct = watched / duration;
      return pct > 0.01 && pct < 0.95; // between 1% and 95% viewed
    })
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0))
    .slice(0, 10);
}
