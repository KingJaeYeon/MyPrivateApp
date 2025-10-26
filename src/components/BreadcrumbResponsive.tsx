import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
// 사이드바 네비 데이터
import { navigationRoutes } from '@/routes.tsx';
import { SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Separator } from '@/components/ui/separator.tsx';

const ITEMS_TO_DISPLAY = 3;

type BreadcrumbPath = {
  label: string;
  href?: string;
};

/** 반응형 Breadcrumb */
export function BreadcrumbResponsive() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [open, setOpen] = useState(false);

  // navigationRoutes를 flat한 배열로 변환 (hidden 포함)
  const routeMap = useMemo(() => {
    const map: Array<{ label: string; href: string }> = [];

    navigationRoutes.forEach((route) => {
      // 상위 route 추가
      map.push({ label: route.title, href: route.url });

      // 하위 items 추가 (hidden 포함)
      if (route.items) {
        route.items.forEach((item) => {
          map.push({ label: item.title, href: item.url });
        });
      }
    });

    return map;
  }, []);

  // 현재 경로를 breadcrumb path로 변환
  const breadcrumbPath = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const paths: BreadcrumbPath[] = [];

    let accumulatedPath = '';
    segments.forEach((segment, index) => {
      accumulatedPath += `/${segment}`;

      // 먼저 정확한 경로 매칭 시도
      let route = routeMap.find((r) => r.href === accumulatedPath);

      // 못 찾으면 동적 파라미터 패턴으로 시도
      if (!route) {
        const dynamicPath = accumulatedPath.replace(segment, `:${segment}`);
        route = routeMap.find((r) => r.href === dynamicPath);

        // 동적 라우트 찾았으면 실제 params 값으로 label 설정
        if (route && params[segment]) {
          paths.push({
            label: params[segment],
            href: index === segments.length - 1 ? undefined : accumulatedPath,
          });
          return;
        }
      }

      // 마지막 segment는 href 없음 (현재 페이지)
      paths.push({
        label: route?.label || segment,
        href: index === segments.length - 1 ? undefined : accumulatedPath,
      });
    });

    return paths;
  }, [pathname, params, routeMap]);

  // ellipsis에 표시할 중간 항목들
  const hiddenItems = breadcrumbPath.length > ITEMS_TO_DISPLAY ? breadcrumbPath.slice(1, -2) : [];

  // 화면에 표시할 항목들 (첫 번째 + 마지막 2개)
  const visibleItems =
    breadcrumbPath.length > ITEMS_TO_DISPLAY
      ? [breadcrumbPath[0], ...breadcrumbPath.slice(-2)]
      : breadcrumbPath;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {/* 첫 번째 항목 */}
            {visibleItems.length > 0 && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink>{visibleItems[0].label}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}

            {/* 중간 항목 (ellipsis) */}
            {hiddenItems.length > 0 && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger className="flex items-center gap-1" aria-label="더 보기">
                      <BreadcrumbEllipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {hiddenItems.map((item, index) => (
                        <DropdownMenuItem key={index}>
                          <a href={item.href || '#'}>{item.label}</a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}

            {/* 마지막 2개 항목 (또는 전체) */}
            {visibleItems.slice(1).map((item, index) => (
              <BreadcrumbItem key={index}>
                {item.href ? (
                  <>
                    <BreadcrumbLink
                      className="max-w-20 truncate md:max-w-none"
                      onClick={() => navigate(item.href!)}
                    >
                      {item.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage className="max-w-20 truncate md:max-w-none">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
