// src/pages/ActionsButtons.tsx
import { FilterSchema, useFilterStore } from '@/store/search-video.ts';
import { Button } from '@/components/ui/button.tsx';
import useSettingStore from '@/store/setting.ts';
import { useLogStore } from '@/store/search-video-log.ts';
import { useMutation } from '@tanstack/react-query';
import { getVideoByKeywords } from '@/service/youtube.keywords.ts';
import { zodParseSafe } from '@/lib/utils.ts';
import { getPopularVideos } from '@/service/youtube.popular.ts';

export function ActionsButtons() {
  const { data, setResult, clearResult, savedHistory, setErrors } = useFilterStore();
  const youtubeApiKey = useSettingStore(r=>r.data.youtube.apiKey);
  const Log = useLogStore();

  const { mutate, isPending } = useMutation({
    mutationKey: ['search-youtube', data], // (선택) 디버그 가독성
    mutationFn: async (d: any) => {
      if (d.mode === 'channels') {
        // 나중에 채널 API 연결
        return await getVideoByKeywords({ ...d, apiKey: youtubeApiKey });
      } else if (d.mode === 'popular') {
        return await getPopularVideos({ ...d, apiKey: youtubeApiKey });
      } else {
        return await getVideoByKeywords({ ...d, apiKey: youtubeApiKey });
      }
    },
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

    const result = zodParseSafe(FilterSchema, data);
    setErrors?.([]);

    if (!result.success) {
      setErrors?.(result.issues.map((e) => e.path[0]) as any);
      window.alert(result.data);
      return;
    }

    const d = result.data;
    Log.start();
    mutate(d);
  };

  const onStop = () => {
    // 실제 취소 토큰과 연결 예정이면 여기에서 처리
    Log.requestStop();
    Log.stopped();
  };

  const onClear = () => {
    clearResult();
  };

  return (
    <div className="flex gap-3">
      <Button size="sm" onClick={onStart} disabled={isPending}>
        {isPending ? '실행 중…' : '시작하기'}
      </Button>
      <Button size="sm" onClick={onStop} disabled={!isPending}>
        중단하기
      </Button>
      <Button size="sm" onClick={onClear}>
        결과 지우기
      </Button>
      <Button size="sm">엑셀로 저장</Button>
      <Button
        size="sm"
        onClick={() => {
          savedHistory();
          alert('현재 작업이 저장되었습니다. 작업 불러오기를 통해 다시 불러올 수 있습니다.');
        }}
      >
        현재 작업 저장
      </Button>
      <Button size="sm">작업 불러오기</Button>
    </div>
  );
}
