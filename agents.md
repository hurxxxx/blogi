# Agents 가이드

AI 에이전트가 이 프로젝트에서 작업할 때 따라야 할 규칙과 절차입니다.

---

## 환경 인식

### 현재 환경: 운영 (Production)

| 항목 | 값 |
|------|-----|
| 환경 | **운영 (Production)** |
| 서버 | 103.167.151.104 |
| 경로 | /projects/danang-vip |
| 도메인 | https://gc.lumejs.com |
| 포트 | 3010 |
| PM2 앱 | danang-vip |

---

## 작업 규칙

### 운영 환경에서의 규칙

1. **코드 변경 시 반드시 빌드 테스트**
   ```bash
   npm run build
   ```

2. **빌드 성공 후에만 커밋/푸시**

3. **PM2 재시작 필수** (코드 변경 배포 시)
   ```bash
   pm2 delete danang-vip && pm2 start ecosystem.config.cjs && pm2 save
   ```

4. **환경변수(.env) 변경 시**
   - 재빌드 필수: `npm run build`
   - PM2 완전 재시작 필수

5. **DB 스키마 변경 시**
   ```bash
   npm run db:deploy
   ```

---

## 배포 체크리스트

### 일반 코드 변경

- [ ] `npm run build` 성공
- [ ] `git add -A && git commit && git push`
- [ ] `pm2 delete danang-vip && pm2 start ecosystem.config.cjs && pm2 save`
- [ ] `pm2 logs danang-vip` 에러 확인

### 환경변수 변경

- [ ] `.env` 수정
- [ ] `npm run build` (재빌드 필수!)
- [ ] `pm2 delete danang-vip && pm2 start ecosystem.config.cjs && pm2 save`
- [ ] 기능 테스트

### DB 스키마 변경

- [ ] `prisma/schema.prisma` 수정
- [ ] `npx prisma generate`
- [ ] `npm run db:deploy`
- [ ] `npm run build`
- [ ] PM2 재시작

---

## 자주 발생하는 에러

### 1. AuthJS UntrustedHost

```
[auth][error] UntrustedHost: Host must be trusted
```

**원인**: `AUTH_TRUST_HOST`와 `AUTH_URL` 환경변수 누락

**해결**:
```bash
# .env에 추가
AUTH_TRUST_HOST=true
AUTH_URL="https://gc.lumejs.com"

# 재빌드 & 재시작
npm run build
pm2 delete danang-vip && pm2 start ecosystem.config.cjs && pm2 save
```

### 2. Suspense boundary 에러

```
useSearchParams() should be wrapped in a suspense boundary
```

**해결**: 컴포넌트를 `<Suspense>`로 감싸기

```tsx
import { Suspense } from "react";

function MyComponent() {
  const searchParams = useSearchParams();
  // ...
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyComponent />
    </Suspense>
  );
}
```

### 3. 타입 에러

**빌드 전에 항상 타입 체크**:
```bash
npm run build
```

---

## 명령어 참조

### PM2

```bash
# 상태
pm2 list
pm2 show danang-vip

# 로그
pm2 logs danang-vip
pm2 logs danang-vip --lines 50 --nostream

# 재시작
pm2 restart danang-vip                    # 단순 재시작
pm2 delete danang-vip && pm2 start ecosystem.config.cjs  # 환경변수 새로 로드

# 저장
pm2 save
```

### Git

```bash
git status
git diff
git add -A
git commit -m "메시지"
git push
```

### Prisma

```bash
npx prisma generate      # 클라이언트 생성
npx prisma studio        # DB GUI (localhost:5555)
npm run db:migrate       # 개발 마이그레이션
npm run db:deploy        # 운영 마이그레이션
```

### 빌드 & 테스트

```bash
npm run build            # 프로덕션 빌드
npm run dev              # 개발 서버 (포트 3000)
```

---

## 환경별 차이

| 항목 | 개발 | 운영 |
|------|------|------|
| 서버 | localhost | 103.167.151.104 |
| 포트 | 3000 | 3010 |
| 명령어 | `npm run dev` | PM2 |
| DB 마이그레이션 | `npm run db:migrate` | `npm run db:deploy` |
| AUTH_TRUST_HOST | 불필요 | **필수** |
| AUTH_URL | 불필요 | **필수** |

---

## 중요 파일

| 파일 | 설명 |
|------|------|
| `.env` | 환경변수 (gitignore) |
| `ecosystem.config.cjs` | PM2 설정 |
| `prisma/schema.prisma` | DB 스키마 |
| `auth.ts` | NextAuth 설정 |
| `lib/prisma.ts` | Prisma 클라이언트 |
