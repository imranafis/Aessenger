import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";
import "./chat.css";

import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const textField = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUsserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
    textField.current.focus();
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  const handleSend = async () => {
    if (text === "" && !img.file) {
      return;
    }

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messeges: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userChats", id);
        const userChatSnapshot = await getDoc(userChatRef);

        if (userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId == chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user.avatar || "./avatar.png"} alt="" />

          <div className="texts">
            <span>{user.username}</span>
            {/* <p>Random some texts for texting the chat</p> */}
          </div>
        </div>
        <div className="icons">
          {/* <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" /> */}
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messeges?.map((message) => (
          <div
            className={
              message.senderId === currentUser.id ? "message own" : "message"
            }
            key={message?.createdAt}
          >
            {message.senderId === user.id && (
              <img src={user.avatar || "./avatar.png"} alt="" />
            )}

            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.text !== "" && <p>{message.text}</p>}
              {/* <span>{format(message.createdAt.toDate())}</span> */}
            </div>
          </div>
        ))}
        {/* {img.url && (
          <div className="message Own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )} */}

        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          {/* <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" /> */}
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUsserBlocked || isReceiverBlocked
              ? "You cannot send a message!"
              : "Type a message..."
          }
          value={text}
          ref={textField}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUsserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUsserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
