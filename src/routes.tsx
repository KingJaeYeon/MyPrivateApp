import { Navigate, RouteObject } from 'react-router-dom';
import App from '@/App';
// import ReferencePage from '@/pages/lib/reference/ReferencePage.tsx';
import NotFound from '@/pages/NotFound.tsx';
import { NavMainType } from '@/components/nav-main.tsx';
import { Youtube } from '@/assets/svg';
import { BookOpen, Database, Languages, Settings } from 'lucide-react';

import { lazy, Suspense } from 'react';

const Home = lazy(() => import('@/pages/home/Home.tsx'));
const SearchVideo = lazy(() => import('@/pages/youtube/search-video/SearchVideo.tsx'));
const SearchVideoResult = lazy(
  () => import('@/pages/youtube/search-video-result/SearchVideoResult.tsx')
);
const SavedListPage = lazy(() => import('@/pages/youtube/saved-list/SavedListPage.tsx'));
const ChannelsPage = lazy(() => import('@/pages/management/channels/ChannelsPage.tsx'));
const ChannelDetailPage = lazy(
  () => import('@/pages/management/channel-detail/ChannelDetailPage.tsx')
);
const TagPage = lazy(() => import('@/pages/management/tag/TagPage.tsx'));
const ChannelsEditPage = lazy(() => import('@/pages/management/channel-edit/ChannelsEditPage.tsx'));
const PromptsPage = lazy(() => import('@/pages/lib/prompts/PromptsPage.tsx'));
const ReferenceEditPage = lazy(() => import('@/pages/lib/reference-edit/ReferenceEditPage.tsx'));
const DashboardPage = lazy(() => import('@/pages/english/dashboard/DashboardPage.tsx'));
const WordsLayout = lazy(() => import('@/pages/english/words/WordsLayout.tsx'));
const WordCreatePage = lazy(() => import('@/pages/english/words/WordCreatePage.tsx'));
const WordDetailPage = lazy(() => import('@/pages/english/words/WordDetailPage.tsx'));
const NotesLayout = lazy(() => import('@/pages/english/notes/NotesLayout.tsx'));
const NoteCreatePage = lazy(() => import('@/pages/english/notes/NoteCreatePage.tsx'));
const NoteDetailPage = lazy(() => import('@/pages/english/notes/NoteDetailPage.tsx'));
const YouTubeAPISettings = lazy(
  () => import('@/pages/settings/youtube-api/YouTubeAPISettings.tsx')
);
const FilesSettings = lazy(() => import('@/pages/settings/LocationFile/FilesSettings.tsx'));
const AdvancedSettings = lazy(() => import('@/pages/settings/AdvancedSettings.tsx'));

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
      // {
      //   title: 'Edit',
      //   url: '/lib/reference/edit',
      //   suffix: 'Reference',
      // },
    ],
  },
  {
    title: 'English',
    url: '/english',
    icon: Languages,
    items: [
      {
        title: 'DashBoard',
        url: '/english/dashboard',
      },
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
    icon: Settings,
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

// Suspense wrapper
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>{element}</Suspense>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: withSuspense(<Home />) },
      {
        path: 'youtube',
        element: null,
        children: [
          { index: true, element: <Navigate to="/youtube/search" replace /> },
          { path: 'search', element: withSuspense(<SearchVideo />) },
          { path: 'search/result', element: withSuspense(<SearchVideoResult />) },
          { path: 'saved-list', element: withSuspense(<SavedListPage />) },
        ],
      },
      {
        path: 'manage',
        element: null,
        children: [
          { index: true, element: <Navigate to="/manage/channels" replace /> },
          { path: 'channels', element: withSuspense(<ChannelsPage />) },
          { path: 'channels/:channelId', element: withSuspense(<ChannelDetailPage />) },
          { path: 'tags', element: withSuspense(<TagPage />) },
          { path: 'channels/edit', element: withSuspense(<ChannelsEditPage />) },
        ],
      },
      {
        path: 'lib',
        element: null,
        children: [
          { index: true, element: <Navigate to="/lib/prompts" replace /> },
          { path: 'prompts', element: withSuspense(<PromptsPage />) },
          { path: 'reference', element: withSuspense(<ReferenceEditPage />) },
        ],
      },
      {
        path: 'english',
        element: null,
        children: [
          { index: true, element: <Navigate to="/english/dashboard" replace /> },
          { path: 'dashboard', element: withSuspense(<DashboardPage />) },
          {
            path: 'words',
            element: withSuspense(<WordsLayout />),
            children: [
              { index: true, element: withSuspense(<WordCreatePage />) },
              { path: ':wordId', element: withSuspense(<WordDetailPage />) },
            ],
          },
          {
            path: 'notes',
            element: withSuspense(<NotesLayout />),
            children: [
              { index: true, element: withSuspense(<NoteCreatePage />) },
              { path: ':noteId', element: withSuspense(<NoteDetailPage />) },
            ],
          },
        ],
      },
      {
        path: 'settings',
        element: null,
        children: [
          { index: true, element: <Navigate to="/settings/youtube" replace /> },
          { path: 'youtube', element: withSuspense(<YouTubeAPISettings />) },
          { path: 'files', element: withSuspense(<FilesSettings />) },
          { path: 'advanced', element: withSuspense(<AdvancedSettings />) },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];
