# 🎯 JD 분석기

채용공고를 AI로 자동 분석하는 Next.js 애플리케이션입니다.

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
`.env.local` 파일을 생성하고 Gemini API 키를 추가하세요:
```
GEMINI_API_KEY=your_api_key_here
```

3. 개발 서버 실행:
```bash
npm run dev
```

4. 브라우저에서 `http://localhost:3000` 접속

## 사용 방법

1. 채용공고 텍스트를 텍스트 영역에 붙여넣기
2. "분석하기" 버튼 클릭
3. AI가 분석한 결과 확인

## 기술 스택

- Next.js
- React
- Google Gemini API
