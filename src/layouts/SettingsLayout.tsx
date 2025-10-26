// src/pages/settings/SettingsLayout.tsx
import { Outlet } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { useNavigate, useLocation } from 'react-router-dom';

export function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={'relative'}>
      <div className="flex h-full flex-col overflow-auto">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-muted-foreground mt-1 text-sm">YouTube API 및 파일 관리 설정</p>
        </div>

        <Tabs value={location.pathname} className="flex-1">
          <div className="border-b px-6">
            <TabsList className="h-12">
              <TabsTrigger value="/settings/youtube" onClick={() => navigate('/settings/youtube')}>
                YouTube API
              </TabsTrigger>
              <TabsTrigger value="/settings/files" onClick={() => navigate('/settings/files')}>
                파일 & 폴더
              </TabsTrigger>
              <TabsTrigger
                value="/settings/saved-list"
                onClick={() => navigate('/settings/saved-list')}
              >
                저장된 결과
              </TabsTrigger>
              <TabsTrigger
                value="/settings/advanced"
                onClick={() => navigate('/settings/advanced')}
              >
                고급
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </div>
  );
}
