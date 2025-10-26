// Breadcrumbs.tsx
import * as React from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import useChannelStore from '@/store/useChannelStore'; // 채널명 조회용(선택)
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// 사이드바 네비 데이터
import { navigationRoutes } from '@/routes.tsx';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { useMemo } from 'react';

type Crumb = { label: string; href?: string };

const ITEMS_TO_DISPLAY = 3;

/** 경로 세그먼트 누적 링크 만들기 */
function buildSegments(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  const acc: string[] = [];
  parts.forEach((_, i) => {
    const seg = '/' + parts.slice(0, i + 1).join('/');
    acc.push(seg);
  });
  return acc.length === 0 ? ['/'] : acc;
}

/** navigationRoutes에서 가장 근접한 항목 레이블 찾기 */
function resolveLabelFromNav(path: string): string | null {
  // 1) 최상위
  for (const group of navigationRoutes) {
    if (group.url && matchPath({ path: group.url, end: true }, path)) return group.title;
    // 2) 하위
    for (const it of group.items ?? []) {
      if (it.url && matchPath({ path: it.url, end: true }, path)) return it.title;
    }
  }
  return null;
}

/** 동적 경로 레이블 보정 (예: /manage/channel/:channelId → 채널명) */
function useDynamicLabel(path: string): string | null {
  console.log(path);
  // 채널 상세
  const m = matchPath('/manage/channel/:channelId', path);
  const store = useChannelStore();
  if (m?.params.channelId) {
    const ch = store.data.find((c) => c.channelId === m.params.channelId);
    if (ch?.name) return ch.name;
    return m.params.channelId; // fallback
  }
  return null;
}

/** 현재 경로 → Crumb[] 생성 */
function useCrumbs(): Crumb[] {
  const { pathname } = useLocation();
  const segs = buildSegments(pathname);

  // 홈으로 가는 루트(선택)
  const roots: Crumb[] = pathname === '/' ? [{ label: 'Home' }] : [{ label: 'Home', href: '/' }];

  const crumbs: Crumb[] = segs.map((seg, i) => {
    // 먼저 동적 라벨 시도
    const dynamic = useDynamicLabel(seg);
    const label = dynamic ?? resolveLabelFromNav(seg) ?? seg.split('/').pop() ?? seg;
    const isLast = i === segs.length - 1;
    return isLast ? { label } : { label, href: seg };
  });

  // 중복 Home 방지
  if (pathname === '/') return roots;
  // 첫 세그가 /youtube 또는 /manage 등이라면 Home 뒤에 붙인다
  return [...roots, ...crumbs.filter((c) => !(c.href === '/'))];
}

/** 반응형 Breadcrumb */
export function BreadcrumbResponsive() {
  const { pathname } = useLocation();

  const path = useMemo(() => {
    const path = pathname.split('/');

    return [{ path: '', label: '' }];
  }, [pathname]);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        {pathname}
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
