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

const AddUser = () => {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");

    try {
      const userRef = collection(db, "users");
      const userQuery = query(userRef, where("email", "==", email));

      const querySnapShot = await getDocs(userQuery);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAdd = async (e) => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userChats");

    try {
      const newChatRef = doc(chatRef);

      // Create a new chat document
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Reference to user chats documents
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

      // Update both user chat documents with the new chat info
      await updateDoc(userChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "New user added, Say Hi!",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(currentUserChatDocRef, {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "New user added, Say Hi!",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Email"
          name="email"
          autoComplete="off"
        />
        <button>Search</button>
      </form>
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
