import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import ExploreSkills from "./pages/ExploreSkills";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import Messages from "./pages/Messages";
import FullScreenLoader from "./components/FullScreenLoader";

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route element={user ? <AppLayout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/explore" element={<ExploreSkills />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/messages/:userId" element={<Messages />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
