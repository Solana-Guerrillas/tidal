"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ArrowsLeftRight,
  CaretDown,
  Waves,
  Lightning,
  ChatCircle,
  Plus,
  User,
  LinkSimple,
} from "@phosphor-icons/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalChatWorkspace } from "@/features/home/providers/global-chat-workspace-provider";
import { usePoolWorkspace } from "@/features/pool/providers/pool-workspace-provider";
import { cn } from "@/lib/utils";
import type { SidebarNavigation } from "@/mock-data/shell/types";

type AppSidebarProps = {
  navigation: SidebarNavigation;
};

export function AppSidebar({ navigation }: AppSidebarProps) {
  const pathname = usePathname();
  const isPoolRoute = pathname.startsWith("/pool");
  const [isPoolExpanded, setIsPoolExpanded] = useState(true);
  const { activeChat, chats, setActiveChatId } = useGlobalChatWorkspace();
  const {
    workspace,
    isOverviewActive,
    activeThread,
    showOverview,
    setActiveThreadId,
  } = usePoolWorkspace();

  const poolChatItems = workspace.threads.map((thread) => ({
    title: thread.title,
    href: "/pool",
    id: thread.id,
  }));

  const globalChats = chats.map((chat) => ({
    ...chat,
    href: chat.href ?? "/",
  }));

  return (
    <Sidebar
      collapsible="offcanvas"
      className="top-14 h-[calc(100svh-3.5rem)] border-t border-tidal-border"
    >
      <SidebarHeader className="h-3 p-0" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/" />}
                tooltip="New"
                className="tidal-sidebar-primary-action"
                isActive={pathname === "/"}
                onClick={() => setActiveChatId("global-chat-new")}
              >
                <Plus weight="bold" />
                <span>New</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Tidal Swap"
                className="tidal-sidebar-item"
              >
                <ArrowsLeftRight weight="bold" className="text-tidal-accent" />
                <span className="text-tidal-accent">Tidal Swap</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="tidal-sidebar-group-title">
            <Waves weight="bold" className="mr-2" />
            Tidal Pool
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-1">
                  <SidebarMenuButton
                    render={<Link href="/pool" />}
                    tooltip={workspace.name}
                    className="tidal-sidebar-item flex-1"
                    isActive={isPoolRoute && isOverviewActive}
                    onClick={showOverview}
                  >
                    <span>{workspace.name}</span>
                  </SidebarMenuButton>

                  <button
                    type="button"
                    aria-label={isPoolExpanded ? "Collapse pool chats" : "Expand pool chats"}
                    aria-expanded={isPoolExpanded}
                    onClick={() => setIsPoolExpanded((current) => !current)}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-tidal-accent transition-colors hover:bg-tidal-sidebar-active hover:text-foreground"
                  >
                    <CaretDown
                      weight="bold"
                      className={cn(
                        "transition-transform",
                        isPoolExpanded ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </button>
                </div>

                {isPoolExpanded ? (
                  <SidebarMenuSub>
                    {poolChatItems.map((item) => (
                      <SidebarMenuSubItem key={item.id}>
                        <SidebarMenuSubButton
                          render={<Link href="/pool" />}
                          isActive={isPoolRoute && item.id === activeThread.id}
                          onClick={() => setActiveThreadId(item.id)}
                          className="cursor-pointer text-sidebar-foreground hover:text-foreground data-active:text-tidal-accent"
                        >
                          <span>{item.title}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="tidal-sidebar-group-title">
            <Lightning weight="bold" className="mr-2" />
            Tidal Amplify
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.amplifyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.href ?? "/amplify"} />}
                    tooltip={item.title}
                    className="tidal-sidebar-subitem"
                  >
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="tidal-sidebar-group-title">
            <ChatCircle weight="bold" className="mr-2" />
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {globalChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                    <SidebarMenuButton
                      render={<Link href={chat.href} />}
                      tooltip={chat.preview}
                      className="tidal-sidebar-subitem flex-1"
                      isActive={pathname === chat.href && chat.id === activeChat.id}
                      onClick={() => setActiveChatId(chat.id)}
                    >
                      <span>{chat.title}</span>
                    </SidebarMenuButton>

                    {chat.links.length > 0 ? (
                      <Tooltip>
                        <TooltipTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-tidal-muted transition-colors hover:bg-tidal-sidebar-active hover:text-tidal-accent">
                          <LinkSimple weight="bold" className="h-3.5 w-3.5" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          align="start"
                          className="max-w-[18rem] flex-col items-start gap-2 rounded-lg border border-tidal-border bg-tidal-card px-3 py-2 text-tidal-card-foreground"
                        >
                          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-tidal-muted">
                            Linked context
                          </p>
                          <div className="flex flex-col gap-1">
                            {chat.links.map((link) => (
                              <span
                                key={link.id}
                                className="text-xs leading-tight text-foreground"
                              >
                                {link.label}
                              </span>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>

                  <div className="hidden group-data-[collapsible=icon]:block">
                    <SidebarMenuButton
                      render={<Link href={chat.href} />}
                      tooltip={chat.title}
                      className="tidal-sidebar-subitem"
                      isActive={pathname === chat.href && chat.id === activeChat.id}
                      onClick={() => setActiveChatId(chat.id)}
                    >
                      <span>{chat.title}</span>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Card
          size="sm"
          className="bg-tidal-card ring-tidal-border group-data-[collapsible=icon]:hidden"
        >
          <CardContent className="flex items-center gap-3">
            <div className="tidal-user-avatar">
              <User weight="bold" className="h-4 w-4 text-tidal-card" />
            </div>
            <span className="tidal-text-body truncate text-sidebar-foreground">
              {navigation.userName}
            </span>
          </CardContent>
        </Card>
        <div className="hidden group-data-[collapsible=icon]:flex justify-center">
          <div className="tidal-user-avatar">
            <User weight="bold" className="h-4 w-4 text-tidal-card" />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
