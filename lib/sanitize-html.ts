import sanitizeHtml from "sanitize-html";

const colorRegex =
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$|^rgb\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?\)$|^rgba\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?(0|1|0?\.\d+)\s?\)$/;

export const sanitizeHtmlContent = (dirty: string) => {
    return sanitizeHtml(dirty, {
        allowedTags: [
            "p",
            "br",
            "strong",
            "b",
            "em",
            "i",
            "u",
            "s",
            "strike",
            "blockquote",
            "code",
            "pre",
            "ul",
            "ol",
            "li",
            "h1",
            "h2",
            "h3",
            "span",
            "mark",
            "img",
            "a",
        ],
        allowedAttributes: {
            a: ["href", "name", "target", "rel"],
            img: ["src", "alt", "title", "width", "height"],
            span: ["style"],
            p: ["style"],
            h1: ["style"],
            h2: ["style"],
            h3: ["style"],
            mark: ["style", "data-color"],
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        allowedSchemesByTag: {
            img: ["http", "https"],
        },
        allowedStyles: {
            "*": {
                color: [colorRegex],
                "background-color": [colorRegex],
                "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
            },
        },
        transformTags: {
            a: (tagName, attribs) => {
                const rel =
                    attribs.target === "_blank"
                        ? "noopener noreferrer nofollow"
                        : attribs.rel;
                return {
                    tagName,
                    attribs: {
                        ...attribs,
                        rel,
                    },
                };
            },
        },
    });
};
