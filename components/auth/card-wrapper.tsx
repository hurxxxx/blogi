"use client";

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
}

export const CardWrapper = ({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref
}: CardWrapperProps) => {
    return (
        <Card className="w-full max-w-[400px] mx-4 shadow-md">
            <CardHeader>
                <div className="w-full flex flex-col gap-y-4 items-center justify-center">
                    <h1 className={cn("text-2xl sm:text-3xl font-semibold")}>
                        다낭VIP투어
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {headerLabel}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
            <CardFooter>
                <Button
                    variant="link"
                    className="font-normal w-full"
                    size="sm"
                    asChild
                >
                    <Link href={backButtonHref}>
                        {backButtonLabel}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
