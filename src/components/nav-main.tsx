import { ChevronRight, type LucideIcon } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

export type NavMainType = {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items: {
    title: string;
    url: string;
    hidden?: boolean;
    prefix?: string;
    suffix?: string;
  }[];
}[];

export function NavMain({ items }: { items: NavMainType }) {
  const navigate = useNavigate();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Private App</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items
                    ?.filter((v) => !v.hidden)
                    .map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <span className={'cursor-pointer'} onClick={() => navigate(subItem.url)}>
                            {subItem.prefix && `${subItem.prefix} `}
                            {subItem.title}
                            {subItem.suffix && ` ${subItem.suffix}`}
                          </span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
