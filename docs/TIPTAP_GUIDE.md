# Tiptap 3.x 사용 가이드

## 설치된 패키지

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder
npm install @tiptap/extension-text-align @tiptap/extension-underline
npm install @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-highlight
```

## Tiptap 3.x 주요 변경사항

### 1. Named Exports 사용
Tiptap 3.x에서는 default export 대신 named export를 사용합니다:

```typescript
// Tiptap 2.x (이전)
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

// Tiptap 3.x (현재)
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
```

### 2. BubbleMenu/FloatingMenu 위치 변경
메뉴 컴포넌트가 별도 경로로 이동:

```typescript
// Tiptap 2.x
import { BubbleMenu, FloatingMenu } from "@tiptap/react";

// Tiptap 3.x
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
```

### 3. Floating UI 사용
tippy.js 대신 @floating-ui/dom 사용:

```bash
npm install @floating-ui/dom@^1.6.0
```

```typescript
// 옵션도 변경됨
<BubbleMenu
  options={{
    offset: 6,
    placement: 'top',
  }}
>
```

### 4. Next.js SSR 설정
클라이언트 컴포넌트에서 `immediatelyRender: false` 필수:

```typescript
const editor = useEditor({
  extensions: [StarterKit],
  content: '<p>Hello World!</p>',
  immediatelyRender: false, // SSR 오류 방지
});
```

## 기본 사용법

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";

export function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      console.log(editor.getHTML());
    },
  });

  if (!editor) return null;

  return <EditorContent editor={editor} />;
}
```

## 확장 기능 설정

### StarterKit
기본 기능 (굵게, 기울임, 제목, 목록 등) 포함:

```typescript
StarterKit.configure({
  heading: {
    levels: [1, 2, 3],
  },
})
```

### Image
이미지 삽입:

```typescript
Image.configure({
  HTMLAttributes: {
    class: "max-w-full h-auto rounded-lg",
  },
})

// 사용
editor.chain().focus().setImage({ src: url }).run();
```

### Link
링크 삽입:

```typescript
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: "text-blue-500 underline",
  },
})

// 사용
editor.chain().focus().setLink({ href: url }).run();
editor.chain().focus().unsetLink().run();
```

### TextAlign
텍스트 정렬:

```typescript
TextAlign.configure({
  types: ["heading", "paragraph"],
})

// 사용
editor.chain().focus().setTextAlign("center").run();
```

### Highlight
하이라이트:

```typescript
Highlight.configure({
  multicolor: true,
})

// 사용
editor.chain().focus().toggleHighlight({ color: "#fef08a" }).run();
```

## 에디터 명령어

```typescript
// 텍스트 서식
editor.chain().focus().toggleBold().run();
editor.chain().focus().toggleItalic().run();
editor.chain().focus().toggleUnderline().run();
editor.chain().focus().toggleStrike().run();
editor.chain().focus().toggleCode().run();

// 제목
editor.chain().focus().toggleHeading({ level: 1 }).run();

// 목록
editor.chain().focus().toggleBulletList().run();
editor.chain().focus().toggleOrderedList().run();

// 인용
editor.chain().focus().toggleBlockquote().run();

// 실행 취소
editor.chain().focus().undo().run();
editor.chain().focus().redo().run();

// 콘텐츠 삽입
editor.chain().focus().insertContent("텍스트").run();

// 활성 상태 확인
editor.isActive("bold");
editor.isActive("heading", { level: 1 });
```

## 이모지 피커 통합 (emoji-mart)

```bash
npm install emoji-mart @emoji-mart/data @emoji-mart/react --legacy-peer-deps
```

```typescript
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

const addEmoji = (emoji: { native: string }) => {
  editor.chain().focus().insertContent(emoji.native).run();
};

<Picker
  data={data}
  onEmojiSelect={addEmoji}
  theme="light"
  locale="ko"
/>
```

## 참고 자료

- [Tiptap 공식 문서](https://tiptap.dev/docs)
- [Tiptap React 설치](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Tiptap 확장 목록](https://tiptap.dev/docs/editor/extensions/overview)
- [v2 → v3 업그레이드 가이드](https://tiptap.dev/docs/guides/upgrade-tiptap-v2)
