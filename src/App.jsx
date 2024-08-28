import { useEffect } from "react";
import { useUserStore } from "./lib/userStore.js";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase.js";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Notification from "./components/notification/Notification.jsx";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  const router = createHashRouter([
    {
      path: "/",
      element: currentUser ? <Home /> : <Login />,
    },
    {
      path: "/home",
      element: currentUser ? <Home /> : <Navigate to="/" />,
    },

    {
      path: "*",
      element: <Navigate to="/" />, // Catch-all route
    },
  ]);

  return (
    <div className="container">
      <RouterProvider router={router} />
      <Notification />
    </div>
  );
};

export default App;
