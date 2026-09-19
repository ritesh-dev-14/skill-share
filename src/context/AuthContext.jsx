import { createContext, useContext, useEffect, useState } from "react";
import { getData, getSession, makeId, publicUser, saveData, setSession } from "../lib/localStore";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(() => getData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentUser(getSession());
    setLoading(false);
  }, []);

  function updateData(nextData) {
    setData(saveData(nextData));
  }

  async function signUp(email, password, fullName) {
    if (data.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
      return { error: { message: "An account with this email already exists." } };
    }
    const user = { id: makeId("user"), email, password, full_name: fullName, bio: "", location: "", avatar_url: "", skills: [] };
    updateData({ ...data, users: [...data.users, user] });
    setSession(user.id);
    setCurrentUser(user);
    return { error: null };
  }

  async function signIn(email, password) {
    const user = data.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.password === password);
    if (!user) return { error: { message: "Email or password is incorrect." } };
    setSession(user.id);
    setCurrentUser(user);
    return { error: null };
  }

  async function signOut() {
    setSession(null);
    setCurrentUser(null);
  }

  function updateProfile(changes) {
    const updated = data.users.map((user) => user.id === currentUser.id ? { ...user, ...changes } : user);
    updateData({ ...data, users: updated });
    setCurrentUser({ ...currentUser, ...changes });
  }

  function addSkill(name, type) {
    const skill = { id: makeId("skill"), name: name.trim(), type };
    updateProfile({ skills: [...(currentUser.skills || []), skill] });
  }

  function removeSkill(skillId) {
    updateProfile({ skills: (currentUser.skills || []).filter((skill) => skill.id !== skillId) });
  }

  function sendRequest(receiverId, message) {
    const request = { id: makeId("request"), sender_id: currentUser.id, receiver_id: receiverId, message, status: "pending", created_at: new Date().toISOString() };
    updateData({ ...data, requests: [...data.requests, request] });
  }

  function updateRequest(requestId, status) {
    updateData({ ...data, requests: data.requests.map((request) => request.id === requestId ? { ...request, status } : request) });
  }

  function sendMessage(receiverId, content) {
    const message = { id: makeId("message"), sender_id: currentUser.id, receiver_id: receiverId, content, created_at: new Date().toISOString() };
    updateData({ ...data, messages: [...data.messages, message] });
    return message;
  }

  const value = {
    user: currentUser,
    profile: publicUser(currentUser),
    loading,
    data,
    signUp,
    signIn,
    signOut,
    updateProfile,
    addSkill,
    removeSkill,
    sendRequest,
    updateRequest,
    sendMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
