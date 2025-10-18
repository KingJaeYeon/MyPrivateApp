// src/pages/ActionsButtons.tsx
import { Button } from '@/components/ui/button.tsx';
import useSettingStore from '@/store/useSettingStore.ts';
import { useLogStore } from '@/store/useLogStore.ts';
import { useMutation } from '@tanstack/react-query';
import { getVideoByKeywords } from '@/service/youtube.video-keywords.ts';
import { getVideosByChannels } from '@/service/youtube.video-channels.ts';
import { zodParseSafe } from '@/lib/zod.ts';
import { FilterUI, useVideoSearchStore } from '@/store/useVideoSearchStore.ts';
import {
  ChannelFilterSchema,
  ChannelPayload,
  CommonFilterSchema,
  KeywordFilterSchema,
  KeywordPayload,
} from '@/schemas/filter.schema.ts';
import { toast } from 'sonner';

export function ActionsButtons() {
  const {
    setResult,
    setErrors,
    clearErrors,
    isChanged,
    clearResult,
    filter,
    getFilterPayload,
    result,
  } = useVideoSearchStore();
  const youtubeApiKey = useSettingStore((r) => r.data.youtube.apiKey);
  const Log = useLogStore();

  const { mutate: mutateC, isPending: isPendingC } = useMutation({
    mutationKey: ['search-youtube-channel', filter], // (선택) 디버그 가독성
    mutationFn: async (d: ChannelPayload) =>
      await getVideosByChannels({ ...d, apiKey: youtubeApiKey }),
    onSuccess: (data) => {
      setResult(data); // ✅ VideoRow[] 저장
      Log.completed();
    },
    onError: (error: any) => {
      Log.stopped();
      alert(error?.message || '요청 중 오류가 발생했습니다.');
    },
  });

  const { mutate: mutateK, isPending: isPendingK } = useMutation({
    mutationKey: ['search-youtube-keyword', filter], // (선택) 디버그 가독성
    mutationFn: async (d: KeywordPayload) =>
      await getVideoByKeywords({ ...d, apiKey: youtubeApiKey }),
    onSuccess: (data) => {
      setResult(data); // ✅ VideoRow[] 저장
      Log.completed();
    },
    onError: (error: any) => {
      Log.stopped();
      alert(error?.message || '요청 중 오류가 발생했습니다.');
    },
  });

  const onStart = () => {
    if (!youtubeApiKey) {
      window.alert('YouTube API 키를 먼저 저장해주세요.');
      return;
    }

    const payload = getFilterPayload();
    clearErrors();

    const commonValidation = validateCommon(payload);
    const modeValidation = validateByMode(payload.mode, payload);

    const allErrors = [...commonValidation.errors, ...modeValidation.errors];

    if (allErrors.length > 0) {
      setErrors(allErrors);
      const firstMessage = !commonValidation.isValid
        ? commonValidation.message
        : modeValidation.message;
      toast.error(firstMessage);
      return;
    }

    if (!isChanged) {
      alert('검색 조건이 이전과 동일합니다. 조건을 변경한 후 다시 시도해주세요.');
      return;
    }

    const validatedData = {
      ...commonValidation.data,
      ...modeValidation.data,
    };
    Log.start();

    if (validatedData.mode === 'channels') {
      mutateC(validatedData as ChannelPayload);
      return;
    }

    mutateK(validatedData as KeywordPayload);
    return;
  };

  const onStop = () => {
    // 실제 취소 토큰과 연결 예정이면 여기에서 처리
    Log.requestStop();
    Log.stopped();
  };

  const saveExcel = () => {};

  return (
    <div className="flex gap-3">
      <Button size="sm" onClick={onStart} disabled={isPendingC || isPendingK}>
        {isPendingC || isPendingK ? '실행 중…' : '시작하기'}
      </Button>
      <Button size="sm" onClick={onStop} disabled={!(isPendingC || isPendingK)}>
        중단하기
      </Button>
      <Button size="sm" onClick={clearResult}>
        결과 지우기
      </Button>
      <Button size="sm" disabled={result.data.length === 0} onClick={saveExcel}>
        엑셀로 저장
      </Button>
      <Button size="sm">작업 불러오기(엑셀)</Button>
    </div>
  );
}

const validateCommon = (payload: FilterUI) => {
  const result = zodParseSafe(CommonFilterSchema, payload);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.issues.map((e) => e.path[0] as string),
      message: result.data,
    };
  }
  return { isValid: true, data: result.data, errors: [] };
};

const validateByMode = (mode: 'channels' | 'keywords', payload: FilterUI) => {
  const schemas = {
    channels: ChannelFilterSchema,
    keywords: KeywordFilterSchema,
  };

  const schema = schemas[mode];
  if (!schema) return { isValid: true, data: {}, errors: [] };

  const result = zodParseSafe(schema, payload);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.issues.map((e) => e.path[0] as string),
      message: result.data,
    };
  }
  return { isValid: true, data: result.data, errors: [] };
};
