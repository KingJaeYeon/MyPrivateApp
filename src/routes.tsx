import { RouteObject } from 'react-router-dom';
import App from '@/App';
import { Home } from '@/pages/home/Home';
import SearchVideo from '@/pages/search-video/SearchVideo';
import SearchVideoResult from '@/pages/search-video-result/SearchVideoResult';
import TagPage from '@/pages/tag/TagPage';
import ChannelsPage from '@/pages/channels/ChannelsPage';
import ReferencePage from '@/pages/reference/ReferencePage.tsx';
import PromptsPage from '@/pages/prompts/PromptsPage.tsx';
import ChannelDetailPage from '@/pages/channel-detail/ChannelDetailPage.tsx';
import NotFound from '@/pages/NotFound.tsx';
import EnglishPage from '@/pages/english/EnglishPage.tsx';

export const navigationRoutes = [
  { path: '/', label: 'Home' },
  { path: '/tags', label: 'Tags' },
  { path: '/channels', label: 'Channels' },
  { path: '/search-videos', label: 'Search Videos' },
  { path: '/search-videos/result', label: 'Result' },
  { path: '/reference', label: 'Reference' },
  { path: '/prompts', label: 'Prompts' },
  { path: '/english', label: 'English' },
];

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'search-videos',
        element: <SearchVideo />,
      },
      {
        path: 'search-videos/result',
        element: <SearchVideoResult />,
      },
      {
        path: 'tags',
        element: <TagPage />,
      },
      {
        path: 'channels',
        element: <ChannelsPage />,
      },
      {
        path: 'channels/:channelId',
        element: <ChannelDetailPage />,
      },
      {
        path: 'reference',
        element: <ReferencePage />,
      },
      {
        path: 'prompts',
        element: <PromptsPage />,
      },
      {
        path: 'english',
        element: <EnglishPage />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
