export const easeInOutQuint = (t) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
export const easeOutCubic = (t) => 1 - (1 - t) ** 3
export const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))
export const easeOutQuart = (t) => 1 - (1 - t) ** 4

export const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))

export const lerp = (a, b, t) => a + (b - a) * t

export const SMOOTH = {
  scroll: 2.4,
  section: 2.4,
  pan: 2.4,
  align: 2.2,
  section3: 2.2,
  section4: 2.2,
  section5: 2.2,
  section6: 2.2,
  phase: 2.0,
  exit: 2.2,
}

export const GL_LERP_SPEED = 6

export const stagger = (t, delay, span = 0.6) => {
  if (t <= delay) return 0
  return easeOutQuart(Math.min(1, (t - delay) / span))
}

export const applyEntrance = (el, amount, opts = {}) => {
  if (!el) return
  const eased = easeOutCubic(amount)
  const y = (1 - eased) * (opts.y ?? 24)
  const blur = (1 - eased) * (opts.blur ?? 8)
  const scale = 0.96 + eased * 0.04
  el.style.opacity = String(eased)
  el.style.transform = `translateY(${y}px) scale(${scale})`
  el.style.filter = `blur(${blur}px)`
}

export const ENTRANCE_EASE = [0.33, 1, 0.68, 1]

export const ENTRANCE_TRANSITION = {
  duration: 0.55,
  ease: ENTRANCE_EASE,
}

export const LAYOUT_TRANSITION = {
  duration: 0.45,
  ease: ENTRANCE_EASE,
}
