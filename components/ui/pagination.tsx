"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseHref: string;
  queryKey?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  baseHref,
  queryKey = "page",
}: PaginationProps) => {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(queryKey, String(page));
    return `${baseHref}?${params.toString()}`;
  };

  // 페이지 번호 범위 계산 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {/* 이전 버튼 */}
      <Link
        href={buildHref(Math.max(1, currentPage - 1))}
        className={`p-2 rounded-lg border text-sm transition-colors ${
          currentPage === 1
            ? "pointer-events-none text-gray-300 border-gray-200 bg-gray-50"
            : "hover:bg-gray-50 border-gray-300 text-gray-600"
        }`}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {/* 페이지 번호들 */}
      <div className="flex items-center gap-1">
        {pageNumbers[0] > 1 && (
          <>
            <Link
              href={buildHref(1)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 text-gray-600"
            >
              1
            </Link>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-gray-400">...</span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={buildHref(page)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              page === currentPage
                ? "bg-primary text-white border-primary"
                : "border-gray-200 hover:bg-gray-50 text-gray-600"
            }`}
          >
            {page}
          </Link>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <Link
              href={buildHref(totalPages)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 text-gray-600"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* 다음 버튼 */}
      <Link
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        className={`p-2 rounded-lg border text-sm transition-colors ${
          currentPage === totalPages
            ? "pointer-events-none text-gray-300 border-gray-200 bg-gray-50"
            : "hover:bg-gray-50 border-gray-300 text-gray-600"
        }`}
        aria-disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
