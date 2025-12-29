import { prisma } from "@/lib/prisma";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export default async function AdminSiteSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({
    where: { key: "default" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">사이트 정보</h1>
        <p className="text-sm text-gray-500 mt-2">
          로고와 사이트 이름을 변경하면 헤더/사이드바/푸터에 반영됩니다.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow">
        <SiteSettingsForm
          initialData={{
            siteName: settings?.siteName ?? "",
            siteLogoUrl: settings?.siteLogoUrl ?? "",
            communityEnabled: settings?.communityEnabled ?? true,
          }}
        />
      </div>
    </div>
  );
}
