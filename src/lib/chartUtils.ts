import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

export type ScaleResult = {
  min: number;
  max: number;
  ticks: number[];
  tickCount: number;
};
/**
 * 차트 Y축 자동 스케일링
 * @param dataMin 데이터 최솟값
 * @param dataMax 데이터 최댓값
 * @param desiredTicks 원하는 눈금 개수 (기본 5개)
 * @param padding 여백 비율 (기본 0.1 = 10%)
 */
export function calculateYAxisScale(
  dataMin: number,
  dataMax: number,
  desiredTicks: number = 5,
  padding: number = 0.1
): ScaleResult {
  // 1. 데이터 범위
  const range = dataMax - dataMin;

  // 예외 처리: 범위가 0이면
  if (range === 0) {
    return {
      min: dataMin - 1,
      max: dataMax + 1,
      ticks: [dataMin - 1, dataMin, dataMax + 1],
      tickCount: 3,
    };
  }

  // 2. 여백을 포함한 범위 계산
  const paddedRange = range * (1 + padding * 2);

  // 3. 대략적인 간격 계산
  const roughInterval = paddedRange / (desiredTicks - 1);

  // 4. "깔끔한" 간격으로 변환
  const niceInterval = getNiceNumber(roughInterval, false);

  // 5. ✅ min/max를 간격에 맞춰 반올림 (여유 공간 확보)
  const niceMin = Math.floor((dataMin - range * padding) / niceInterval) * niceInterval;
  const niceMax = Math.ceil((dataMax + range * padding) / niceInterval) * niceInterval;

  // 6. 눈금 생성
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceInterval) {
    // 부동소수점 오차 방지
    ticks.push(Math.round(tick * 1e10) / 1e10);
  }

  return {
    min: niceMin,
    max: niceMax,
    ticks,
    tickCount: ticks.length,
  };
}

export function calculateSmartScale(
  dataMin: number,
  dataMax: number,
  options?: {
    desiredTicks?: number;
    padding?: number; // 0~1 (5% = 0.05)
    forceZero?: boolean; // 0을 포함할지
    excludeNegative?: boolean; // 🆕 0 미만 tick 제외 여부
  }
): ScaleResult {
  const {
    desiredTicks = 5,
    padding = 0.1,
    forceZero = false,
    excludeNegative = false,
  } = options || {};

  const range = dataMax - dataMin;
  const paddingValue = range * padding;

  let adjustedMin = dataMin - paddingValue;
  let adjustedMax = dataMax + paddingValue;

  if (forceZero && adjustedMin > 0) {
    adjustedMin = 0;
  }
  // 🆕 0 미만 제외 옵션
  if (excludeNegative && adjustedMin < 0) {
    adjustedMin = 0;
  }

  const scale = calculateYAxisScale(adjustedMin, adjustedMax, desiredTicks);

  if (excludeNegative) {
    scale.ticks = scale.ticks.filter((tick) => tick >= 0);
    scale.min = Math.max(0, scale.min);
  }
  return scale;
}

/**
 * "깔끔한" 숫자로 변환 (1, 2, 5의 배수)
 */
function getNiceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * Math.pow(10, exponent);
}

/**
 * 배열에서 min/max 추출
 */
export function getDataMinMax(data: number[]): { min: number; max: number } {
  if (data.length === 0) return { min: 0, max: 0 };

  return {
    min: Math.min(...data),
    max: Math.max(...data),
  };
}

/**
 * X축 Tick 계산 (양 끝 제외)
 * @param dataLength 데이터 개수
 * @param maxTicks 최대 tick 개수 (기본 7개)
 */
export function calculateXAxisTicks(dataLength: number, maxTicks: number = 7): number[] {
  if (dataLength <= maxTicks) {
    // 데이터가 적으면 모두 표시 (양 끝 제외)
    return Array.from({ length: dataLength }, (_, i) => i).slice(1, -1);
  }

  // Step 계산
  const step = Math.ceil(dataLength / (maxTicks - 1));
  const ticks: number[] = [];

  for (let i = step; i < dataLength - 1; i += step) {
    ticks.push(i);
  }

  return ticks;
}

/**
 * 날짜 포맷 (간격에 따라 자동 조절)
 */
export function getOptimalDateFormat(dates: Date[]): {
  format: string;
  interval: number;
} {
  if (dates.length === 0) {
    return { format: 'MM/dd', interval: 1 };
  }

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const daysDiff = differenceInDays(lastDate, firstDate);
  const monthsDiff = differenceInMonths(lastDate, firstDate);
  const yearsDiff = differenceInYears(lastDate, firstDate);

  // 년도가 다르면
  if (yearsDiff > 0) {
    if (yearsDiff >= 3) {
      return { format: 'yyyy', interval: 365 }; // 년도만
    }
    return { format: 'yyyy.MM', interval: 30 }; // 년.월
  }

  // 월이 다르면
  if (monthsDiff > 0) {
    if (monthsDiff >= 6) {
      return { format: 'MM월', interval: 30 }; // 월만
    }
    return { format: 'MM/dd', interval: 7 }; // 월/일
  }

  // 같은 달 안에서
  if (daysDiff > 14) {
    return { format: 'MM/dd', interval: 3 }; // 월/일 (3일 간격)
  } else if (daysDiff > 7) {
    return { format: 'M/d', interval: 2 }; // 짧은 형식
  } else {
    return { format: 'd일', interval: 1 }; // 일만
  }
}

/**
 * 변화율 기반 Y축 포맷 전략 결정
 */
export function getYAxisFormatStrategy(
  dataMin: number,
  dataMax: number,
  dataType?: 'videoCount' | 'subscriberCount' | 'viewCount'
): {
  useCompact: boolean;
  changeRate: number;
  threshold: number;
} {
  const thresholds = {
    videoCount: 5,
    subscriberCount: 3,
    viewCount: 999, // 사실상 항상 포맷
    default: 5,
  };

  // 🆕 절대값 기준 추가
  const absoluteThreshold = 10000; // 10,000 이상이면 무조건 k/M/B

  const threshold = dataType ? thresholds[dataType] : thresholds.default;
  const range = dataMax - dataMin;
  const changeRate = dataMin !== 0 ? (range / dataMin) * 100 : 100;

  // 🆕 절대값이 크면 무조건 포맷
  if (dataMax >= absoluteThreshold) {
    return {
      useCompact: true,
      changeRate,
      threshold,
    };
  }

  return {
    useCompact: changeRate >= threshold,
    changeRate,
    threshold,
  };
}

/**
 * 포맷된 라벨 중복 체크 및 소수점 자동 증가
 */
export function formatWithDuplicateCheck(
  values: number[],
  formatFn: (num: number, decimals?: number) => string
): string[] {
  let decimals = 1;
  let formatted: string[] = [];
  let maxTries = 3;

  while (maxTries > 0) {
    formatted = values.map((v) => formatFn(v, decimals));
    const uniqueCount = new Set(formatted).size;

    // 중복 없으면 성공
    if (uniqueCount === formatted.length) {
      break;
    }

    decimals++;
    maxTries--;
  }

  // 여전히 중복이면 원본 숫자로 표시
  if (new Set(formatted).size !== formatted.length) {
    return values.map((v) => v.toLocaleString());
  }

  return formatted;
}
