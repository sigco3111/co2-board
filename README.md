
# 국가간 CO₂ 배출량 비교 분석 (CO₂ Emission Comparison)

이 프로젝트는 두 국가의 전력 소비(Scope 2)로 인한 CO₂ 배출량을 비교 분석하기 위한 대화형 웹 애플리케이션입니다. 사용자는 **위치 기반(Location-based)** 및 **시장 기반(Market-based)** 회계 방식을 통해 배출량을 시각적으로 확인하고, Google Gemini API를 통해 생성된 관련 데이터와 설명을 탐색할 수 있습니다.

실행주소1 : https://sigco3111.github.io/co2-board/

실행주소2 : https://dev-canvas-pi.vercel.app/


## ✨ 주요 기능

*   **국가별 비교**: 두 개의 다른 국가를 선택하여 배출량 데이터를 나란히 비교합니다.
*   **이중 회계 방식**: 위치 기반 및 시장 기반 배출량을 동시에 계산하고 시각화합니다.
*   **대화형 차트**: Recharts를 사용하여 양국 간의 배출량 차이를 명확하게 보여주는 막대 차트를 제공합니다.
*   **AI 기반 데이터 생성**:
    *   특정 국가의 중소기업 평균 전력 소비량을 동적으로 추정합니다.
    *   최신 전력망 구성(Power Grid Mix) 데이터를 생성하여 파이 차트로 시각화합니다.
    *   각 회계 방식에 대한 간단하고 명확한 설명을 AI가 생성해 제공합니다.
*   **API 키 관리**: 사용자가 자신의 Gemini API 키를 직접 입력하고 브라우저의 로컬 저장소에 안전하게 저장하여 사용할 수 있습니다.
*   **반응형 디자인**: 데스크톱, 태블릿, 모바일 등 다양한 화면 크기에서 최적의 사용자 경험을 제공합니다.

---

## 🛠️ 사용 기술

*   **프론트엔드**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
*   **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
*   **차트**: [Recharts](https://recharts.org/)
*   **AI 모델**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
*   **모듈 로딩**: ES Modules (ESM) over CDN (`esm.sh`)

---

## 🚀 시작하기

이 애플리케이션은 별도의 빌드 과정 없이 정적 웹 서버를 통해 바로 실행할 수 있습니다.

### 사전 요구사항

*   웹 브라우저
*   로컬 웹 서버 (예: `serve` 패키지 또는 Python 내장 서버)
*   [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급받은 Gemini API 키

### API 키 설정

이 애플리케이션은 Gemini API를 사용하여 동적 데이터를 생성합니다. API 키는 다음 두 가지 방법 중 하나로 설정할 수 있습니다.

**방법 1: 앱 내에서 직접 입력 (권장)**

1.  애플리케이션을 실행하면 상단에 'Gemini API 키 관리' 섹션이 나타납니다.
2.  입력 필드에 자신의 Gemini API 키를 붙여넣습니다.
3.  '키 저장' 버튼을 클릭합니다.
    *   키는 브라우저의 로컬 저장소(`localStorage`)에만 저장되므로 안전하며, 페이지를 새로고침해도 유지됩니다.

**방법 2: 환경 변수 사용 (개발자용)**

만약 이 프로젝트를 로컬에서 개발 환경으로 구성할 경우, `process.env.API_KEY`를 통해 API 키를 제공할 수 있습니다. (현재 설정은 정적 호스팅 기준이므로 이 방식은 직접적인 적용이 어렵습니다.)

> **참고**: 앱은 먼저 `process.env.API_KEY`를 확인하고, 값이 없는 경우에만 로컬 저장소에 저장된 키를 사용합니다.

### 설치 및 실행

1.  이 저장소를 클론합니다.
    ```bash
    git clone https://github.com/your-username/co2-emission-comparison.git
    cd co2-emission-comparison
    ```

2.  로컬 웹 서버를 실행합니다. `serve` 패키지를 사용하는 것을 권장합니다.
    
    만약 `serve`가 설치되어 있지 않다면, 다음 명령어로 설치할 수 있습니다.
    ```bash
    npm install -g serve
    ```
    
    프로젝트 디렉토리에서 다음 명령어를 실행합니다.
    ```bash
    serve -s .
    ```

3.  브라우저를 열고 터미널에 표시된 주소(보통 `http://localhost:3000`)로 이동합니다.

---

## 📁 프로젝트 구조

```
/
├── components/           # 재사용 가능한 리액트 컴포넌트
│   ├── icons/            # SVG 아이콘 컴포넌트
│   ├── ApiKeyManager.tsx   # API 키 입력 및 관리 UI
│   ├── MethodCard.tsx      # 회계 방식별 정보 카드
│   └── PowerGridMixChart.tsx # 전력망 구성 파이 차트
├── services/             # 외부 서비스 연동 로직
│   └── geminiService.ts    # Gemini API 호출 관련 함수
├── App.tsx               # 메인 애플리케이션 로직 및 레이아웃
├── constants.ts          # 배출 계수 등 앱 전체에서 사용하는 상수
├── index.html            # 앱의 진입점 (HTML 뼈대)
├── index.tsx             # React 앱을 DOM에 마운트
├── metadata.json         # 앱 메타데이터
├── README.md             # 프로젝트 설명서 (현재 파일)
└── types.ts              # TypeScript 타입 정의
```

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 `LICENSE` 파일을 참고하세요.
