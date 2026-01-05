import { lexicalJsonToPlainText } from "@/lib/lexical";

export const buildContentHref = (
  categorySlug: string,
  id: string,
  _title?: string | null
) => `/contents/${categorySlug}/${id}`;

const UUID_PREFIX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

export const extractContentId = (idParam: string) => {
  if (!idParam) return idParam;
  const uuidMatch = idParam.match(UUID_PREFIX);
  if (uuidMatch) return uuidMatch[0];
  const [first] = idParam.split("-");
  return first || idParam;
};

export const getContentPlainText = (
  content: string,
  contentMarkdown?: string | null
) => {
  const plainText = lexicalJsonToPlainText(content);
  if (plainText) return plainText;
  if (typeof contentMarkdown === "string") {
    return contentMarkdown.replace(/\s+/g, " ").trim();
  }
  return "";
};

export const truncateText = (text: string, maxLength = 160) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
};
