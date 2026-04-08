import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalChatWorkspaceProvider } from "@/features/home/providers/global-chat-workspace-provider";
import { PoolWorkspaceProvider } from "@/features/pool/providers/pool-workspace-provider";
import { AppHeader } from "@/features/shell/components/app-header";
import { AppSidebar } from "@/features/shell/components/app-sidebar";
import { PreferenceProfileProvider } from "@/features/shell/providers/preference-profile-provider";
import { sidebarNavigation } from "@/mock-data/shell/mocks/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tidal",
  description: "AI-powered DeFi investment on Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <PreferenceProfileProvider>
            <GlobalChatWorkspaceProvider>
              <PoolWorkspaceProvider>
                <SidebarProvider>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <AppHeader navigation={sidebarNavigation} />
                    <div className="flex flex-1 overflow-hidden">
                      <AppSidebar navigation={sidebarNavigation} />
                      <main className="flex flex-1 flex-col overflow-auto">
                        {children}
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </PoolWorkspaceProvider>
            </GlobalChatWorkspaceProvider>
          </PreferenceProfileProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
