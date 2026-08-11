// Shared device-tilt state from `deviceorientation`. Projects real gravity
// onto the screen plane so the label pendulums respond to physically tilting
// the phone: `angle` is the screen-plane direction of gravity (0 = straight
// down, CSS-clockwise positive) and `mag` its in-plane strength (1 = held
// upright; a nearly-flat phone falls back to straight-down gravity — see the
// BLEND thresholds below). One listener is shared by all labels.
const DEG = Math.PI / 180;

export const deviceTilt = { angle: 0, mag: 1, active: false };

const listeners = new Set();

// Wakes sleeping label physics loops when the tilt changes noticeably.
export function subscribeTilt(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Wake threshold. Raw phone sensors jitter by a degree or more even when the
// device is perfectly still; at the old 0.01 rad (~0.6°) that noise cleared
// the bar on almost every event and kept every label's physics loop awake
// (never sleeping = constant transform writes under the blur = the mobile
// lag). ~1.7° ignores the noise floor while still waking on any real tilt.
const NOTIFY_EPS = 0.03;
let notifiedAngle = 0;
let notifiedMag = 1;

// Exponential smoothing of the raw in-plane gravity vector. Kills the
// high-frequency sensor noise before it reaches the labels, so a still phone
// produces a steady gravity direction (loops settle and sleep) while a real
// tilt still moves the value within a couple of frames. Seeded to straight
// down so the very first events don't yank the labels.
const SMOOTH = 0.25;
let smoothX = 0;
let smoothY = 1;

const BLEND_LOW = 0.25;
const BLEND_HIGH = 0.55;

// Hard bound on how far the labels' gravity may rotate away from straight
// down. No normal grip tilts the screen-plane gravity past ~±75°; anything
// beyond that (phone genuinely upside-down, or a browser reporting bogus
// orientation angles) would flip the labels over their pins, which always
// reads as broken rather than physical. Clamping here guarantees no sensor
// input can ever invert the labels.
const MAX_TILT = 75 * DEG;

const clampTilt = (v) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));

function onOrientation(e) {
  if (e.beta == null || e.gamma == null) return;
  const beta = e.beta * DEG;
  const gamma = e.gamma * DEG;

  // Gravity in device coords is (sinγ·cosβ, −sinβ, −cosγ·cosβ) with x to the
  // right and y toward the top of the screen; CSS y points down, so gy flips.
  let gx = Math.sin(gamma) * Math.cos(beta);
  let gy = Math.sin(beta);

  // Align device axes with CSS axes when the screen is rotated (landscape).
  const rot = (screen.orientation?.angle ?? window.orientation ?? 0) * DEG;
  if (rot) {
    const cos = Math.cos(rot);
    const sin = Math.sin(rot);
    const x = gx * cos + gy * sin;
    gy = -gx * sin + gy * cos;
    gx = x;
  }

  // Low-pass the vector before it drives anything (see SMOOTH above).
  smoothX += (gx - smoothX) * SMOOTH;
  smoothY += (gy - smoothY) * SMOOTH;
  gx = smoothX;
  gy = smoothY;

  // Confidence in the measured direction, from its in-plane strength.
  const m = Math.min(Math.hypot(gx, gy), 1);
  const t = Math.min(
    Math.max((m - BLEND_LOW) / (BLEND_HIGH - BLEND_LOW), 0),
    1,
  );
  const vx = gx * t;
  const vy = gy * t + (1 - t); // default gravity is (0, 1): straight down

  deviceTilt.angle = clampTilt(Math.atan2(vx, vy));
  deviceTilt.mag = Math.min(Math.hypot(vx, vy), 1);
  deviceTilt.active = true;

  // Compare against the last *notified* values so slow drift still wakes
  // sleeping loops once it accumulates past the threshold.
  if (
    Math.abs(deviceTilt.angle - notifiedAngle) > NOTIFY_EPS ||
    Math.abs(deviceTilt.mag - notifiedMag) > NOTIFY_EPS
  ) {
    notifiedAngle = deviceTilt.angle;
    notifiedMag = deviceTilt.mag;
    listeners.forEach((fn) => fn());
  }
}

let started = false;
let attached = false;

function attach() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("deviceorientation", onOrientation);
}

// True where motion access sits behind a permission dialog (iOS/iPadOS
// Safari). The touch check keeps any desktop browser that happens to expose
// the API from ever seeing the prompt.
export function tiltNeedsPermission() {
  if (typeof window === "undefined") return false;
  const DOE = window.DeviceOrientationEvent;
  return (
    !!DOE &&
    typeof DOE.requestPermission === "function" &&
    navigator.maxTouchPoints > 0
  );
}

// Must be called from a real user-activation event (a click/tap handler) —
// iOS rejects requests made outside one. Resolves to 'granted' | 'denied' |
// 'error' | 'unsupported'; attaches the orientation listener on grant.
export async function requestTiltPermission() {
  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return "unsupported";
  if (typeof DOE.requestPermission !== "function") {
    attach();
    return "granted";
  }
  try {
    const state = await DOE.requestPermission();
    if (state === "granted") attach();
    return state;
  } catch (err) {
    // Rejected without an answer (e.g. insecure context, not a real gesture).
    console.warn("DeviceOrientation permission request failed:", err);
    return "error";
  }
}

// Idempotent. Where no permission dialog exists the listener attaches
// immediately (desktops simply never fire the event, leaving the default
// straight-down gravity untouched). On iOS the MotionPrompt component owns
// the permission flow and calls requestTiltPermission from a tap.
export function initDeviceTilt() {
  if (started || typeof window === "undefined") return;
  started = true;

  const DOE = window.DeviceOrientationEvent;
  if (!DOE) return;
  if (typeof DOE.requestPermission === "function") return;
  attach();
}
