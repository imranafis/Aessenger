// import React from 'react'
import Chat from "../components/Chat/Chat.jsx";
import List from "../components/list/List.jsx";
// import Detail from "../components/detail/Detail.jsx";
import { useChatStore } from "../lib/chatStore.js";

const Home = () => {
  const { chatId } = useChatStore();
  return (
    <>
      <List />
      {chatId && <Chat />}
      {/* {chatId && <Detail />} */}
    </>
  );
};

export default Home;
