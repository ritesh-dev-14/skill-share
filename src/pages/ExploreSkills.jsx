import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Compass, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { SkillTag } from "../components/Badge";

export default function ExploreSkills() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | teach | learn
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      // Fetch all profiles except me, with their skills
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, bio, location, avatar_url")
        .neq("id", user.id)
        .order("full_name", { ascending: true });

      const { data: allSkills } = await supabase
        .from("user_skills")
        .select("user_id, type, skills(id, name)");

      const skillsByUser = new Map();
      for (const s of allSkills || []) {
        if (!skillsByUser.has(s.user_id)) skillsByUser.set(s.user_id, []);
        skillsByUser.get(s.user_id).push({
          type: s.type,
          name: s.skills?.name || "",
        });
      }

      const enriched = (profiles || []).map((p) => ({
        ...p,
        skills: skillsByUser.get(p.id) || [],
      }));
      if (active) {
        setUsers(enriched);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const teachNames = u.skills.filter((s) => s.type === "teach").map((s) => s.name);
      const learnNames = u.skills.filter((s) => s.type === "learn").map((s) => s.name);
      const allNames = [...teachNames, ...learnNames];

      const matchesQuery =
        !q ||
        u.full_name?.toLowerCase().includes(q) ||
        allNames.some((n) => n.includes(q)) ||
        u.location?.toLowerCase().includes(q);

      const matchesFilter =
        filter === "all" ||
        (filter === "teach" && teachNames.some((n) => n.includes(q || ""))) ||
        (filter === "learn" && learnNames.some((n) => n.includes(q || "")));

      return matchesQuery && (q ? matchesFilter : true);
    });
  }, [users, query, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore Skills</h1>
        <p className="text-gray-500 mt-1">
          Discover people in the community by name, location, or skill.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, skill, or location..."
            className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition text-gray-900 bg-white"
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-300 rounded-lg p-1">
          {[
            { key: "all", label: "All" },
            { key: "teach", label: "Teaching" },
            { key: "learn", label: "Learning" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f.key
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Compass size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            No people found. Try a different search.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => {
            const teach = u.skills.filter((s) => s.type === "teach").map((s) => s.name);
            const learn = u.skills.filter((s) => s.type === "learn").map((s) => s.name);
            return (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-200 hover:shadow-sm transition group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={u.full_name} url={u.avatar_url} size={48} />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition">
                      {u.full_name || "Unnamed"}
                    </p>
                    {u.location && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <MapPin size={12} /> {u.location}
                      </p>
                    )}
                  </div>
                </div>
                {u.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{u.bio}</p>
                )}
                {teach.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">Teaches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teach.slice(0, 3).map((s) => (
                        <SkillTag key={s} name={s} type="teach" />
                      ))}
                      {teach.length > 3 && (
                        <span className="text-xs text-gray-400 self-center">
                          +{teach.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {learn.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Wants to learn</p>
                    <div className="flex flex-wrap gap-1.5">
                      {learn.slice(0, 3).map((s) => (
                        <SkillTag key={s} name={s} type="learn" />
                      ))}
                      {learn.length > 3 && (
                        <span className="text-xs text-gray-400 self-center">
                          +{learn.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-brand-700 font-medium flex items-center gap-1">
                  View profile <ArrowRight size={13} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
