"use client";

import { useState, useEffect, useCallback } from "react";

export interface ScrollHeaderState {
  isScrolled: boolean;
  scrollY: number;
  direction: "up" | "down" | null;
}

/**
 * 헤더 스크롤 감지 훅
 * @param threshold 스크롤 임계값 (기본 50px)
 * @param enabled 스크롤 효과 활성화 여부
 */
export function useScrollHeader(
  threshold = 50,
  enabled = true
): ScrollHeaderState {
  const [state, setState] = useState<ScrollHeaderState>({
    isScrolled: false,
    scrollY: 0,
    direction: null,
  });

  const updateScrollState = useCallback(() => {
    const scrollY = window.scrollY;

    setState((prev) => {
      const direction =
        scrollY > prev.scrollY ? "down" : scrollY < prev.scrollY ? "up" : null;

      return {
        isScrolled: scrollY > threshold,
        scrollY,
        direction,
      };
    });
  }, [threshold]);

  useEffect(() => {
    if (!enabled) {
      setState({ isScrolled: false, scrollY: 0, direction: null });
      return;
    }

    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    // 초기 상태 설정
    updateScrollState();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [enabled, updateScrollState]);

  return state;
}
