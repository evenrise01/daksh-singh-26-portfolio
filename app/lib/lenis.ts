import Lenis from 'lenis'
import gsap from 'gsap'

let lenis: Lenis | null = null

export function initLenis(): Lenis {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })

  gsap.ticker.add((time: number) => {
    lenis!.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis(): Lenis | null {
  return lenis
}

export function destroyLenis(): void {
  lenis?.destroy()
  lenis = null
}