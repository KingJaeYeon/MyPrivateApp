import { Navigate, RouteObject } from 'react-router-dom';
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
import { SettingsLayout } from '@/layouts/SettingsLayout.tsx';
import { YouTubeAPISettings } from '@/pages/settings/YouTubeAPISettings.tsx';
import { FilesSettings } from '@/pages/settings/FilesSettings.tsx';
import { ResultsSettings } from '@/pages/settings/ResultsSettings.tsx';
import { AdvancedSettings } from '@/pages/settings/AdvancedSettings.tsx';
import { NavMainType } from '@/components/nav-main.tsx';
import { Youtube } from '@/assets/svg';
import { BookOpen, Database, Languages, Settings2 } from 'lucide-react';

export const navigationRoutes: NavMainType = [
  {
    title: 'YouTube',
    url: '/youtube',
    icon: Youtube,
    isActive: true,
    items: [
      {
        title: 'Search Videos',
        url: '/youtube',
      },
      {
        title: 'Result',
        url: '/youtube/result',
      },
      {
        title: 'Saved Results...',
        url: '/youtube/saved-results',
      },
    ],
  },
  {
    title: 'Management',
    url: '/manage',
    icon: Database,
    items: [
      {
        title: 'Channels',
        url: '/manage/channels',
      },
      {
        title: ':channelId',
        url: '/manage/channel/:channelId',
        hidden: true,
      },
      {
        title: 'Edit Channels...',
        url: '/manage/channels-edit',
      },
      {
        title: 'Tags',
        url: '/manage/tags',
      },
    ],
  },
  {
    title: 'Library',
    url: '/prompts',
    icon: BookOpen,
    items: [
      {
        title: 'Prompts',
        url: '/lib/prompts',
      },
      {
        title: 'Reference',
        url: '/lib/reference',
      },
    ],
  },
  {
    title: 'English',
    url: '/english',
    icon: Languages,
    items: [
      {
        title: 'Patterns',
        url: '/english/patterns',
      },
      {
        title: 'Vocabulary',
        url: '/english/vocabulary',
      },
      {
        title: 'Conversations',
        url: '/english/conversations',
      },
      {
        title: 'Journal',
        url: '/english/journal',
      },
    ],
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings2,
    items: [
      {
        title: 'General',
        url: '/settings/advanced',
      },
      {
        title: 'YouTube API',
        url: '/settings/youtube',
      },
      {
        title: 'Files & Folders',
        url: '/settings/files',
      },
      {
        title: 'Saved',
        url: '/settings/saved-list',
      },
    ],
  },
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
        path: 'youtube',
        element: null,
        children: [
          { index: true, element: <Navigate to="/youtube/search-videos" replace /> },
          { path: 'search-videos', element: <SearchVideo /> },
          { path: 'result', element: <SearchVideoResult /> },
          { path: 'saved-results', element: <div>saved-results</div> },
          { path: 'edit', element: <div>edit</div> },
        ],
      },
      {
        path: 'manage',
        element: null,
        children: [
          { index: true, element: <Navigate to="/manage/channels" replace /> },
          { path: 'channels', element: <ChannelsPage /> },
          { path: 'channel/:channelId', element: <ChannelDetailPage /> },
          { path: 'tags', element: <TagPage /> },
          { path: 'channels-edit', element: <div>edit</div> },
        ],
      },
      {
        path: 'lib',
        element: null,
        children: [
          { index: true, element: <Navigate to="/lib/prompts" replace /> },
          { path: 'prompts', element: <ReferencePage /> },
          { path: 'reference', element: <PromptsPage /> },
        ],
      },
      {
        path: 'english',
        element: null,
        children: [
          { index: true, element: <Navigate to="/enghlish/patterns" replace /> },
          { path: 'patterns', element: <EnglishPage /> },
        ],
      },
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          { index: true, element: <Navigate to="/settings/youtube" replace /> },
          { path: 'youtube', element: <YouTubeAPISettings /> },
          { path: 'files', element: <FilesSettings /> },
          { path: 'saved-list', element: <ResultsSettings /> },
          { path: 'advanced', element: <AdvancedSettings /> },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
