import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify";

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchTerm = formData.get("username").toLowerCase();

    try {
      const userRef = collection(db, "users");
      const querySnapShot = await getDocs(userRef);

      // Filter users on the client side for a case-insensitive partial match
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
  const handleAdd = async (e) => {
    e.preventDefault();
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userChats");

    // Create a unique chat ID based on user IDs (e.g., combining them)
    const combinedUserId = [currentUser.id, user.id].sort().join("_");

    try {
      // Check if the chat already exists
      const chatDocRef = doc(chatRef, combinedUserId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        toast.warn("User already added");
        return; // Exit if chat already exists
      }

      // If chat doesn't exist, create a new chat document
      await setDoc(chatDocRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Reference to user chat documents
      const userChatDocRef = doc(userChatRef, user.id);
      const currentUserChatDocRef = doc(userChatRef, currentUser.id);

      // Get documents to check if they exist
      const userChatSnap = await getDoc(userChatDocRef);
      const currentUserChatSnap = await getDoc(currentUserChatDocRef);

      // If the document for the user doesn't exist, create it with initial data
      if (!userChatSnap.exists()) {
        await setDoc(userChatDocRef, {
          chats: [],
        });
      }

      if (!currentUserChatSnap.exists()) {
        await setDoc(currentUserChatDocRef, {
          chats: [],
        });
      }

      // Create chat data to be added
      const chatData = {
        chatId: combinedUserId,
        lastMessage: "New user added, Say Hi!",
        receiverId: user.id,
        updatedAt: Date.now(), // Temporarily use Date.now()
      };

      // Update both user chat documents with the new chat info (excluding serverTimestamp for now)
      await updateDoc(userChatDocRef, {
        chats: arrayUnion(chatData),
      });

      await updateDoc(currentUserChatDocRef, {
        chats: arrayUnion({ ...chatData, receiverId: currentUser.id }),
      });

      // Now update the `updatedAt` field with `serverTimestamp()`
      await updateDoc(userChatDocRef, {
        "chats.updatedAt": serverTimestamp(),
      });

      await updateDoc(currentUserChatDocRef, {
        "chats.updatedAt": serverTimestamp(),
      });

      toast.success("User added successfully!");
    } catch (error) {
      console.error("Error adding user: ", error);
      toast.error("Failed to add user. Please try again.");
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
            <button onClick={() => handleAdd(user)}>Add User</button>
          </div>
        ))}
    </div>
  );
};

export default AddUser;
