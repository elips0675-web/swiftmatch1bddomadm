import { useParams } from "react-router-dom";
import ChatPage from "./chats-chatId";

export default function ChatRouteAdapter() {
  const { chatId = "" } = useParams<{ chatId: string }>();
  return <ChatPage params={{ chatId }} />;
}
