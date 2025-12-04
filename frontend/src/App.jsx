import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios";

import SignupForm from "./pages/SignupForm";
import LoginForm from "./pages/login";
import VerifyEmailPage from "./pages/VerifyPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./components/Privateroutes";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import Profile from "./pages/profile";
import Connections from "./pages/connections";
import MeetHome from "./pages/Meet";
import MeetingRoom from "./pages/Meet/Room";
import Chat from "./pages/Chat";
import Subscription from "./pages/Subscription";

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/auth/me");
        console.log("Fetched current user:", res.data);
        setUser(res.data);
      } catch (err) {
        console.log("User not logged in", err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:3000/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUser(null);
    window.location.href = "/login";
  };

  if (loadingUser) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<SignupForm />} />
        <Route path="/signup" element={<SignupForm />} />

        <Route path="/login" element={<LoginForm setUser={setUser} />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route
          element={
            <PrivateRoute user={user}>
              <Layout onLogout={handleLogout} />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/connections" element={<Connections />} />
          <Route path="/meet" element={<MeetHome />} />
          <Route path="/meet/:id" element={<MeetingRoom />} />
          <Route path="/chat" element={<Chat user={user} setUser={setUser} />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
