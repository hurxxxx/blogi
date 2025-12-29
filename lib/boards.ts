import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export type BoardData = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  order: number;
  isVisible: boolean;
};

const DEFAULT_BOARDS = [
  { key: "review", name: "후기", order: 1 },
  { key: "free", name: "자유게시판", order: 2 },
];

export const ensureDefaultBoards = async () => {
  const count = await prisma.board.count();
  if (count > 0) return;
  await prisma.board.createMany({
    data: DEFAULT_BOARDS.map((board) => ({
      key: board.key,
      name: board.name,
      order: board.order,
      isVisible: true,
    })),
  });
};

export const getBoards = async ({
  includeHidden = false,
}: {
  includeHidden?: boolean;
} = {}): Promise<BoardData[]> => {
  await ensureDefaultBoards();
  const boards = await prisma.board.findMany({
    where: includeHidden ? {} : { isVisible: true },
    orderBy: { order: "asc" },
  });
  return boards.map((board) => ({
    id: board.id,
    key: board.key,
    name: board.name,
    description: board.description,
    order: board.order,
    isVisible: board.isVisible,
  }));
};

export const normalizeBoardKey = (key: string, fallbackName?: string) => {
  const trimmed = key.trim();
  if (trimmed) return slugify(trimmed);
  if (fallbackName) return slugify(fallbackName);
  return "";
};
