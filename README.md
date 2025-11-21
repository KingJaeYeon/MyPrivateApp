## my-app-v2 (데스크톱 앱)
my-app-v2는 Electron 기반의 데스크톱 애플리케이션으로, React + TypeScript를 사용하여 제작된 현대적인 UI와 Excel(.xlsx) 파일을 데이터 소스로 활용하는 콘텐츠/학습 관리 도구입니다. 메인 프로세스는 안전한 파일 입출력을 담당하고, 렌더러는 shadcn/ui · Radix UI 컴포넌트와 Zustand 스토어로 사용자 경험을 제공합니다.


### 목적
- 로컬 환경에서 안전하게 데이터를 관리하고 즉시 검색/편집/저장을 수행
- UI/UX는 빠른 필터링, 멀티 셀렉션, 모달 기반 상호작용을 중점으로 설계
- 데이터는 사람이 직접 편집 가능한 Excel 파일 형태로 유지하여 가시성과 휴대성을 확보

### 주요 기능
- Excel(.xlsx) 파일 읽기/쓰기/덮어쓰기 지원 (원자적 저장 및 백업 고려)
- 설정에서 각 도메인의 파일명/경로를 사용자가 직접 지정
- 공통 DataTable: 필터링, 정렬, 행 선택, 다중 선택, 툴바 액션 등
- 중앙 집중형 모달 시스템: 다양한 유형의 모달을 한 곳에서 렌더링/관리
- 태그 선택기(TagChooser) 모달: 모달이 닫히지 않는 멀티 선택 UX 지원

### 기술 스택
- Electron (Main/Renderer, IPC는 `contextBridge` 기반)
- React 18 + TypeScript
- Zustand (상태 관리)
- shadcn/ui + Radix UI (UI 컴포넌트)
- xlsx (Excel I/O)
- Vite (번들링) / Electron Builder (배포)

---

## 디렉터리 구조 (요약)

```
electron/
  docs.schema.ts        # Excel 스키마/유틸(행렬 변환 등)
src/
  components/           # 공용 UI 컴포넌트
  components/modals/    # 모달 컴포넌트와 렌더러
  hooks/                # 애플리케이션 훅(스토어 초기화 등)
  pages/                # 페이지 (설정/관리/기타)
  store/                # Zustand 스토어 모음
  routes.tsx            # 라우팅/사이드 내비게이션 정의
```

---

## 데이터 및 스키마

Excel 열 정의 및 스키마는 `electron/docs.schema.ts`에서 일관되게 관리됩니다. 렌더러에서는 `DBSchema` 타입을 통해 안전하게 접근합니다.

```ts
import type { DBSchema } from '../../electron/docs.schema.ts';

type AnyRow = DBSchema[keyof DBSchema];
```

Excel 저장 시에는 객체 배열을 AoA(array-of-arrays)로 변환하는 유틸을 사용하여 시트에 기록합니다.

---

## 상태 관리

- `useSettingStore`: 폴더 경로/파일명 등 전역 설정
- `useModalStore`: 모달의 열림/닫힘과 페이로드 관리
- (도메인 스토어): 각 페이지 별 데이터, 편집 패널 상태, 변경 플래그 등 관리

스토어 초기화는 다음 훅에서 한 번에 처리됩니다.

```ts
// src/hooks/use-initialize-stores.tsx
// app 시작 시 설정에 지정된 파일 경로를 읽어 스토어를 하이드레이션
```

저장 흐름은 다음과 같습니다.

```ts
// (예시) buildAoaFromObjects(data, sheetKey) → overwrite(path, aoa, 'Sheet1')
```

---

## 모달 시스템

- `ModalRenderer`가 `ModalType`에 따라 모달을 렌더링합니다.
- 모달 열림은 중앙 스토어에서 제어하며, 모달 간 데이터 전달을 표준화합니다.
- `TagChooserModal`은 선택 토글만으로 멀티 선택을 지원하고, 부모에는 문자열로 동기화합니다.

---

## 설정(파일 & 폴더)

- 각 데이터 파일명을 유저가 직접 지정할 수 있습니다.
- 초기 파일 생성 기능 제공: 없는 경우 헤더가 포함된 기본 파일을 생성합니다.
- 생성/검증/경로 계산은 일관된 유틸과 상수(시트 키)를 사용합니다.

---

## 실행 방법

### 사전 준비
- Node.js LTS 18+ (또는 20+)
- 패키지 매니저: yarn 권장 

### 설치
```bash
yarn install
# or
npm install
```

### 개발 모드 실행
```bash
yarn dev
# 렌더러 + Electron 동시 실행
```

### 프로덕션 빌드/패키징
```bash
yarn build
```

---

## 문제 해결 가이드(요약)

- Radix Select: `SelectItem`에는 빈 문자열 value를 사용하지 마세요. 플레이스홀더는 `SelectTrigger`에서 처리하고, 선택 해제는 `undefined`를 사용하세요.
- TagChooser 모달: 태그 클릭 시 `stopPropagation()`으로 모달이 닫히지 않도록 처리합니다.
- Excel 파일 로드 실패: 설정 페이지에서 폴더/파일명을 확인하고, 파일 생성 기능으로 초기 파일을 만든 뒤 재시작하세요.

---

## 개발 가이드

- 타입 안전 우선: `DBSchema` 기반 타입 활용, 명시적 props/리턴 타입
- 컴포넌트는 표현에 집중하고, 비즈니스 로직은 스토어/훅에 배치
- 긴 함수보다는 작은 유닛으로 분리, 의미 있는 이름 사용

