"use server";

import * as z from "zod";
import { signIn } from "@/auth";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "계정이 없습니다" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            // 승인 대기 중인 사용자 체크
            if (error.cause?.err?.message === "PENDING_APPROVAL") {
                return { error: "관리자 승인 대기 중입니다. 승인 후 로그인이 가능합니다." };
            }

            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };

                default:
                    return { error: "로그인에 실패했습니다." };
            }
        }

        throw error;
    }

    return { success: "로그인 성공!" };
};
