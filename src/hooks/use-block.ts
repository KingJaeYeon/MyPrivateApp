import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import usePromptsStore from '@/store/usePromptsStore.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useModalStore } from '@/store/modalStore.ts';

export default function UseBlock() {
  const { isChanged: isChangedT } = useTagStore();
  const { isChanged: isChangedC } = useChannelStore();
  const { isChanged: isChangedR } = useReferenceStore();
  const { isChanged: isChangedP } = usePromptsStore();
  const { data } = useSettingStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  // 네비게이션 차단
  useBlocker(({ currentLocation, nextLocation }) => {
    const isChange = isChangedT || isChangedC || isChangedR || isChangedP;
    if (isChange && currentLocation.pathname !== nextLocation.pathname) {
      openModal('alert', '저장 후 이동해주세요');
      return true;
    }
    const allowPath = ['/settings/files', '/settings/youtube', '/'];

    if (allowPath.includes(nextLocation.pathname)) return false;

    if (!data.youtube.apiKey && currentLocation.pathname !== nextLocation.pathname) {
      openModal('alert', 'YouTube API키를 세팅해주세요.');
      navigate('/settings/youtube');
      return true;
    }

    if (!data.hasFile && currentLocation.pathname !== nextLocation.pathname) {
      openModal('alert', 'Excel 생성버튼을 클릭해주세요.');
      navigate('/settings/files');
      return true;
    }

    return false;
  });
}
