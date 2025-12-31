import Link from "next/link";
import type { ReactNode } from "react";
import { getFooterSettings } from "@/lib/footer-settings";
import { Globe } from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok, FaTelegram, FaXTwitter } from "react-icons/fa6";
import { RiKakaoTalkFill } from "react-icons/ri";

const SOCIAL_ICONS: Record<string, ReactNode> = {
    instagram: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]">
            <FaInstagram className="w-5 h-5 text-white" />
        </span>
    ),
    facebook: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#1877F2]">
            <FaFacebookF className="w-5 h-5 text-white" />
        </span>
    ),
    youtube: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#FF0000]">
            <FaYoutube className="w-5 h-5 text-white" />
        </span>
    ),
    tiktok: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-black">
            <FaTiktok className="w-5 h-5 text-white" />
        </span>
    ),
    telegram: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0088cc]">
            <FaTelegram className="w-5 h-5 text-white" />
        </span>
    ),
    kakao: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#FEE500]">
            <RiKakaoTalkFill className="w-5 h-5 text-[#3C1E1E]" />
        </span>
    ),
    x: (
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-black">
            <FaXTwitter className="w-5 h-5 text-white" />
        </span>
    ),
};

export const Footer = async () => {
    const settings = await getFooterSettings();
    if (!settings.footerEnabled) {
        return null;
    }
    return (
        <footer className="relative overflow-hidden bg-[#0b1320] text-white py-10 border-t border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_90%_0%,rgba(14,165,166,0.2),transparent_60%)]" />
            <div className="container mx-auto px-4 text-center relative space-y-4">
                <h3 className="font-display text-2xl">{settings.siteName || "사이트"}</h3>
                {(settings.showTerms || settings.showPrivacy) && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-white/70">
                        {settings.showTerms && settings.termsContent && (
                            <Link href="/terms" className="hover:text-white transition">
                                이용약관
                            </Link>
                        )}
                        {settings.showPrivacy && settings.privacyContent && (
                            <Link href="/privacy" className="hover:text-white transition">
                                개인정보처리방침
                            </Link>
                        )}
                    </div>
                )}
                {settings.showBusinessInfo && settings.businessLines.length > 0 && (
                    <div className="text-xs text-white/60 space-y-1">
                        {settings.businessLines.map((line, index) => (
                            <div key={`${line}-${index}`}>{line}</div>
                        ))}
                    </div>
                )}
                {settings.showSocials && settings.socialLinks.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4">
                        {settings.socialLinks.map((link) => (
                            <Link
                                key={`${link.key}-${link.url}`}
                                href={link.url}
                                className="hover:opacity-80 transition"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                            >
                                {SOCIAL_ICONS[link.key] ?? <Globe className="w-5 h-5 text-white" />}
                            </Link>
                        ))}
                    </div>
                )}
                {settings.showCopyright && (
                    <p className="text-xs text-white/50 uppercase tracking-[0.2em]">
                        {settings.copyrightText ||
                          (settings.siteName
                            ? `Copyright © ${settings.siteName}. All rights reserved.`
                            : "Copyright © All rights reserved.")}
                    </p>
                )}
            </div>
        </footer>
    );
};
