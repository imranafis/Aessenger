import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/login/InputField";
import "../components/login/login.css";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged, // Import the auth state listener
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import upload from "../lib/upload";
import { useUserStore } from "../lib/userStore";

const Login = () => {
  const { fetchUserInfo } = useUserStore();

  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
    setError("");
  };

  const handleUserRedirect = async (user) => {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));

      if (!docSnap.exists()) {
        const displayName = user.displayName || "";
        const photoURL = user.photoURL || "";

        let imgUrl = "";

        if (avatar.file) {
          imgUrl = await upload(avatar.file);
        } else if (photoURL) {
          imgUrl = await upload(photoURL);
        }

        await setDoc(doc(db, "users", user.uid), {
          username: displayName,
          avatar: imgUrl,
          email: user.email,
          id: user.uid,
          blocked: [],
        });

        await setDoc(doc(db, "userChats", user.uid), {
          chats: [],
        });

        await fetchUserInfo(user.uid);
      }
    } catch (error) {
      console.error("Error during Firestore operations:", error.message);
      setError(
        "Error during form submission: Missing or insufficient permissions."
      );
    }
  };

  const handleForgetPass = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset email sent!");
      toggleSection("login");
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
    }
  };

  const handleFormSubmit = async () => {
    try {
      if (activeSection === "login") {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log("Logged in:", user.uid);

        if (user.emailVerified) {
          await handleUserRedirect(user);
        } else {
          setError("Please verify your email first!");
        }
      } else if (activeSection === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        console.log("Signed up:", user.uid);

        await sendEmailVerification(user);
        alert(
          "Verification email sent! Please verify your email before proceeding."
        );
        toggleSection("login");
      }
    } catch (error) {
      console.error("Error during form submission:", error.code, error.message);
      const errorMsg = handleAuthError(error.code);
      setError(errorMsg);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Google Sign-In:", user.uid);
      await handleUserRedirect(user);
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
      setError("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <>
      <div className="auth-panel">
        <div className="intro">
          <div className="logo">
            <i className="fa-brands fa-nfc-symbol"></i>
          </div>
          <p className="text">You deserve it!</p>
        </div>
        <div className="formBtn" onClick={handleGoogleSignIn}>
          Login with Gmail
        </div>
        <div className="formBtn" onClick={() => toggleSection("login")}>
          Login with Email
        </div>
        {activeSection === "login" && (
          <div className="form">
            <form>
              <InputField
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="fas fa-envelope"
              />
              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon="fa-solid fa-lock"
              />
            </form>

            {/* Display error message if it exists */}
            {error && <div className="error">{error}</div>}

            <div id="goBtn" onClick={handleFormSubmit}>
              Go
            </div>
          </div>
        )}

        <div className="formBtn" onClick={() => toggleSection("signup")}>
          Sign-Up
        </div>
        {activeSection === "signup" && (
          <div className="form">
            <label htmlFor="file">
              <img src={avatar.url || "avatar.png"} alt="" />
              Upload an image
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />

            <form>
              <InputField
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon="fa-solid fa-user"
              />
              <InputField
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="fas fa-envelope"
              />
              <InputField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon="fa-solid fa-lock"
              />
            </form>

            {/* Display error message if it exists */}
            {error && <div className="error">{error}</div>}

            <div id="goBtn" onClick={handleFormSubmit}>
              Go
            </div>
          </div>
        )}

        <div id="forgetPassBtn" onClick={() => toggleSection("forgetpass")}>
          Forget Password
        </div>
        {activeSection === "forgetpass" && (
          <div className="form">
            <form>
              <InputField
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon="fas fa-envelope"
              ></InputField>
            </form>

            <div id="goBtn" onClick={handleForgetPass}>
              Go
            </div>
          </div>
        )}
      </div>
      {/* <div className="authAnimation-panel"></div> */}
    </>
  );
};

export default Login;
