import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Set initial value inside effect to handle hydration mismatch, but wrapping in RAF handles the cascade warning
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    mql.addEventListener("change", onChange)
    
    // Defer the initial set
    requestAnimationFrame(() => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT))
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
