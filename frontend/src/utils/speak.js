/**
 * speak.js — robust Web Speech API helper for mobile browsers.
 *
 * Problems this solves:
 * 1. Voices load asynchronously on mobile — getVoices() returns [] on first
 *    call. We wait for the `voiceschanged` event and cache the list.
 * 2. Many mobile webviews (MiniPay, in-app browsers) have no Arabic voice
 *    installed. We fall back to the default voice rather than staying silent.
 * 3. Mobile Safari/Chrome can garbage-collect the utterance before it plays
 *    if it's a local variable. We keep a ref so it stays alive.
 * 4. Some webviews need `resume()` after a cancel — we call it defensively.
 */

let cachedVoices = null;
let voicesReady = false;

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const v = window.speechSynthesis.getVoices();
  if (v && v.length > 0) {
    cachedVoices = v;
    voicesReady = true;
  }
}

// Kick off voice loading as early as possible.
if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Speak the given text. Safe to call on tap (user gesture).
 * @param {string} text  — the text to speak (Arabic or transliteration).
 * @param {object} opts   — optional: { rate, pitch, lang }
 */
export function speak(text, opts = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("[speak] speechSynthesis not supported");
    return;
  }

  const synth = window.speechSynthesis;

  // Cancel anything in progress, then resume (some webviews pause).
  try {
    synth.cancel();
  } catch (_) {}
  try {
    synth.resume();
  } catch (_) {}

  // Ensure voices are loaded (may still be empty on very first call).
  if (!voicesReady || !cachedVoices || cachedVoices.length === 0) {
    loadVoices();
  }

  const utter = new SpeechSynthesisUtterance(text);
  const voices = cachedVoices || synth.getVoices() || [];

  // Try to find an Arabic voice first.
  let arVoice = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith("ar")
  );

  if (arVoice) {
    utter.voice = arVoice;
    utter.lang = arVoice.lang;
  } else {
    // No Arabic voice — set lang so the engine can try, but don't force a
    // specific voice (let the platform pick its default).
    utter.lang = opts.lang || "ar-SA";
  }

  utter.rate = opts.rate ?? 0.8;
  utter.pitch = opts.pitch ?? 1;
  utter.volume = 1;

  // Keep a reference so the utterance isn't GC'd before it finishes.
  speak._current = utter;

  utter.onend = () => {
    if (speak._current === utter) speak._current = null;
  };
  utter.onerror = (e) => {
    console.warn("[speak] utterance error:", e.error || e);
    if (speak._current === utter) speak._current = null;
  };

  // Small delay helps some mobile engines after a cancel().
  setTimeout(() => {
    try {
      synth.speak(utter);
    } catch (e) {
      console.warn("[speak] synth.speak threw:", e);
    }
  }, 50);
}

/**
 * Pre-warm the speech engine. Call once on app load (or on first user
 * interaction) so voices are ready by the time the user taps speak.
 */
export function primeSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  loadVoices();
  // Some engines need a dummy utterance to "unlock" audio.
  try {
    const u = new SpeechSynthesisUtterance("");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch (_) {}
}
