## 이프로젝트는 모바일이 최우선이다. 모든 UI UX 는 모바일 기준으로 모바일 최적화로 만들어줘

---

## 공통 컴포넌트

### Toast (스낵바)
- **경로**: `components/ui/toast.tsx`
- **용도**: 하단에서 슬라이드 업되는 알림 메시지
- **사용법**:
```tsx
import { useToast } from "@/components/ui/toast";

const MyComponent = () => {
    const { showToast } = useToast();

    // 성공 메시지
    showToast("성공했습니다!", "success");

    // 에러 메시지
    showToast("실패했습니다.", "error");

    // 정보 메시지
    showToast("알림 메시지", "info");
};
```
- **타입**: `"success"` | `"error"` | `"info"`
- **자동 닫힘**: 3초 후 자동으로 사라짐
- **위치**: 화면 하단 중앙

---

## 인증 관련

### 회원가입 승인 시스템
- 일반 사용자 회원가입 시 `isApproved: false`로 생성됨
- 관리자가 승인해야 로그인 가능
- 승인 대기 중 로그인 시도 시 토스트 메시지로 안내

---

## Lexical 에디터

### 컴포넌트 경로
- `components/editor/rich-text-editor.tsx`
- 읽기 전용 렌더: `components/editor/rich-text-viewer.tsx`

### 저장 형식
- 게시글/상품 내용은 **Lexical JSON 문자열**로 저장합니다.
- 필요 시 `contentMarkdown`에 Markdown 문자열을 함께 저장합니다.

### 이미지 업로드
- `/api/upload`로 업로드 후 반환된 URL을 `ImageNode`로 삽입합니다.
- Base64 사용 금지, 외부 스토리지/정적 서빙 URL 사용

---

## 문서화 규칙

### 설치/운영 메모
- 설치 관련 메모 사항은 `docs/install.md`에 작성합니다.


## Prisma Studio
 - http://localhost:5556/