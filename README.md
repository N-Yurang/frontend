# TRIPLY (트리플리) - Frontend Repository

AI 기반 맞춤형 여행 코스 추천 서비스 'TRIPLY'의 프론트엔드 레포지토리입니다.

## 프로젝트 소개
TRIPLY는 사용자의 취향에 맞는 여행 코스를 AI가 추천해주고, 이를 지도에 시각화해서 보여주는 서비스입니다. 
이 레포지토리는 사용자가 챗봇과 대화하며 일정을 짜고, 카카오맵에서 추천 동선을 확인할 수 있는 프론트엔드 코드를 담고 있습니다.

## 주요 기능
- AI 챗봇을 통한 맞춤형 여행 코스 추천
- 카카오맵 API를 활용한 여행 동선 시각화 (방문 순서 마커, 폴리라인 표시)
- 홈, 검색, 트렌딩, 장소/축제 상세, 마이페이지 등 UI 구현

## 기술 스택
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Zustand
- React Kakao Maps SDK

## 로컬 실행 방법

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
프로젝트 최상위 폴더에 `.env` 파일을 만들고 아래 키를 추가해주세요.
```env
NEXT_PUBLIC_KAKAO_APP_KEY=발급받은_카카오맵_키
NEXT_PUBLIC_API_URL=https://triply-backend.onrender.com
```

### 3. 더미 서버 실행 (선택)
실제 백엔드 없이 챗봇이나 로그인 기능을 테스트해보고 싶다면 포함된 더미 서버를 켜주세요.
`.env` 파일의 `NEXT_PUBLIC_API_URL`을 `http://127.0.0.1:5001`로 변경한 뒤 터미널에서 아래 명령어를 입력합니다.
```bash
node dummy_server.js
```

### 4. 프론트엔드 실행
```bash
npm run dev
```
실행 후 브라우저에서 `http://localhost:3000`으로 접속하시면 됩니다.

## 폴더 구조
- `src/app/`: Next.js 라우팅 페이지 (home, map, chat, login 등)
- `src/components/`: 공용 UI 컴포넌트
- `src/store/`: Zustand 상태 관리
- `src/lib/` & `src/utils/`: 유틸리티 함수 및 설정 파일
