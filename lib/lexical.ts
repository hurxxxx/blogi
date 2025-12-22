export const lexicalJsonToPlainText = (value: string) => {
  if (!value) return "";

  try {
    const data = JSON.parse(value);
    if (!data || typeof data !== "object") return value.trim();

    const texts: string[] = [];
    const walk = (node: unknown) => {
      if (!node || typeof node !== "object") return;
      const record = node as { text?: unknown; children?: unknown };
      if (typeof record.text === "string") {
        texts.push(record.text);
      }
      if (Array.isArray(record.children)) {
        record.children.forEach(walk);
      }
    };

    walk(data.root);
    return texts.join(" ").replace(/\s+/g, " ").trim();
  } catch {
    return value.replace(/\s+/g, " ").trim();
  }
};
