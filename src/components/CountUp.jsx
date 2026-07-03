import { useEffect, useRef, useState } from 'react'

const COUNT_DURATION_MS = 1600

/**
 * Animated count-up number that starts when scrolled into view and
 * re-animates whenever its `value` prop changes (e.g. async data resolves
 * after the component has already mounted / been revealed).
 * Respects prefers-reduced-motion (renders the final value immediately).
 *
 * @param {{ value: number, className?: string, locale?: string }} props
 */
export default function CountUp({ value = 0, className, locale = 'en-US' }) {
  const target = Number.isFinite(value) ? value : 0
  const ref = useRef(null)
  const displayRef = useRef(0)
  const [inView, setInView] = useState(false)
  const [display, setDisplay] = useState(0)

  // Detect entering the viewport once.
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || !('IntersectionObserver' in window)) {
      setInView(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Animate to the current target whenever it changes while in view.
  // Restarts from the currently displayed number, so async stats that land
  // after the first reveal still count up to the real value.
  useEffect(() => {
    if (!inView) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      displayRef.current = target
      setDisplay(target)
      return
    }

    const from = displayRef.current
    const delta = target - from
    let raf = 0
    let start = null

    const step = (ts) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / COUNT_DURATION_MS, 1)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      const current = Math.round(from + delta * eased)
      displayRef.current = current
      setDisplay(current)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)

    return () => cancelAnimationFrame(raf)
  }, [inView, target])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString(locale)}
    </span>
  )
}
