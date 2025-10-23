import { Outlet } from 'react-router-dom';
import Navigator from '@/components/Navigator';
import ModalRenderer from '@/components/ModalRenderer';
import useInitializeStores from '@/hooks/use-initialize-stores.tsx';
import TitleBar from '@/components/TitleBar.tsx';

export default function App() {
  useInitializeStores();

  return (
    <>
      <div className="flex min-h-svh w-full flex-col items-center justify-center">
        <TitleBar />
        <Navigator />
        <Outlet />
      </div>
      <ModalRenderer />
    </>
  );
}
