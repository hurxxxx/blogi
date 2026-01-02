# 프로젝트 설치 및 운영 셋업

이 문서는 현재 프로젝트의 개발/운영 셋업에 필요한 최소 정보를 정리합니다.

## 1) 공통 환경 변수

필수 환경 변수는 다음과 같습니다.

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `AUTH_SECRET`: NextAuth 시크릿 키
- `UPLOADS_DIR`: 업로드 파일 저장 경로
- `UPLOADS_URL`: 업로드 파일 접근 URL 프리픽스
- `SITE_URL`: 사이트 기본 URL (sitemap/RSS/OG용)

## 2) 개발 환경 (로컬)

### PostgreSQL 준비

로컬 PostgreSQL에서 아래 계정/DB를 사용합니다.

- 사용자: `danang_vip_user`
- 데이터베이스: `danang_vip`
- 포트: `5432`

예시 SQL:

```sql
CREATE ROLE danang_vip_user LOGIN PASSWORD '<PASSWORD>';
CREATE DATABASE danang_vip OWNER danang_vip_user;
```

### 기본 동작

개발 환경에서는 기본적으로 `public/uploads`에 파일이 저장됩니다.
`UPLOADS_DIR`와 `UPLOADS_URL`을 설정하지 않으면 아래 값이 사용됩니다.

- `UPLOADS_DIR=./public/uploads`
- `UPLOADS_URL=/uploads`

### 개발 서버 실행

```bash
npm install
npm run db:migrate
npm run dev
```

## 3) 운영 환경 (gc.lumejs.com)

### 배포 방식

- **실행 방식**: `next start` (PM2로 관리)
- **파일 서빙**: Next.js가 직접 처리 (`app/uploads/[[...path]]/route.ts`)
- **Nginx 역할**: SSL 종료, 리버스 프록시만 담당

### 현재 운영 설정

| 항목 | 값 |
|------|-----|
| 업로드 저장 경로 | `/data/danang-vip/uploads` (NFS 마운트) |
| 업로드 URL | `/uploads` |
| PM2 앱 이름 | `danang-vip` |
| 포트 | 3010 |

### 운영 환경 변수 (.env)

```env
DATABASE_URL="postgresql://danang_vip_user:<PASSWORD>@localhost:5432/danang_vip?schema=public"
AUTH_SECRET="<운영용 시크릿 키>"
AUTH_TRUST_HOST=true
AUTH_URL="https://gc.lumejs.com"

# Uploads
UPLOADS_DIR=/data/danang-vip/uploads
UPLOADS_URL=/uploads

# Pexels
PEXELS_API_KEY="<API 키>"
IMAGE_REMOTE_HOST="gc.lumejs.com"
```

### Nginx 설정 (SSL/프록시 전용)

파일: `/etc/nginx/sites-available/gc.lumejs.com`

```nginx
server {
    server_name gc.lumejs.com;
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 디렉토리 권한

앱 서버(PM2)가 `/data/danang-vip/uploads` 경로에 쓰기 권한을 가져야 합니다.

```bash
chmod -R 755 /data/danang-vip/uploads
```

## 4) 업로드 동작 확인

- 이미지 업로드 후 반환된 URL(`/uploads/...`)이 정상 접근되는지 확인
- 서버 재시작 후에도 파일이 유지되는지 확인

## 4-1) 업로드 파일 클라이언트 동기화

클라이언트에서 서버 업로드 파일을 내려받아 동기화할 때는 아래 스크립트를 사용합니다.

- 스크립트: `scripts/sync-uploads.sh`
- 운영 서버 경로: `/data/danang-vip/uploads`
- 로컬 경로: `./uploads`

사용 방법:

```bash
./scripts/sync-uploads.sh --pull   # 서버에서 로컬로 다운로드
./scripts/sync-uploads.sh --push   # 로컬에서 서버로 업로드
```

`sshpass`가 설치되어 있으면 스크립트에 비밀번호를 입력한 뒤 비대화식으로 동기화할 수 있습니다.

### 업로드 경로 규칙

업로드 파일은 스코프와 날짜로 분류됩니다.

```
/uploads/{scope}/YYYY/MM/DD/{filename}
```

예:
```
/uploads/contents/2025/12/22/1700000000-abc123.jpg
/uploads/posts/2025/12/22/1700000000-xyz789.webp
```

## 5) 운영 체크리스트

- [ ] `/data/danang-vip/uploads` 디렉토리 생성 및 권한 확인 (`chmod 755`)
- [ ] `.env`에 `UPLOADS_DIR=/data/danang-vip/uploads` 설정
- [ ] Nginx `client_max_body_size 10M` 설정
- [ ] `nginx -t && systemctl reload nginx`
- [ ] `npm run build`
- [ ] `pm2 delete danang-vip && pm2 start ecosystem.config.cjs && pm2 save`
- [ ] 파일 업로드 테스트
- [ ] 업로드 후 `/data/danang-vip/uploads/`에 파일 저장 확인

## 6) Next.js 이미지 최적화 설정

운영 환경에서 `/_next/image` 엔드포인트가 `/uploads/` 이미지를 최적화할 수 있도록
`next.config.ts`에 `remotePatterns`를 설정해야 합니다.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-domain.com",  // 실제 도메인으로 변경
        pathname: "/uploads/**",
      },
    ],
  },
};
```

설정 변경 후 반드시 `npm run build`로 재빌드해야 적용됩니다.

## 7) 파일 서빙 구조

Next.js가 모든 `/uploads/...` 요청을 직접 처리합니다.

- `app/uploads/[[...path]]/route.ts` - 파일 서빙 담당
- `UPLOADS_DIR` 환경변수 경로에서 파일을 읽어서 응답
- Nginx 없이도 완전히 독립적으로 동작

### Nginx 역할

| 역할 | 설명 |
|------|------|
| SSL 종료 | HTTPS 인증서 처리 |
| 리버스 프록시 | localhost:3010으로 요청 전달 |
| 업로드 크기 제한 | `client_max_body_size 10M` |

**파일 서빙은 Next.js가 담당하므로 Nginx alias 설정 불필요**

## 8) 참고

- 개발/운영 모두 동일한 `UPLOADS_URL`(`/uploads`)을 사용
- 모든 요청은 Next.js가 처리 (Nginx 의존성 없음)
- 배포 방식: `next start` (standalone 모드 사용 안함)
