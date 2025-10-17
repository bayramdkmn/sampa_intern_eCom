"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsTransitioning(true);
    startTimeRef.current = performance.now();

    const checkPageLoad = () => {
      const loadTime = performance.now() - startTimeRef.current;
      const minLoadingTime = 200;
      const maxLoadingTime = 2500;
      
      let actualLoadingTime;
      
      if (loadTime < 300) {
        actualLoadingTime = minLoadingTime;
      } else if (loadTime < 800) {
        actualLoadingTime = loadTime * 0.7;
      } else {
        actualLoadingTime = Math.min(loadTime * 0.5, maxLoadingTime);
      }

      console.log(`Sayfa yükleme süresi: ${loadTime.toFixed(0)}ms, Loading süresi: ${actualLoadingTime.toFixed(0)}ms`);

      timerRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, actualLoadingTime);
    };

    if (document.readyState === 'loading') {
      const handleDOMContentLoaded = () => {
        setTimeout(checkPageLoad, 50);
      };
      
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
      
      return () => {
        document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
      };
    } else {
      setTimeout(checkPageLoad, 100);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, searchParams]);

  return isTransitioning;
}