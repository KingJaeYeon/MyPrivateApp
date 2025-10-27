import { Outlet } from 'react-router-dom';
import ModalRenderer from '@/components/ModalRenderer';
import useInitializeStores from '@/hooks/use-initialize-stores.tsx';
import TitleBar from '@/components/titlebar/TitleBar.tsx';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import UseBlock from '@/hooks/use-block.ts';
import { BreadcrumbResponsive } from '@/components/BreadcrumbResponsive.tsx';

export default function App() {
  useInitializeStores();
  UseBlock();

  return (
    <>
      <div className="flex min-h-svh w-full flex-col items-center justify-center">
        <TitleBar />
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <BreadcrumbResponsive />
            <div className="scrollNone relative flex flex-1 flex-col gap-4 overflow-auto">
              <div className={'absolute h-full w-full p-4 pt-0'}>
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <ModalRenderer />
    </>
  );
}
