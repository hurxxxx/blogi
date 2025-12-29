import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { UserManager } from "@/components/admin/user-manager";

export default async function AdminUsersPage() {
  const session = await auth();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-3xl">사용자 관리</h1>
            <p className="text-sm text-gray-500 mt-2">
              회원 목록을 확인하고 권한을 관리할 수 있습니다.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            총 {users.length}명의 사용자
          </div>
        </div>
      </div>

      <UserManager users={users} currentUserId={session?.user?.id} />
    </div>
  );
}
