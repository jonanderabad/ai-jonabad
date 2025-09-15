"use client";
import { useEffect, useRef, useState } from "react";

export function useRetryAfter() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (seconds > 0 && timerRef.current === null) {
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            if (timerRef.current !== null) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000) as unknown as number;
    }
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [seconds]);

  return {
    isRateLimited: seconds > 0,
    seconds,
    start: (s: number) => setSeconds(Math.max(0, Math.floor(s))),
    reset: () => setSeconds(0),
  };
}
