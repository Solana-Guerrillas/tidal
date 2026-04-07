"use client";

import Link from "next/link";

import {
  ArrowsLeftRight,
  Waves,
  Lightning,
  ChatCircle,
  Plus,
  User,
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
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import type { SidebarNavigation } from "@/mock-data/shell/types";

type AppSidebarProps = {
  navigation: SidebarNavigation;
};

export function AppSidebar({ navigation }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link
          href="/"
          className="tidal-sidebar-brand group-data-[collapsible=icon]:text-center group-data-[collapsible=icon]:text-sm"
        >
          <span className="group-data-[collapsible=icon]:hidden">Tidal</span>
          <span className="hidden group-data-[collapsible=icon]:inline">T</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/" />}
                tooltip="New"
                className="tidal-sidebar-primary-action"
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
              {navigation.poolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
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
            <SidebarMenu>
              {navigation.chatItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
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
