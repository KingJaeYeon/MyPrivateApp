import { useEffect } from 'react';
import useSettingStore, { ExcelFiles } from '@/store/useSettingStore.ts';
import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import usePromptsStore from '@/store/usePromptsStore.ts';
import useChannelHistoryStore from '@/store/useChannelHistoryStore.ts';
import useEnglishStore from '@/store/useEnglishStore.ts';

export default function useInitializeStores(type?: ExcelFiles) {
  const { location, name } = useSettingStore((s) => s.data.folder);
  const { updateIn } = useSettingStore();

  const { init: initTag, reset: resetTag } = useTagStore();
  const { init: initChannel, reset: resetChannel } = useChannelStore();
  const { init: initHistory, reset: resetHistory } = useChannelHistoryStore();
  const { init: initRef, reset: resetRef } = useReferenceStore();
  const { init: initPrompt, reset: resetPrompt } = usePromptsStore();
  const { init: initEnglish, reset: resetEnglish } = useEnglishStore();

  // ✅ 각 타입별 초기화 로직
  const initHandlers: Record<ExcelFiles, () => Promise<void>> = {
    tag: async () => await initTag(`${location}/${name.tag}`),
    channel: async () => await initChannel(`${location}/${name.channel}`),
    channelHistory: async () => await initHistory(`${location}/${name.channelHistory}`),
    reference: async () => await initRef(`${location}/${name.reference}`),
    prompt: async () => await initPrompt(`${location}/${name.prompt}`),
    result: async () => {
      await window.fsApi.listExcel(`${location}/${name.result.split('/')[0]}`);
    },
    engWords: async () => await initEnglish('engWords', `${location}/english/${name.engWords}`),
    engNotes: async () => await initEnglish('engNotes', `${location}/english/${name.engNotes}`),

    progress: async () => {
      // TODO
    },
  };

  // ✅ 리셋 핸들러
  const resetHandlers: Partial<Record<ExcelFiles, () => void>> = {
    tag: resetTag,
    channel: resetChannel,
    channelHistory: resetHistory,
    reference: resetRef,
    prompt: resetPrompt,
    engWords: () => resetEnglish('engWords'),
    engNotes: () => resetEnglish('engNotes'),
  };

  // ✅ 단일 초기화
  async function initOne(key: ExcelFiles) {
    try {
      await initHandlers[key]?.();
    } catch (error) {
      console.error(`Failed to init ${key}:`, error);
      resetHandlers[key]?.();
      throw error;
    }
  }

  // ✅ 전체 초기화
  async function initAll() {
    const keys: ExcelFiles[] = [
      'channel',
      'tag',
      'reference',
      'prompt',
      'result',
      'channelHistory',
      'engNotes',
      'engWords',
    ];

    for (const key of keys) {
      try {
        await initOne(key);
      } catch (error) {
        // 실패한 것만 reset
        resetHandlers[key]?.();
        throw error;
      }
    }
  }

  // ✅ 메인 시작 로직
  async function start() {
    if (!location) return;

    try {
      if (type) {
        // 특정 타입만 초기화
        await initOne(type);
      } else {
        // 전체 초기화
        await initAll();
        await updateIn('hasFile', true);
      }
    } catch (error) {
      await updateIn('hasFile', false);
    }
  }

  useEffect(() => {
    start();
  }, [location, name]);

  return {
    reload: start,
    initOne,
  };
}
