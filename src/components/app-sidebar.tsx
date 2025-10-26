'use client';

import * as React from 'react';
import { BookOpen, Database, Languages, Settings2 } from 'lucide-react';

import { NavMain, NavMainType } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import useSettingStore from '@/store/useSettingStore.ts';
import { Youtube } from '@/assets/svg';
import { useNavigate } from 'react-router-dom';

// This is sample data.
const data: NavMainType = [
  {
    title: 'YouTube',
    url: '/search-videos',
    icon: Youtube,
    isActive: true,
    items: [
      {
        title: 'Search Videos',
        url: '/search-videos',
      },
      {
        title: 'Result',
        url: '/search-videos/result',
      },
      {
        title: 'Saved Results...',
        url: '/saved-results',
      },
    ],
  },
  {
    title: 'Management',
    url: '/channels',
    icon: Database,
    items: [
      {
        title: 'Channels',
        url: '/channels',
      },
      {
        title: 'Tags',
        url: '/tags',
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
        url: '/prompts',
      },
      {
        title: 'Reference',
        url: '/reference',
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
        url: '/settings',
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
        title: 'Buttons',
        url: '/settings/buttons',
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const hasApiKey = useSettingStore((s) => !!s.data.youtube.apiKey);
  const navigate = useNavigate();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          onClick={() => navigate('/')}
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600">
            <div className="relative">
              <Youtube className="h-4" />
              {hasApiKey && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
              )}
            </div>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">YouTube Searcher</span>
            <span className="truncate text-xs">private app</span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: 'Ref',
            email: 'ref@example.com',
            avatar: '/avatars/shadcn.jpg',
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// This is sample data.
// const data = {
//   user: {
//     name: 'shadcn',
//     email: 'm@example.com',
//     avatar: '/avatars/shadcn.jpg',
//   },
//   teams: [
//     {
//       name: 'Acme Inc',
//       logo: GalleryVerticalEnd,
//       plan: 'Enterprise',
//     },
//     {
//       name: 'Acme Corp.',
//       logo: AudioWaveform,
//       plan: 'Startup',
//     },
//     {
//       name: 'Evil Corp.',
//       logo: Command,
//       plan: 'Free',
//     },
//   ],
//   navMain: [
//     {
//       title: 'Playground',
//       url: '#',
//       icon: SquareTerminal,
//       isActive: true,
//       items: [
//         {
//           title: 'History',
//           url: '#',
//         },
//         {
//           title: 'Starred',
//           url: '#',
//         },
//         {
//           title: 'Settings',
//           url: '#',
//         },
//       ],
//     },
//     {
//       title: 'Models',
//       url: '#',
//       icon: Bot,
//       items: [
//         {
//           title: 'Genesis',
//           url: '#',
//         },
//         {
//           title: 'Explorer',
//           url: '#',
//         },
//         {
//           title: 'Quantum',
//           url: '#',
//         },
//       ],
//     },
//     {
//       title: 'Documentation',
//       url: '#',
//       icon: BookOpen,
//       items: [
//         {
//           title: 'Introduction',
//           url: '#',
//         },
//         {
//           title: 'Get Started',
//           url: '#',
//         },
//         {
//           title: 'Tutorials',
//           url: '#',
//         },
//         {
//           title: 'Changelog',
//           url: '#',
//         },
//       ],
//     },
//     {
//       title: 'Settings',
//       url: '#',
//       icon: Settings2,
//       items: [
//         {
//           title: 'General',
//           url: '#',
//         },
//         {
//           title: 'Team',
//           url: '#',
//         },
//         {
//           title: 'Billing',
//           url: '#',
//         },
//         {
//           title: 'Limits',
//           url: '#',
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: 'Design Engineering',
//       url: '#',
//       icon: Frame,
//     },
//     {
//       name: 'Sales & Marketing',
//       url: '#',
//       icon: PieChart,
//     },
//     {
//       name: 'Travel',
//       url: '#',
//       icon: Map,
//     },
//   ],
// };
//
// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar collapsible="icon" {...props}>
//       <SidebarHeader>
//         <TeamSwitcher teams={data.teams} />
//       </SidebarHeader>
//       <SidebarContent>
//         <NavMain items={data.navMain} />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//       <SidebarRail />
//     </Sidebar>
//   );
// }
