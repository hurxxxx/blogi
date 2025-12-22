import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
    role: "ADMIN" | "USER";
    isApproved: boolean;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}
