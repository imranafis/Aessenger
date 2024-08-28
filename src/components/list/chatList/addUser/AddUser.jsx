import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify";

const AddUser = ({ setAddMode }) => {
  const [users, setUsers] = useState([]);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("username").toLowerCase();

    try {
      const userRef = collection(db, "users");
      const querySnapShot = await getDocs(userRef);

      const userList = querySnapShot.docs
        .map((doc) => doc.data())
        .filter((user) => user.username.toLowerCase().includes(searchTerm));

      if (userList.length > 0) {
        setUsers(userList);
      } else {
        setUsers([]);
        toast.warn("No users found");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to search users. Please try again.");
    }
  };

  const handleAdd = async (e, user) => {
    e.preventDefault();
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userChats");

    const combinedId = `${user.id}_${currentUser.id}`;

    try {
      const existingChatDoc = await getDoc(doc(chatRef, combinedId));

      if (existingChatDoc.exists()) {
        toast.warning("User already exists!");
        setAddMode(false);
        console.log("Chat already exists, not creating a new one.");
        return;
      } else {
        const newChatRef = doc(chatRef, combinedId);

        toast.success("Adding user!");

        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
        });

        await updateDoc(doc(userChatsRef, user.id), {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: `${currentUser.username} added you in the chat`,
            receiverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        });

        await updateDoc(doc(userChatsRef, currentUser.id), {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: `${user.username} added in the chat`,
            receiverId: user.id,
            updatedAt: Date.now(),
          }),
        });

        toast.success("User added successfully!");

        // Close the AddUser component after successfully adding a user
        setAddMode(false);
      }
    } catch (err) {
      toast.error("Failed to add user. Please try again.");
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Username"
          name="username"
          autoComplete="off"
        />
        <button>Search</button>
      </form>
      {users.length > 0 &&
        users.map((user) => (
          <div key={user.id} className="user">
            <div className="detail">
              <img src={user.avatar || "./avatar.png"} alt="" />
              <span>{user.username}</span>
            </div>
            <button onClick={(e) => handleAdd(e, user)}>Add User</button>
          </div>
        ))}
    </div>
  );
};

export default AddUser;
