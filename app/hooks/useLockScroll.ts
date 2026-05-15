import { useLenis } from 'lenis/react'
import { useEffect } from 'react'

export function useLockScroll(locked: boolean): void {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return
    locked ? lenis.stop() : lenis.start()
    return () => { lenis.start() }
  }, [locked, lenis])
}