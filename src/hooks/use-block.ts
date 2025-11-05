import useTagStore from '@/store/useTagStore.ts';
import useChannelStore from '@/store/useChannelStore.ts';
import useReferenceStore from '@/store/useReferenceStore.ts';
import usePromptsStore from '@/store/usePromptsStore.ts';
import useSettingStore from '@/store/useSettingStore.ts';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useModalStore } from '@/store/modalStore.ts';
import useEnglishStore from '@/store/useEnglishStore.ts';

export default function UseBlock() {
  const { isChanged: isChangedT } = useTagStore();
  const { isChanged: isChangedC } = useChannelStore();
  const { isChanged: isChangedR } = useReferenceStore();
  const { isChanged: isChangedP } = usePromptsStore();
  const { isChanged: isChangedE } = useEnglishStore();
  const { data } = useSettingStore();
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  // 네비게이션 차단
  useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname) {
      return true;
    }

    const isChange = isChangedT || isChangedC || isChangedR || isChangedP;
    const isChange2 = isChangedE;

    const location = currentLocation.pathname;
    const next = nextLocation.pathname;

    const expectPath = ['/english/words', '/english/notes'];
    const isWithinSameSection = expectPath.some(
      (base) => location.startsWith(base) && next.startsWith(base)
    );

    // 2️⃣ 허용된 영역이 아닌 경우 제한
    if (isChange2 && !isWithinSameSection && location !== next) {
      openModal('alert', '저장 후 이동해주세요');
      return true; // 이동 중단
    }

    if (isChange && location !== next) {
      openModal('alert', '저장 후 이동해주세요');
      return true;
    }
    const allowPath = ['/settings/files', '/settings/youtube', '/'];

    if (allowPath.includes(next)) return false;

    if (!data.youtube.apiKey && location !== next) {
      openModal('alert', 'YouTube API키를 세팅해주세요.');
      navigate('/settings/youtube');
      return true;
    }

    if (!data.hasFile && location !== next) {
      openModal('alert', 'Excel 생성버튼을 클릭해주세요.');
      navigate('/settings/files');
      return true;
    }

    return false;
  });
}
