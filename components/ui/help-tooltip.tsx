"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  /** 도움말 내용 */
  content: string;
  /** 아이콘 크기 (기본: 16px) */
  iconSize?: number;
  /** 추가 클래스명 */
  className?: string;
  /** 팝오버 최대 너비 (기본: 280px) */
  maxWidth?: number;
}

/**
 * 도움말 툴팁 컴포넌트
 *
 * 라벨 옆에 ? 아이콘을 표시하고, 클릭 시 설명 팝오버를 보여줍니다.
 *
 * @example
 * ```tsx
 * <label className="flex items-center gap-1.5">
 *   사이트 이름
 *   <HelpTooltip content="상단과 브라우저 탭에 표시되는 사이트 이름입니다." />
 * </label>
 * ```
 */
export function HelpTooltip({
  content,
  iconSize = 16,
  className,
  maxWidth = 280,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 클릭 외부 감지하여 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 팝오버 위치 계산 (화면 밖으로 나가지 않도록)
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // 아래쪽 공간이 부족하면 위로 표시
    if (spaceBelow < 150 && spaceAbove > spaceBelow) {
      setPosition("top");
    } else {
      setPosition("bottom");
    }
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("relative inline-flex", className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-full"
        aria-label="도움말 보기"
        aria-expanded={isOpen}
      >
        <HelpCircle style={{ width: iconSize, height: iconSize }} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="tooltip"
          className={cn(
            "absolute z-50 animate-in fade-in-0 zoom-in-95 duration-150",
            position === "bottom"
              ? "top-full mt-2 origin-top"
              : "bottom-full mb-2 origin-bottom"
          )}
          style={{ maxWidth, minWidth: 200 }}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 relative">
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* 내용 */}
            <p className="pr-5 leading-relaxed whitespace-pre-line">{content}</p>

            {/* 화살표 */}
            <div
              className={cn(
                "absolute left-4 w-2.5 h-2.5 bg-gray-900 rotate-45",
                position === "bottom" ? "-top-1" : "-bottom-1"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 라벨과 도움말 툴팁을 함께 렌더링하는 컴포넌트
 *
 * @example
 * ```tsx
 * <LabelWithHelp
 *   label="OG 이미지 URL"
 *   help="카카오톡, 페이스북 등 SNS에서 링크를 공유할 때 미리보기에 표시되는 이미지입니다. 권장 크기: 1200x630px"
 * />
 * ```
 */
export function LabelWithHelp({
  label,
  help,
  className,
  labelClassName,
}: {
  label: string;
  help: string;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <label className={cn("text-sm font-medium", labelClassName)}>{label}</label>
      <HelpTooltip content={help} iconSize={14} />
    </div>
  );
}
