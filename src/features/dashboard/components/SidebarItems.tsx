"use client";

import * as LucideReact from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { ViewsResponseMenuChild } from "../../views/lib/views.interface";

export default function renderSidebarItems(
  items: ViewsResponseMenuChild[],
  company: string | number,
  moduleSlug: string,
  subModuleSlug: string = "",
  currentView?: ViewsResponseMenuChild | null,
  isTopLevel: boolean = true
) {
  return items.map((item) => (
    <SidebarItem
      key={item.id}
      item={item}
      company={company}
      moduleSlug={moduleSlug}
      subModuleSlug={subModuleSlug}
      currentView={currentView}
      isTopLevel={isTopLevel}
    />
  ));
}

function SidebarItem({
  item,
  company,
  moduleSlug,
  subModuleSlug,
  currentView,
  isTopLevel,
}: {
  item: ViewsResponseMenuChild;
  company: string | number;
  moduleSlug: string;
  subModuleSlug: string;
  currentView?: ViewsResponseMenuChild | null;
  isTopLevel: boolean;
}) {
  const { setOpenMobile, isMobile, state, setOpen } = useSidebar();
  const hasChildren = item.children && item.children.length > 0;

  const IconComponent = LucideReact[
    item.icon ?? "CircleDot"
  ] as React.ComponentType<any>;

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else if (state === "collapsed") {
      setOpen(true);
    }
  };

  if (hasChildren) {
    return (
      <Collapsible defaultOpen className="group/collapsible">
        <SidebarMenuItem className="p-0">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              tooltip={item.descripcion}
              className="group/label text-sm"
            >
              {IconComponent ? (
                <IconComponent className="size-4 shrink-0" />
              ) : (
                <LucideReact.User className="size-4 shrink-0" />
              )}
              <span className="truncate text-sm">{item.descripcion}</span>
              <LucideReact.ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <SidebarMenuSub className="pr-0 mr-0">
              <SidebarMenu>
                {renderSidebarItems(
                  item.children,
                  company,
                  moduleSlug,
                  subModuleSlug,
                  currentView,
                  false
                )}
              </SidebarMenu>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  const linkTo = subModuleSlug
    ? `/${company}/${moduleSlug}/${subModuleSlug}/${item.route}`
    : `/${company}/${moduleSlug}/${item.route}`;

  const icon = IconComponent ? (
    <IconComponent className="size-4 shrink-0" />
  ) : (
    <LucideReact.User className="size-4 shrink-0" />
  );

  if (isTopLevel) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={item.id === currentView?.id}
          tooltip={item.descripcion}
          className="py-0 h-7"
        >
          <Link to={linkTo} onClick={handleLinkClick}>
            {icon}
            <span className="truncate text-sm">{item.descripcion}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={item.id === currentView?.id}>
        <Link to={linkTo} onClick={handleLinkClick}>
          {icon}
          <span className="truncate">{item.descripcion}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
