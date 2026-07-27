/**
 * speak.js - robust text-to-speech for mobile webviews (MiniPay, wallet
 * dapp browsers, in-app browsers).
 *
 * Strategy:
 * 1. Try the Web Speech API (speechSynthesis) - works in regular browsers.
 * 2. If speechSynthesis is missing or fails, fall back to an HTML5 <audio>
 *    element playing a Google Translate TTS URL. This works in any webview
 *    that can play audio (which is nearly all of them).
 *
 * The TTS fallback is critical because many in-app webviews (especially
 * crypto wallet browsers like MiniPay) do NOT implement speechSynthesis
 * at all, even though they can play audio elements fine.
 */

let cachedVoices = null;
let voicesReady = false;
let speechSupported = false;

// Detect speechSynthesis support.
if (typeof window !== "undefined") {
  speechSupported =
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";
}

function loadVoices() {
  if (!speechSupported) return;
  const v = window.speechSynthesis.getVoices();
  if (v && v.length > 0) {
    cachedVoices = v;
    voicesReady = true;
  }
}

// Kick off voice loading as early as possible.
if (speechSupported) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

// ── Audio fallback (TTS URL) ──────────────────────────────────
let audioEl = null;

function getAudioEl() {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.crossOrigin = "anonymous";
  }
  return audioEl;
}

/**
 * Play text via Google Translate TTS audio URL.
 * This endpoint returns an MP3 audio stream for the given text.
 * @param {string} text
 * @param {string} lang  - e.g. "ar" for Arabic
 */
function speakViaAudio(text, lang = "ar") {
  const audio = getAudioEl();
  if (!audio) {
    console.warn("[speak] No audio element available");
    return;
  }

  // Stop any current playback.
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (_e) {
    /* ignore - audio element may not have started playback yet */
  }

  // Build TTS URL. Google Translate TTS endpoint.
  // textchunk: max ~200 chars per request.
  const encoded = encodeURIComponent(text.slice(0, 200));
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;

  audio.src = ttsUrl;
  audio.playbackRate = 0.85;
  audio.volume = 1;

  // play() returns a promise; catch rejection (e.g. autoplay policy).
  const p = audio.play();
  if (p && typeof p.catch === "function") {
    p.catch((e) => {
      console.warn("[speak] Audio playback failed:", e);
    });
  }
}

/**
 * Speak the given text. Safe to call on tap (user gesture).
 * @param {string} text  - the text to speak (Arabic or transliteration).
 * @param {object} opts   - optional: { rate, pitch, lang, forceAudio }
 */
export function speak(text, opts = {}) {
  if (typeof window === "undefined") {
    console.warn("[speak] window not available");
    return;
  }

  const lang = opts.lang || "ar";

  // If forceAudio is set, skip speechSynthesis entirely.
  if (!opts.forceAudio && speechSupported) {
    const synth = window.speechSynthesis;

    try {
      synth.cancel();
    } catch (_e) {
      /* cancel() can throw if no speech is queued; safe to ignore */
    }
    try {
      synth.resume();
    } catch (_e) {
      /* resume() can throw on some engines when nothing is paused */
    }

    if (!voicesReady || !cachedVoices || cachedVoices.length === 0) {
      loadVoices();
    }

    const utter = new SpeechSynthesisUtterance(text);
    const voices = cachedVoices || synth.getVoices() || [];

    let arVoice = voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith("ar")
    );

    if (arVoice) {
      utter.voice = arVoice;
      utter.lang = arVoice.lang;
    } else {
      utter.lang = lang === "ar" ? "ar-SA" : lang;
    }

    utter.rate = opts.rate ?? 0.8;
    utter.pitch = opts.pitch ?? 1;
    utter.volume = 1;

    speak._current = utter;

    let speechFailed = false;

    utter.onend = () => {
      if (speak._current === utter) speak._current = null;
    };
    utter.onerror = (e) => {
      console.warn("[speak] speechSynthesis error:", e.error || e);
      if (speak._current === utter) speak._current = null;
      // If speechSynthesis fails, try audio fallback.
      if (!speechFailed) {
        speechFailed = true;
        speakViaAudio(text, lang);
      }
    };

    // Small delay helps some mobile engines after cancel().
    setTimeout(() => {
      try {
        synth.speak(utter);
      } catch (e) {
        console.warn("[speak] synth.speak threw:", e);
        // Fall back to audio TTS.
        speakViaAudio(text, lang);
      }
    }, 50);

    // Safety: if speechSynthesis doesn't fire onend within 3s, it's
    // probably not working in this webview. Fall back to audio.
    setTimeout(() => {
      if (speak._current === utter && !speechFailed) {
        console.warn("[speak] speechSynthesis timed out, falling back to audio");
        speechFailed = true;
        try {
          synth.cancel();
        } catch (_e) {
          /* ignore - best-effort cancel before falling back to audio */
        }
        speakViaAudio(text, lang);
      }
    }, 3000);

    return;
  }

  // No speechSynthesis - use audio TTS fallback.
  speakViaAudio(text, lang);
}

/**
 * Pre-warm the speech engine. Call once on app load (or on first user
 * interaction) so voices are ready by the time the user taps speak.
 */
export function primeSpeech() {
  if (speechSupported) {
    loadVoices();
    // Some engines need a dummy utterance to "unlock" audio.
    try {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch (_e) {
      /* priming can fail silently on unsupported engines; non-fatal */
    }
  }
  // Also pre-create the audio element so it's ready.
  getAudioEl();
}

/**
 * Check if speech is likely to work in this environment.
 * Returns "speech" if speechSynthesis is available, "audio" if only
 * audio fallback will work, or "none" if neither is available.
 */
export function speechCapability() {
  if (speechSupported) return "speech";
  if (typeof window !== "undefined" && typeof Audio !== "undefined") return "audio";
  return "none";
}

/**
 * Stop any ongoing speech immediately. Cancels both the Web Speech API
 * utterance queue and pauses the audio fallback element. Safe to call
 * when nothing is playing - it is a no-op in that case. Useful when the
 * user navigates away from a screen, taps a "stop" button, or starts a
 * new utterance that should preempt the previous one.
 */
export function stopSpeaking() {
  if (speechSupported) {
    try {
      window.speechSynthesis.cancel();
    } catch (_e) {
      /* cancel can throw on some engines; non-fatal */
    }
  }
  if (audioEl) {
    try {
      audioEl.pause();
      // Reset currentTime so the next play() starts from the beginning
      // rather than resuming mid-stream.
      audioEl.currentTime = 0;
    } catch (_e) {
      /* pause can throw if the element is in an invalid state; non-fatal */
    }
  }
}
