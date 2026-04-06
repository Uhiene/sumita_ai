import { useState, useEffect } from "react";

/**
 * Returns live breakpoint flags based on window width.
 * isMobile  < 768px   (phones, iPhone SE = 375px)
 * isTablet  768–1023px
 * isDesktop >= 1024px
 */
export function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    function onResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}
