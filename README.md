# 🚀 TRIPLY - AI Travel Recommendation

AI 기반 맞춤형 여행 코스 추천 및 지도 시각화 서비스입니다.

## ✨ 새롭게 추가된 기능 (2026-05-12)

### 1. AI 챗봇 연동 및 동선 추천
- **AI 플레이리스터**: 챗봇과 대화하여 맞춤형 여행 코스를 추천받을 수 있습니다.
- **데이터 연동**: 챗봇이 추천한 장소 데이터를 **Zustand** 전역 스토어에 저장하여 페이지 이동 간 데이터를 유지합니다.
- **자동 이동**: 추천이 완료되면 '추천 동선 확인하기' 버튼을 통해 즉시 지도 페이지로 이동합니다.

### 2. 고도화된 지도 시각화 (카카오맵)
- **넘버링 마커**: 방문 순서가 적힌 커스텀 마커를 표시합니다.
- **폴리라인 (Polyline)**: 추천 경로를 선으로 연결하여 한눈에 동선을 파악할 수 있습니다.
- **자동 범위 조절 (Auto-Bounds)**: 모든 추천 장소가 한 화면에 보이도록 지도를 자동으로 조정합니다.
- **인터랙티브 호버**: 마커에 마우스를 올리면 장소 이름이 나타납니다.

---

## 🛠️ 로컬 개발 및 테스트 가이드

### 1. 환경 변수 설정 (`.env`)
카카오맵 SDK 사용을 위해 아래 키가 필요합니다.
```env
NEXT_PUBLIC_KAKAO_APP_KEY=45fb98ea25993d555ea0dd5fe334202f
NEXT_PUBLIC_API_URL=https://triply-backend.onrender.com
```

### 2. 로컬 테스트 서버 실행 (중요)
실제 백엔드 서버 없이 챗봇 및 로그인 기능을 테스트하려면 동봉된 `dummy_server.js`를 실행하세요.
1. `.env` 파일의 `NEXT_PUBLIC_API_URL`을 `http://127.0.0.1:5001`로 변경합니다.
2. 새 터미널에서 아래 명령어를 실행합니다.
   ```bash
   node dummy_server.js
   ```
3. 이제 로그인(아무 계정이나 가능) 및 챗봇 추천 기능을 즉시 테스트할 수 있습니다.

### 3. 프론트엔드 실행
```bash
npm install
npm run dev
```

---

## 📦 주요 기술 스택
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with Persist middleware)
- **Map SDK**: React Kakao Maps SDK
- **Icons**: Lucide React
- **Animations**: Framer Motion
