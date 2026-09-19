import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, MessageSquare, ArrowLeft, Search } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { timeAgo } from "../lib/utils";

export default function Messages() {
  const { userId: activeId } = useParams();
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

  // Load accepted connections (people I can message)
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      // Accepted requests where I'm sender or receiver
      const { data: sent } = await supabase
        .from("exchange_requests")
        .select("receiver_id, status")
        .eq("sender_id", user.id)
        .eq("status", "accepted");
      const { data: received } = await supabase
        .from("exchange_requests")
        .select("sender_id, status")
        .eq("receiver_id", user.id)
        .eq("status", "accepted");

      const ids = new Set();
      (sent || []).forEach((r) => ids.add(r.receiver_id));
      (received || []).forEach((r) => ids.add(r.sender_id));

      if (ids.size === 0) {
        if (active) {
          setConnections([]);
          setLoading(false);
        }
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location")
        .in("id", Array.from(ids));

      if (active) {
        setConnections(profiles || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Load messages for active conversation
  useEffect(() => {
    if (!user || !activeId) {
      setMessages([]);
      setActiveUser(null);
      return;
    }
    let active = true;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, location")
        .eq("id", activeId)
        .maybeSingle();

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, content, created_at")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeId}),and(sender_id.eq.${activeId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });

      if (active) {
        setActiveUser(p);
        setMessages(msgs || []);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, activeId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    setSending(true);
    const content = text.trim();
    setText("");
    const { data } = await supabase
      .from("messages")
      .insert({ sender_id: user.id, receiver_id: activeId, content })
      .select("id, sender_id, receiver_id, content, created_at")
      .single();
    setSending(false);
    if (data) {
      setMessages((prev) => [...prev, data]);
    }
  }

  const filteredConnections = connections.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500 mt-1">
          Chat with people you've connected with.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : connections.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <MessageSquare size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            No conversations yet. You can message someone after they accept your
            skill exchange request.
          </p>
          <Link
            to="/requests"
            className="inline-flex items-center gap-1 mt-3 text-sm text-brand-700 font-medium hover:underline"
          >
            Go to Requests
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 flex h-[600px] overflow-hidden">
          {/* Conversation list */}
          <div className={`w-full md:w-72 border-r border-gray-200 flex flex-col ${activeId ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConnections.map((c) => (
                <Link
                  key={c.id}
                  to={`/messages/${c.id}`}
                  className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition border-b border-gray-50 ${
                    activeId === c.id ? "bg-brand-50" : ""
                  }`}
                >
                  <Avatar name={c.full_name} url={c.avatar_url} size={40} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.location || "No location"}
                    </p>
                  </div>
                </Link>
              ))}
              {filteredConnections.length === 0 && (
                <p className="text-sm text-gray-400 text-center p-6">No matches.</p>
              )}
            </div>
          </div>

          {/* Message thread */}
          {activeId && activeUser ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <Link to="/messages" className="md:hidden text-gray-500">
                  <ArrowLeft size={20} />
                </Link>
                <Avatar name={activeUser.full_name} url={activeUser.avatar_url} size={36} />
                <div>
                  <p className="font-medium text-gray-900">{activeUser.full_name}</p>
                  <Link
                    to={`/profile/${activeUser.id}`}
                    className="text-xs text-brand-700 hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-400">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}
                {messages.map((m) => {
                  const mine = m.sender_id === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${mine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          mine
                            ? "bg-brand-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[10px] mt-1 ${mine ? "text-brand-200" : "text-gray-400"}`}>
                          {timeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">
                  Select a conversation to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
