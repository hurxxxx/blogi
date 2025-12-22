"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [type, setType] = useState("FREE");
    const [authorId, setAuthorId] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchPost();
        }
    }, [params.id]);

    const fetchPost = async () => {
        try {
            const res = await fetch(`/api/posts/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title);
                setContent(data.content);
                setType(data.type);
                setAuthorId(data.authorId);
            } else {
                router.push("/community");
            }
        } catch (error) {
            router.push("/community");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!session) {
        router.push("/login");
        return null;
    }

    // Check permission
    const isAuthor = session.user?.id === authorId;
    const isAdmin = session.user?.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
        router.push("/community");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim() || !content.trim()) {
            setError("제목과 내용을 모두 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/posts/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content, type }),
            });

            if (res.ok) {
                router.push(`/community/${params.id}`);
            } else {
                const data = await res.json();
                setError(data.error || "수정에 실패했습니다.");
            }
        } catch (err) {
            setError("서버 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Button variant="ghost" className="mb-6" asChild>
                <Link href={`/community/${params.id}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    돌아가기
                </Link>
            </Button>

            <h1 className="text-2xl font-bold mb-6">글 수정</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="type">게시판</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FREE">자유게시판</SelectItem>
                            <SelectItem value="REVIEW">후기</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        disabled={saving}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows={15}
                        disabled={saving}
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link href={`/community/${params.id}`}>취소</Link>
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
