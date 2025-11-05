import { Navigate, RouteObject } from 'react-router-dom';
import App from '@/App';
import SearchVideo from '@/pages/youtube/search-video/SearchVideo';
import SearchVideoResult from '@/pages/youtube/search-video-result/SearchVideoResult';
import TagPage from '@/pages/management/tag/TagPage';
import ChannelsPage from '@/pages/management/channels/ChannelsPage';
import ReferencePage from '@/pages/lib/reference/ReferencePage.tsx';
import PromptsPage from '@/pages/lib/prompts/PromptsPage.tsx';
import ChannelDetailPage from '@/pages/management/channel-detail/ChannelDetailPage.tsx';
import NotFound from '@/pages/NotFound.tsx';
import NotesPage from '@/pages/english/NotesPage.tsx';
import { YouTubeAPISettings } from '@/pages/settings/youtube-api/YouTubeAPISettings.tsx';
import { FilesSettings } from '@/pages/settings/LocationFile/FilesSettings.tsx';
import { AdvancedSettings } from '@/pages/settings/AdvancedSettings.tsx';
import { NavMainType } from '@/components/nav-main.tsx';
import { Youtube } from '@/assets/svg';
import { BookOpen, Database, Languages, Settings2 } from 'lucide-react';
import SavedListPage from '@/pages/youtube/saved-list/SavedListPage.tsx';
import ChannelsEditPage from '@/pages/management/channel-edit/ChannelsEditPage.tsx';
import { Home } from '@/pages/home/Home.tsx';
import WordsLayout from '@/pages/english/words/WordsLayout.tsx';
import CreatePage from '@/pages/english/words/CreatePage.tsx';
import DetailPage from '@/pages/english/words/DetailPage.tsx';

export const navigationRoutes: NavMainType = [
  {
    title: 'YouTube',
    url: '/youtube',
    icon: Youtube,
    isActive: true,
    items: [
      {
        title: 'Search Videos',
        url: '/youtube/search',
      },
      {
        title: 'Result',
        url: '/youtube/search/result',
      },
      {
        title: 'Saved List',
        url: '/youtube/saved-list',
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
        url: '/manage/channels/:channelId',
        hidden: true,
      },
      {
        title: 'Edit',
        url: '/manage/channels/edit',
        suffix: 'Channels',
      },
      {
        title: 'Tags',
        url: '/manage/tags',
      },
    ],
  },
  {
    title: 'Library',
    url: '/lib',
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
        title: 'Words',
        url: '/english/words',
      },
      {
        title: 'Notes',
        url: '/english/notes',
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
    ],
  },
];

// const items = [
//   { href: '#', label: 'Home' },
//   { href: '#', label: 'Documentation' },
//   { href: '#', label: 'Building Your Application' },
//   { href: '#', label: 'Data Fetching' },
//   { label: 'Caching and Revalidating' },
// ];

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
          { index: true, element: <Navigate to="/youtube/search" replace /> },
          { path: 'search', element: <SearchVideo /> },
          { path: 'search/result', element: <SearchVideoResult /> },
          { path: 'saved-list', element: <SavedListPage /> },
        ],
      },
      {
        path: 'manage',
        element: null,
        children: [
          { index: true, element: <Navigate to="/manage/channels" replace /> },
          { path: 'channels', element: <ChannelsPage /> },
          { path: 'channels/:channelId', element: <ChannelDetailPage /> },
          { path: 'tags', element: <TagPage /> },
          { path: 'channels/edit', element: <ChannelsEditPage /> },
        ],
      },
      {
        path: 'lib',
        element: null,
        children: [
          { index: true, element: <Navigate to="/lib/prompts" replace /> },
          { path: 'prompts', element: <PromptsPage /> },
          { path: 'reference', element: <ReferencePage /> },
        ],
      },
      {
        path: 'english',
        element: null,
        children: [
          { index: true, element: <Navigate to="/english/patterns" replace /> },
          {
            path: 'words',
            element: <WordsLayout />,
            children: [
              { index: true, element: <CreatePage /> },
              { path: ':wordId', element: <DetailPage /> },
            ],
          },
          { path: 'notes', element: <NotesPage /> },
        ],
      },
      {
        path: 'settings',
        element: null,
        children: [
          { index: true, element: <Navigate to="/settings/youtube" replace /> },
          { path: 'youtube', element: <YouTubeAPISettings /> },
          { path: 'files', element: <FilesSettings /> },
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
