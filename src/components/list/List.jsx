// import React from 'react'
import ChatList from "./chatList/ChatList.jsx";
import UserInfo from "./userInfo/userInfo.jsx";

import "./list.css";

const List = () => {
  return (
    <div className="list">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;
