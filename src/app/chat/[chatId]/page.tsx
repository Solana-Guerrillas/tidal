import { HomeScreen } from "@/features/home/screens/home-screen";
import { globalChats } from "@/mock-data/shell/mocks/hybrid-chat";

export default function GlobalChatPage() {
  return <HomeScreen />;
}

export function generateStaticParams() {
  return globalChats
    .filter((chat) => chat.messages.length > 0)
    .map((chat) => ({
      chatId: chat.id,
    }));
}
