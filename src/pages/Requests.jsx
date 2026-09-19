import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, Check, X, MessageSquare, ArrowRight, Clock } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { timeAgo } from "../lib/utils";

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState("received"); // received | sent
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const filter = tab === "received" ? "receiver_id" : "sender_id";
      const otherCol = tab === "received" ? "sender" : "receiver";
      const fk =
        tab === "received"
          ? "exchange_requests_sender_id_fkey"
          : "exchange_requests_receiver_id_fkey";
      const { data } = await supabase
        .from("exchange_requests")
        .select(
          `id, status, message, created_at, ${otherCol}:profiles!${fk}(id, full_name, avatar_url, location)`
        )
        .eq(filter, user.id)
        .order("created_at", { ascending: false });
      if (active) {
        setRequests(data || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, tab]);

  async function updateStatus(reqId, status) {
    const { error } = await supabase
      .from("exchange_requests")
      .update({ status })
      .eq("id", reqId);
    if (!error) {
      setRequests((prev) => prev.map((r) => (r.id === reqId ? { ...r, status } : r)));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Requests</h1>
        <p className="text-gray-500 mt-1">
          Manage your incoming and outgoing skill exchange requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        {[
          { key: "received", label: "Received" },
          { key: "sent", label: "Sent" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === t.key ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Inbox size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {tab === "received"
              ? "No incoming requests yet."
              : "You haven't sent any requests yet."}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1 mt-3 text-sm text-brand-700 font-medium hover:underline"
          >
            Explore skills <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const other = r.sender || r.receiver;
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <Link to={`/profile/${other?.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={other?.full_name} url={other?.avatar_url} size={44} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate hover:text-brand-700 transition">
                      {other?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} /> {timeAgo(r.created_at)}
                    </p>
                  </div>
                </Link>

                {r.message && (
                  <p className="text-sm text-gray-600 sm:max-w-xs truncate italic">
                    "{r.message}"
                  </p>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {r.status === "pending" && tab === "received" && (
                    <>
                      <button
                        onClick={() => updateStatus(r.id, "accepted")}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition"
                      >
                        <Check size={16} /> Accept
                      </button>
                      <button
                        onClick={() => updateStatus(r.id, "rejected")}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                      >
                        <X size={16} /> Decline
                      </button>
                    </>
                  )}
                  {r.status === "pending" && tab === "sent" && (
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Clock size={13} /> Pending
                    </span>
                  )}
                  {r.status === "accepted" && (
                    <>
                      <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-700">
                        Accepted
                      </span>
                      <Link
                        to={`/messages/${other?.id}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
                      >
                        <MessageSquare size={15} /> Message
                      </Link>
                    </>
                  )}
                  {r.status === "rejected" && (
                    <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-gray-100 text-gray-500">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
