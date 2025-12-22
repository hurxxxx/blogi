"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, LogOut, Settings, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSession, signOut } from "next-auth/react";

const routes = [
    {
        href: "/products/casino",
        label: "카지노",
    },
    {
        href: "/products/nightlife",
        label: "다낭 유흥",
    },
    {
        href: "/products/promotion",
        label: "프로모션",
    },
    {
        href: "/products/vip-trip",
        label: "VIP 여행",
    },
    {
        href: "/products/tip",
        label: "여행 TIP",
    },
    {
        href: "/products/hotel-villa",
        label: "호텔 & 풀빌라",
    },
    {
        href: "/products/golf",
        label: "골프 & 레저",
    },
    {
        href: "/community",
        label: "후기 & 자유게시판",
    },
];

export const Header = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <>
        <div className="w-full bg-[#0a192f] text-white">
            {/* Top Bar */}
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="메뉴 열기"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <Link href="/" className="flex items-center gap-x-2">
                    {/* Logo */}
                    <Image
                        src="/logo.png"
                        alt="다낭VIP투어 로고"
                        width={200}
                        height={67}
                        className="h-16 w-auto"
                        priority
                    />
                    <span className="text-xl font-bold">다낭VIP투어</span>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex relative w-[400px]">
                    <Input
                        className="w-full pl-4 pr-10 bg-white text-black rounded-full"
                        placeholder="검색..."
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Auth Buttons / User Menu - Desktop */}
                <div className="hidden md:flex items-center gap-x-4 text-sm">
                    {session ? (
                        <>
                            <span className="text-gray-300">
                                {session.user?.name || session.user?.email}님
                            </span>
                            {session.user?.role === "ADMIN" && (
                                <Link href="/admin" className="hover:text-sky-400 transition flex items-center gap-1">
                                    <Settings className="w-4 h-4" />
                                    관리자
                                </Link>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="hover:text-sky-400 transition flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-sky-400 transition">
                                로그인
                            </Link>
                            <Link href="/register" className="hover:text-sky-400 transition">
                                회원가입
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile placeholder for alignment */}
                <div className="md:hidden w-10" />
            </div>

            {/* Navigation Bar - Desktop */}
            <div className="hidden md:block border-t border-white/10">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center justify-between overflow-x-auto">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "px-4 py-4 text-sm font-medium transition-colors hover:text-sky-400 whitespace-nowrap",
                                    pathname === route.href || pathname?.startsWith(route.href + "/")
                                        ? "text-sky-400 border-b-2 border-sky-400"
                                        : "text-white"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
            <div
                className="md:hidden fixed inset-0 bg-black/50 z-40"
                onClick={closeSidebar}
            />
        )}

        {/* Mobile Sidebar */}
        <div
            className={cn(
                "md:hidden fixed top-0 left-0 h-full w-72 bg-[#0a192f] text-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
        >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <Link href="/" className="flex items-center gap-x-2" onClick={closeSidebar}>
                    <Image
                        src="/logo.png"
                        alt="다낭VIP투어 로고"
                        width={150}
                        height={50}
                        className="h-12 w-auto"
                    />
                    <span className="text-lg font-bold">다낭VIP투어</span>
                </Link>
                <button
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                    onClick={closeSidebar}
                    aria-label="메뉴 닫기"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Search Bar */}
            <div className="p-4 border-b border-white/10">
                <div className="relative">
                    <Input
                        className="w-full pl-4 pr-10 bg-white text-black rounded-full"
                        placeholder="검색..."
                    />
                    <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="py-2">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        onClick={closeSidebar}
                        className={cn(
                            "block px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10",
                            pathname === route.href || pathname?.startsWith(route.href + "/")
                                ? "text-sky-400 bg-white/5 border-l-4 border-sky-400"
                                : "text-white"
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile Auth Section */}
            <div className="border-t border-white/10 p-4">
                {session ? (
                    <div className="space-y-3">
                        <div className="text-gray-300 text-sm">
                            {session.user?.name || session.user?.email}님
                        </div>
                        {session.user?.role === "ADMIN" && (
                            <Link
                                href="/admin"
                                onClick={closeSidebar}
                                className="flex items-center gap-2 text-sm hover:text-sky-400 transition"
                            >
                                <Settings className="w-4 h-4" />
                                관리자
                            </Link>
                        )}
                        <button
                            onClick={() => {
                                closeSidebar();
                                signOut({ callbackUrl: "/" });
                            }}
                            className="flex items-center gap-2 text-sm hover:text-sky-400 transition"
                        >
                            <LogOut className="w-4 h-4" />
                            로그아웃
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Link
                            href="/login"
                            onClick={closeSidebar}
                            className="block w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white text-center rounded-lg transition"
                        >
                            로그인
                        </Link>
                        <Link
                            href="/register"
                            onClick={closeSidebar}
                            className="block w-full py-2 px-4 border border-white/30 hover:bg-white/10 text-white text-center rounded-lg transition"
                        >
                            회원가입
                        </Link>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};
