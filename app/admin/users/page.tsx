import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import { ConfirmForm, type ConfirmActionState } from "@/components/admin/confirm-form";
import { auth } from "@/auth";

async function approveUser(_: ConfirmActionState, formData: FormData): Promise<ConfirmActionState> {
    "use server";
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return { error: "관리자 권한이 필요합니다." };
        }
        const userId = formData.get("userId") as string;
        if (!userId) {
            return { error: "유효하지 않은 사용자입니다." };
        }
        await prisma.user.update({
            where: { id: userId },
            data: { isApproved: true },
        });
        revalidatePath("/admin/users");
        return { success: true };
    } catch {
        return { error: "승인 처리 중 오류가 발생했습니다." };
    }
}

export default async function AdminUsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <h1 className="font-display text-3xl mb-6">User Management</h1>
            <div className="space-y-4 md:space-y-0">
                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                                <div className="text-sm font-medium">{user.role}</div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                {user.isApproved ? (
                                    <span className="text-green-600 font-bold text-sm">Approved</span>
                                ) : (
                                    <span className="text-yellow-600 font-bold text-sm">Pending</span>
                                )}
                                {!user.isApproved && (
                                    <ConfirmForm
                                        action={approveUser}
                                        message="이 사용자를 승인하시겠습니까?"
                                        hiddenFields={{ userId: user.id }}
                                    >
                                        <Button size="sm">Approve</Button>
                                    </ConfirmForm>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px]">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="p-4">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">{user.role}</td>
                                    <td className="p-4">
                                        {user.isApproved ? (
                                            <span className="text-green-600 font-bold">Approved</span>
                                        ) : (
                                            <span className="text-yellow-600 font-bold">Pending</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {!user.isApproved && (
                                            <ConfirmForm
                                                action={approveUser}
                                                message="이 사용자를 승인하시겠습니까?"
                                                hiddenFields={{ userId: user.id }}
                                            >
                                                <Button size="sm">Approve</Button>
                                            </ConfirmForm>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
