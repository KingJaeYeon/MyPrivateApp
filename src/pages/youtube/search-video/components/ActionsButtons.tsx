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
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/store/modalStore.ts';

export function ActionsButtons() {
  const {
    setResult,
    setErrors,
    clearErrors,
    isChanged,
    clearResult,
    filter,
    result,
    getFilterPayload,
    saved,
  } = useVideoSearchStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();
  const {
    data: {
      folder: { name, location },
      youtube: { apiKey },
    },
  } = useSettingStore();
  const Log = useLogStore();

  const { mutate: mutateC, isPending: isPendingC } = useMutation({
    mutationKey: ['search-youtube-channel', filter], // (선택) 디버그 가독성
    mutationFn: async (d: ChannelPayload) => await getVideosByChannels({ ...d, apiKey }),
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
    mutationFn: async (d: KeywordPayload) => await getVideoByKeywords({ ...d, apiKey }),
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
    if (!apiKey) {
      openModal('alert', 'YouTube API 키를 먼저 저장해주세요.');
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
      openModal('alert', `검색 조건이 이전과 동일합니다.`);
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

  const onSaveExcel = async () => {
    if (isChanged) {
      if (confirm('현재 필터 설정을 기반으로 파일 이름이 저장됩니다.\n내용을 저장하시겠습니까?')) {
        try {
          await saved();
          const date = new Date('2023-12-03T09:00:00');
          const formatted = format(date, 'yyyy년 MM월 dd일 (EEE) a h:mm', { locale: ko });
          toast('엑셀파일 생성완료', {
            description: formatted,
            action: {
              label: 'Folder',
              onClick: () => window.electronAPI.openFolder(`${location}/${name.result}`),
            },
          });
        } catch (e) {}
      }
    } else {
      if (confirm('저장하시겠습니까?')) {
        try {
          await saved();
          const date = new Date('2023-12-03T09:00:00');
          const formatted = format(date, 'yyyy년 MM월 dd일 (EEE) a h:mm', { locale: ko });
          toast('엑셀파일 생성완료', {
            description: formatted,
            action: {
              label: 'Folder',
              onClick: () => window.electronAPI.openFolder(`${location}/${name.result}`),
            },
          });
        } catch (e) {}
      }
    }
  };

  const onGetExcel = () => {
    navigate('/');
  };

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
      <Button
        size="sm"
        onClick={onSaveExcel}
        disabled={result.data.length === 0}
        variant={isChanged && result.data.length !== 0 ? 'destructive' : 'default'}
      >
        엑셀로 저장
      </Button>
      <Button size="sm" onClick={onGetExcel}>
        작업 불러오기(엑셀)
      </Button>
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
