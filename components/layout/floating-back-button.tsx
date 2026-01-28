"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface FloatingBackButtonProps {
  href?: string;
  label?: string;
  scrollThreshold?: number;
}

export function FloatingBackButton({
  href,
  label = "뒤로 가기",
  scrollThreshold = 240,
}: FloatingBackButtonProps) {
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={`fixed bottom-6 left-4 z-50 rounded-full border border-black/5 bg-white/90 p-3 text-foreground shadow-[0_20px_45px_-30px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:bg-white sm:bottom-8 sm:left-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}
