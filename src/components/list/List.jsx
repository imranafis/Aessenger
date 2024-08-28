// import React from 'react'
import ChatList from "./chatList/ChatList.jsx";
import UserInfo from "./userInfo/userInfo.jsx";

import "./list.css";
import { useChatStore } from "../../lib/chatStore.js";

const List = () => {
  const { chatId } = useChatStore();
  return (
    <div className={`list ${chatId ? "chat-activate" : ""}`}>
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;
