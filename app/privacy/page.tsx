import type { Metadata } from "next";
import { getFooterSettings } from "@/lib/footer-settings";
import { RichTextViewer } from "@/components/editor/rich-text-viewer";

export const metadata: Metadata = {
  title: "개인정보처리방침",
};

export default async function PrivacyPage() {
  const settings = await getFooterSettings();
  if (!settings.privacyContent) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="font-display text-3xl mb-6">개인정보처리방침</h1>
        <div className="bg-gray-50 rounded-lg p-6 text-gray-500 text-center">
          개인정보처리방침이 아직 등록되지 않았습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <h1 className="font-display text-3xl mb-6">개인정보처리방침</h1>
      <RichTextViewer content={settings.privacyContent} />
    </div>
  );
}
