import { Link } from "react-router-dom";
import {
  Compass,
  Inbox,
  MessageSquare,
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { SkillTag } from "../components/Badge";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ teach: 0, learn: 0, requests: 0, connections: 0 });
  const [recommendations, setRecommendations] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      // My skills
      const { data: mySkills } = await supabase
        .from("user_skills")
        .select("id, type, skill_id, skills(id, name)")
        .eq("user_id", user.id);

      const teachNames = (mySkills || [])
        .filter((s) => s.type === "teach")
        .map((s) => s.skills?.name)
        .filter(Boolean);
      const learnNames = (mySkills || [])
        .filter((s) => s.type === "learn")
        .map((s) => s.skills?.name)
        .filter(Boolean);

      // Requests counts
      const { count: pendingCount } = await supabase
        .from("exchange_requests")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      const { count: acceptedCount } = await supabase
        .from("exchange_requests")
        .select("*", { count: "exact", head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (active) {
        setStats({
          teach: teachNames.length,
          learn: learnNames.length,
          requests: pendingCount || 0,
          connections: acceptedCount || 0,
        });
      }

      // Recent requests (received)
      const { data: reqs } = await supabase
        .from("exchange_requests")
        .select("id, status, created_at, sender:profiles!exchange_requests_sender_id_fkey(id, full_name, avatar_url, location)")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (active) setRecentRequests(reqs || []);

      // Recommendations: users whose teach skill matches my learn skill
      let recs = [];
      if (learnNames.length > 0) {
        const { data: matches } = await supabase
          .from("user_skills")
          .select("user_id, type, skills(id, name), profiles!user_skills_user_id_fkey(id, full_name, avatar_url, location)")
          .eq("type", "teach")
          .in(
            "skill_id",
            (mySkills || []).filter((s) => s.type === "learn").map((s) => s.skill_id)
          )
          .neq("user_id", user.id)
          .limit(6);
        const seen = new Map();
        for (const m of matches || []) {
          if (!seen.has(m.user_id)) {
            seen.set(m.user_id, {
              id: m.profiles?.id,
              full_name: m.profiles?.full_name,
              avatar_url: m.profiles?.avatar_url,
              location: m.profiles?.location,
              matchedSkill: m.skills?.name,
            });
          }
        }
        recs = Array.from(seen.values()).slice(0, 4);
      }
      if (active) {
        setRecommendations(recs);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const statCards = [
    { label: "Skills I teach", value: stats.teach, icon: GraduationCap, color: "bg-brand-50 text-brand-600" },
    { label: "Skills I learn", value: stats.learn, icon: BookOpen, color: "bg-green-50 text-green-600" },
    { label: "Pending requests", value: stats.requests, icon: Inbox, color: "bg-amber-50 text-amber-600" },
    { label: "Connections", value: stats.connections, icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's an overview of your SkillSwap activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
          </div>
          <Link to="/explore" className="text-sm text-brand-700 font-medium hover:underline flex items-center gap-1">
            Explore all <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              Add skills you want to learn on your profile, and we'll recommend
              people who can teach them.
            </p>
            <Link
              to="/profile"
              className="inline-flex items-center gap-1 mt-3 text-sm text-brand-700 font-medium hover:underline"
            >
              Update my skills <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendations.map((r) => (
              <Link
                key={r.id}
                to={`/profile/${r.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition"
              >
                <Avatar name={r.full_name} url={r.avatar_url} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{r.full_name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {r.location || "No location"}
                  </p>
                  <div className="mt-1.5">
                    <SkillTag name={r.matchedSkill} type="teach" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Inbox size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recent requests</h2>
          </div>
          <Link to="/requests" className="text-sm text-brand-700 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-500 text-sm">
              No incoming requests yet. Explore skills to find people to connect
              with.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 mt-3 text-sm text-brand-700 font-medium hover:underline"
            >
              <Compass size={15} /> Explore skills
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentRequests.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-4">
                <Avatar name={r.sender?.full_name} url={r.sender?.avatar_url} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.sender?.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    wants to connect with you
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    r.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : r.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
