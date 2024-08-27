// import React from 'react'
import List from "../components/list/List.jsx";
import Chat from "../components/chat/Chat.jsx";
import Detail from "../components/detail/Detail.jsx";
import { useChatStore } from "../lib/chatStore.js";

const Home = () => {
  const { chatId } = useChatStore();
  return (
    <>
      <List />
      {chatId && <Chat />}
      {chatId && <Detail />}
    </>
  );
};

export default Home;
