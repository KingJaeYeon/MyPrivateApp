import { SystemProvider } from '@/providers/system-provider.tsx';
import { Routes, Route, Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle.tsx';
import Navigator from '@/components/Navigator.tsx';
import { Home } from '@/pages/home/Home.tsx';
import SearchVideo from '@/pages/search-video/SearchVideo.tsx';
import SearchVideoResult from '@/pages/search-video-result/SearchVideoResult.tsx';
import { useEffect, useState } from 'react';
import useSettingStore from '@/store/useSettingStore.ts';
import { ThemeProvider } from '@/providers/theme-provider.tsx';
import TagPage from '@/pages/tag/TagPage.tsx';
import useTagStore from '@/store/useTagStore.ts';
import ChannelsPage from '@/pages/channels/ChannelsPage.tsx';
import useChannelStore from '@/store/useChannelStore.ts';
import { useModalStore } from '@/store/modalStore.ts';

const routes = [
  { url: '/', element: <Home /> },
  { url: 'search-videos', element: <SearchVideo /> },
  { url: '/search-videos/result', element: <SearchVideoResult /> },
  { url: '/tags', element: <TagPage /> },
  { url: '/channels', element: <ChannelsPage /> },
];

function App() {
  const { init } = useSettingStore();
  const { location, name } = useSettingStore((r) => r.data.folder);
  const { init: tagInit } = useTagStore();
  const { init: channelInit } = useChannelStore();
  const [isLoading, setIsLoading] = useState(false);

  // 앱 시작 시 1) 저장된 키 자동 로드
  useEffect(() => {
    async function start() {
      try {
        await init();
        console.log('API Store initialized');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
        console.log('Initialization complete, loading state set to false', isLoading);
      }
    }

    start();
  }, []);

  useEffect(() => {
    async function start() {
      if (location) {
        try {
          await channelInit(`${location}/${name.channel}`);
          await tagInit(`${location}/${name.tag}`);
          console.log('API Store initialized');
        } catch (e) {
          console.error(e);
        } finally {
          console.log('Initialization complete, loading state set to false', isLoading);
        }
      }
    }
    start();
  }, [location]);

  if (isLoading) {
    // ✅ 로딩 중일 때 보여줄 화면
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex h-screen items-center justify-center">
          <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
          {/* 필요하면 "로딩 중..." 텍스트도 함께 */}
        </div>
      </ThemeProvider>
    );
  }
  return (
    <SystemProvider>
      <div className="flex min-h-svh w-full flex-col items-center justify-center">
        <div
          className={
            'drag bg-secondary flex h-[36px] w-full items-center justify-between pr-[12px] pl-[80px] text-lg'
          }
        >
          <div className={'flex items-center gap-6'}>
            <p className={'text-sm'}>YouTube Searcher</p>
          </div>
          <ThemeToggle />
        </div>
        <Navigator />
        <Outlet />
        <SomeComponent />
        <Routes>
          {routes.map((v) => {
            const { url, element } = v;
            return <Route key={url} path={url} element={element} />;
          })}
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </div>
    </SystemProvider>
  );
}

export default App;

function SomeComponent() {
  const { openModal } = useModalStore();

  return (
    <div className="space-y-4">
      {/* 로그인 모달 */}
      <button onClick={() => openModal('login')}>로그인</button>

      {/* 회원가입 모달 */}
      <button onClick={() => openModal('signup')}>회원가입</button>

      {/* 확인 모달 */}
      <button
        onClick={() =>
          openModal('confirm', {
            title: '삭제 확인',
            message: '정말 삭제하시겠습니까?',
            cancelText: '취소',
            confirmText: '삭제',
            onConfirm: () => {
              console.log('삭제됨');
              // 삭제 API 호출
            },
          })
        }
      >
        삭제
      </button>

      {/* 알림 모달 */}
      <button
        onClick={() =>
          openModal('alert', {
            title: '알림',
            message: '저장되었습니다.',
            buttonText: '확인',
          })
        }
      >
        알림
      </button>
    </div>
  );
}
